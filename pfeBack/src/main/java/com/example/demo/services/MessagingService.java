package com.example.demo.services;

import com.example.demo.entity.Conversation;
import com.example.demo.entity.DirectMessage;
import com.example.demo.entity.User;
import com.example.demo.dto.DirectMessageDto;
import com.example.demo.repositories.ConversationRepository;
import com.example.demo.repositories.DirectMessageRepository;
import com.example.demo.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;






import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

import java.util.Locale;
@Service
public class MessagingService {

    private static final Logger log = LoggerFactory.getLogger(MessagingService.class);

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private DirectMessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MediaStorageService mediaStorageService;

    // =========================
    // Conversation
    // =========================

    public Conversation findOrCreateConversation(Long myUserId, Long targetUserId) {

        if (myUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot message yourself");
        }

        long[] pair = Conversation.orderedPair(myUserId, targetUserId);

        return conversationRepository
                .findByUserLowerIdAndUserHigherId(pair[0], pair[1])
                .orElseGet(() -> {
                    Conversation c = new Conversation();
                    c.setUserLowerId(pair[0]);
                    c.setUserHigherId(pair[1]);
                    c.setLastActivityAt(LocalDateTime.now());
                    return conversationRepository.save(c);
                });
    }

    private void assertParticipant(Conversation c, Long userId) {
        if (!c.getUserLowerId().equals(userId) && !c.getUserHigherId().equals(userId)) {
            throw new SecurityException("Not a participant");
        }
    }

    // =========================
    // Messages
    // =========================

    public List<DirectMessageDto> listMessages(Long conversationId, Long userId) {

        Conversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        assertParticipant(c, userId);

        // Force-load sender to guarantee the JSON response contains sender/attachments.
        List<DirectMessage> msgs = messageRepository.findMessagesForConversationFetchSender(conversationId);

        // Debug: verify attachmentUrl/attachmentType are present from DB.
        if (!msgs.isEmpty()) {
            DirectMessage last = msgs.get(msgs.size() - 1);
            log.info("Fetched {} msgs for conversationId={}, lastAttachmentUrl={}",
                    msgs.size(),
                    conversationId,
                    last.getAttachmentName() != null ? "/public/messages/" + last.getAttachmentName() : null);
        } else {
            log.info("Fetched 0 msgs for conversationId={}", conversationId);
        }

        List<DirectMessageDto> out = new ArrayList<>(msgs.size());
        for (DirectMessage m : msgs) {
            out.add(DirectMessageDto.from(m));
        }
        return out;
    }

    @Transactional
    public DirectMessage sendMessage(Long conversationId, Long senderId, String body) {
        return sendMessage(conversationId, senderId, body, null, null);
    }

    @Transactional
    public DirectMessage sendMessage(
            Long conversationId,
            Long senderId,
            String body,
            MultipartFile file,
            String attachmentType
    ) {


        Conversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        assertParticipant(c, senderId);

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String text = body != null ? body.trim() : null;
        boolean hasFile = file != null && !file.isEmpty();

        if ((text == null || text.isBlank()) && !hasFile) {
            throw new IllegalArgumentException("Message cannot be empty");
        }

        DirectMessage m = new DirectMessage();

        m.setConversation(c);
        m.setSender(sender);

        // 🔥 IMPORTANT : DB = NOT NULL
        m.setBody((text != null && !text.isBlank()) ? text : "");

        // sécurité (même si @PrePersist existe)
      

        if (hasFile) {
            try {
                MediaStorageService.StoredMedia stored =
                        mediaStorageService.storeMessageMedia(file, attachmentType);

                m.setAttachmentName(stored.filename());
                m.setAttachmentMime(stored.mime());
                m.setAttachmentType(stored.type());

                log.info("Saving message media: conversationId={}, senderId={}, filename={}, type={}",
                        conversationId, senderId, stored.filename(), stored.type());

            } catch (IOException e) {
                throw new RuntimeException("File upload failed");
            }
        }

        // update activité
        c.setLastActivityAt(LocalDateTime.now());

        // Persist conversation update + message before returning.
        conversationRepository.save(c);
        DirectMessage saved = messageRepository.saveAndFlush(m);

        log.info("Saved message: id={}, attachmentName={}, attachmentType={}",
                saved.getId(),
                saved.getAttachmentName(),
                saved.getAttachmentType());

        return saved;
    }

    // =========================
    // Conversations UI
    // =========================

    public List<Conversation> listConversations(Long userId) {
        return conversationRepository.findForUserOrderByActivity(userId);
    }

    public Long otherUserId(Conversation c, Long me) {
        return c.getUserLowerId().equals(me)
                ? c.getUserHigherId()
                : c.getUserLowerId();
    }

    public List<Map<String, Object>> listConversationSummaries(Long myUserId) {

        List<Conversation> convs = listConversations(myUserId);
        List<Map<String, Object>> out = new ArrayList<>();

        for (Conversation c : convs) {

            Long otherId = otherUserId(c, myUserId);
            User other = userRepository.findById(otherId).orElse(null);

            if (other == null) continue;

            Map<String, Object> row = new LinkedHashMap<>();

            row.put("conversationId", c.getId());
            row.put("lastActivityAt", c.getLastActivityAt());
            row.put("otherUser", userPublicMap(other));

            List<DirectMessage> lastList =
                    messageRepository.findLastInConversation(c.getId(), PageRequest.of(0, 1));

            if (!lastList.isEmpty()) {
                DirectMessage dm = lastList.get(0);

                String preview = dm.getBody() != null && !dm.getBody().isBlank()
                        ? truncate(dm.getBody(), 120)
                        : "[Media]";

                row.put("lastMessagePreview", preview);
                row.put("lastMessageAt", dm.getCreatedAt());
            }

            out.add(row);
        }

        return out;
    }

    private static String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max) + "…";
    }

    public static Map<String, Object> userPublicMap(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("username", u.getUsername());
        m.put("profileAvatarIcon", u.getProfileAvatarIcon());
        m.put("profileAvatarColor", u.getProfileAvatarColor());
        return m;
    }
}