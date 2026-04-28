package com.example.demo.controllers;

import com.example.demo.dto.PurchaseOfferJsonDto;
import com.example.demo.dto.SetCounterPriceBody;
import com.example.demo.entity.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.PurchaseOfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/offers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8081", "http://localhost:8082"})
public class OfferController {

    @Autowired
    private PurchaseOfferService offerService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/incoming")
    public ResponseEntity<List<PurchaseOfferJsonDto>> incoming(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        User me = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(
                offerService.listIncomingForSeller(me.getId()).stream()
                        .map(PurchaseOfferJsonDto::from)
                        .toList());
    }

    @GetMapping("/outgoing")
    public ResponseEntity<List<PurchaseOfferJsonDto>> outgoing(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        User me = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(
                offerService.listOutgoingForBuyer(me.getId()).stream()
                        .map(PurchaseOfferJsonDto::from)
                        .toList());
    }

    @PostMapping("/{id}/seller-accept")
    public ResponseEntity<?> sellerAccept(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Login required");
        }
        try {
            return ResponseEntity.ok(
                    PurchaseOfferJsonDto.from(offerService.sellerAcceptInitial(id, authentication.getName())));
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
            return ResponseEntity.ok(
                    PurchaseOfferJsonDto.from(offerService.sellerRejectInitial(id, authentication.getName())));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** البائع يفرض سعراً على المشتري (بعدها الحالة SELLER_COUNTERED). */
    @PostMapping("/{id}/counter-price")
    public ResponseEntity<?> counterPrice(
            @PathVariable Long id,
            @RequestBody(required = false) SetCounterPriceBody body,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Login required");
        }
        BigDecimal amount = body != null ? body.getAmount() : null;
        try {
            return ResponseEntity.ok(offerService.sellerCounterPrice(id, authentication.getName(), amount));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/buyer-accept-counter")
    public ResponseEntity<?> buyerAcceptCounter(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Login required");
        }
        try {
            return ResponseEntity.ok(
                    PurchaseOfferJsonDto.from(offerService.buyerAcceptCounter(id, authentication.getName())));
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
            return ResponseEntity.ok(
                    PurchaseOfferJsonDto.from(offerService.buyerRejectCounter(id, authentication.getName())));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<?> withdraw(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Login required");
        }
        try {
            return ResponseEntity.ok(
                    PurchaseOfferJsonDto.from(offerService.buyerWithdraw(id, authentication.getName())));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
