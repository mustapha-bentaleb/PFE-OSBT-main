package com.example.demo.controllers;

import com.example.demo.entity.PurchaseOffer;
import com.example.demo.entity.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.PurchaseOfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/offers")
@CrossOrigin(origins = "http://localhost:5173")
public class OfferController {

    @Autowired
    private PurchaseOfferService offerService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/incoming")
    public ResponseEntity<List<PurchaseOffer>> incoming(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        User me = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(offerService.listIncomingForSeller(me.getId()));
    }

    @GetMapping("/outgoing")
    public ResponseEntity<List<PurchaseOffer>> outgoing(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        User me = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(offerService.listOutgoingForBuyer(me.getId()));
    }

    @PostMapping("/{id}/seller-accept")
    public ResponseEntity<?> sellerAccept(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Login required");
        }
        try {
            PurchaseOffer o = offerService.sellerAcceptInitial(id, authentication.getName());
            return ResponseEntity.ok(o);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/seller-reject")
    public ResponseEntity<?> sellerReject(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Login required");
        }
        try {
            return ResponseEntity.ok(offerService.sellerRejectInitial(id, authentication.getName()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/seller-counter")
    public ResponseEntity<?> sellerCounter(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Login required");
        }
        BigDecimal price = extractPrice(body != null ? body.get("counterPrice") : null);
        try {
            return ResponseEntity.ok(offerService.sellerCounter(id, authentication.getName(), price));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/buyer-accept-counter")
    public ResponseEntity<?> buyerAcceptCounter(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Login required");
        }
        try {
            return ResponseEntity.ok(offerService.buyerAcceptCounter(id, authentication.getName()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/buyer-reject-counter")
    public ResponseEntity<?> buyerRejectCounter(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Login required");
        }
        try {
            return ResponseEntity.ok(offerService.buyerRejectCounter(id, authentication.getName()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<?> withdraw(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Login required");
        }
        try {
            return ResponseEntity.ok(offerService.buyerWithdraw(id, authentication.getName()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private static BigDecimal extractPrice(Object p) {
        if (p == null) {
            return null;
        }
        if (p instanceof Number) {
            return BigDecimal.valueOf(((Number) p).doubleValue());
        }
        if (p instanceof String s && !s.isBlank()) {
            return new BigDecimal(s.trim().replace(',', '.'));
        }
        return null;
    }

}
