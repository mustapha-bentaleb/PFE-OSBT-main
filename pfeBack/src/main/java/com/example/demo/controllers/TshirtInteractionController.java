package com.example.demo.controllers;

import com.example.demo.entity.PurchaseOffer;
import com.example.demo.entity.TshirtComment;
import com.example.demo.services.PurchaseOfferService;
import com.example.demo.services.TshirtCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tshirts")
@CrossOrigin(origins = "http://localhost:5173")
public class TshirtInteractionController {

    @Autowired
    private TshirtCommentService commentService;

    @Autowired
    private PurchaseOfferService offerService;

    @GetMapping("/{id}/comments/count")
    public Map<String, Long> commentCount(@PathVariable Long id) {
        long count = commentService.countByTshirt(id);
        return Map.of("count", count);
    }

    @GetMapping("/{id}/comments")
    public List<TshirtComment> listComments(@PathVariable Long id) {
        return commentService.listComments(id);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TshirtComment> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String username = requireUser(authentication);
        String content = body != null ? body.get("content") : null;
        try {
            TshirtComment c = commentService.addComment(id, username, content);
            return ResponseEntity.ok(c);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/offers")
    public ResponseEntity<?> createOffer(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body,
            Authentication authentication) {
        String username = requireUser(authentication);
        BigDecimal price = null;
        String message = null;
        if (body != null) {
            Object p = body.get("proposedPrice");
            if (p instanceof Number) {
                price = BigDecimal.valueOf(((Number) p).doubleValue());
            } else if (p instanceof String && !((String) p).isBlank()) {
                price = new BigDecimal(((String) p).trim());
            }
            Object m = body.get("message");
            if (m != null) {
                message = m.toString();
            }
        }
        try {
            PurchaseOffer offer = offerService.createOffer(id, username, price, message);
            return ResponseEntity.ok(offer);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private static String requireUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        return authentication.getName();
    }
}
