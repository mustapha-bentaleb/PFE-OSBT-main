package com.example.demo.services;

import com.example.demo.entity.Conversation;
import com.example.demo.entity.DirectMessage;
import com.example.demo.entity.User;
import com.example.demo.repositories.ConversationRepository;
import com.example.demo.repositories.DirectMessageRepository;
import com.example.demo.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class MessagingService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private DirectMessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

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

    public void assertParticipant(Conversation c, Long userId) {
        if (!c.getUserLowerId().equals(userId) && !c.getUserHigherId().equals(userId)) {
            throw new SecurityException("Not a participant");
        }
    }

    public List<Conversation> listConversations(Long myUserId) {
        return conversationRepository.findForUserOrderByActivity(myUserId);
    }

    public Optional<Conversation> findById(Long id) {
        return conversationRepository.findById(id);
    }

    public Long otherUserId(Conversation c, Long me) {
        if (c.getUserLowerId().equals(me)) {
            return c.getUserHigherId();
        }
        return c.getUserLowerId();
    }

    public List<DirectMessage> listMessages(Long conversationId, Long myUserId) {
        Conversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));
        assertParticipant(c, myUserId);
        return messageRepository.findByConversation_IdWithSender(conversationId);
    }

    @Transactional
    public DirectMessage sendMessage(Long conversationId, Long senderId, String body) {
        if (body == null || body.isBlank()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }
        String text = body.trim();
        if (text.length() > 4000) {
            throw new IllegalArgumentException("Message too long");
        }
        Conversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));
        assertParticipant(c, senderId);

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        DirectMessage m = new DirectMessage();
        m.setConversation(c);
        m.setSender(sender);
        m.setBody(text);
        c.setLastActivityAt(LocalDateTime.now());
        conversationRepository.save(c);
        return messageRepository.save(m);
    }

    public Optional<DirectMessage> findLastMessage(Long conversationId) {
        List<DirectMessage> last = messageRepository.findLastInConversation(
                conversationId, PageRequest.of(0, 1));
        return last.isEmpty() ? Optional.empty() : Optional.of(last.get(0));
    }

    /**
     * Summary row for inbox UI.
     */
    public List<Map<String, Object>> listConversationSummaries(Long myUserId) {
        List<Conversation> convs = listConversations(myUserId);
        List<Map<String, Object>> out = new ArrayList<>();
        for (Conversation c : convs) {
            Long otherId = otherUserId(c, myUserId);
            User other = userRepository.findById(otherId).orElse(null);
            if (other == null) {
                continue;
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("conversationId", c.getId());
            row.put("lastActivityAt", c.getLastActivityAt());
            row.put("otherUser", userPublicMap(other));
            Optional<DirectMessage> last = findLastMessage(c.getId());
            last.ifPresent(dm -> {
                row.put("lastMessagePreview", truncate(dm.getBody(), 120));
                row.put("lastMessageAt", dm.getCreatedAt());
            });
            out.add(row);
        }
        return out;
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
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
