package com.example.demo.controllers;

import com.example.demo.entity.Conversation;
import com.example.demo.entity.DirectMessage;
import com.example.demo.entity.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.MessagingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "http://localhost:5173")
public class ConversationController {

    @Autowired
    private MessagingService messagingService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Map<String, Object>> inbox(Authentication authentication) {
        User me = requireUserEntity(authentication);
        return messagingService.listConversationSummaries(me.getId());
    }

    @PostMapping
    public ResponseEntity<?> startOrOpen(@RequestBody Map<String, Long> body, Authentication authentication) {
        User me = requireUserEntity(authentication);
        if (body == null || body.get("targetUserId") == null) {
            return ResponseEntity.badRequest().body("targetUserId required");
        }
        Long targetId = body.get("targetUserId");
        try {
            Conversation c = messagingService.findOrCreateConversation(me.getId(), targetId);
            User other = userRepository.findById(messagingService.otherUserId(c, me.getId()))
                    .orElseThrow();
            return ResponseEntity.ok(Map.of(
                    "conversationId", c.getId(),
                    "otherUser", MessagingService.userPublicMap(other)
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/messages")
    public List<DirectMessage> messages(@PathVariable Long id, Authentication authentication) {
        User me = requireUserEntity(authentication);
        return messagingService.listMessages(id, me.getId());
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<DirectMessage> send(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        User me = requireUserEntity(authentication);
        String text = body != null ? body.get("body") : null;
        try {
            DirectMessage m = messagingService.sendMessage(id, me.getId(), text);
            return ResponseEntity.ok(m);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    private User requireUserEntity(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
