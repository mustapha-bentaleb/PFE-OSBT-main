package com.example.demo.controllers;

import com.example.demo.entity.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8081", "http://localhost:8082"})
public class WalletController {

    @Autowired
    private WalletService walletService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/redeem")
    public ResponseEntity<?> redeem(@RequestBody Map<String, String> body, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Login required");
        }
        String code = body != null ? body.get("code") : null;
        try {
            User u = walletService.redeemCode(authentication.getName(), code);
            return ResponseEntity.ok(Map.of(
                    "balance", u.getBalance(),
                    "message", "تم شحن الرصيد"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/balance")
    public ResponseEntity<?> balance(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        User u = userRepository.findByUsername(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(Map.of("balance", u.getBalance()));
    }
}
