package com.example.demo.controllers;

import com.example.demo.entity.User;
import com.example.demo.entity.TShirt;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.TShirtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/tshirts")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8081", "http://localhost:8082"})
public class TShirtController {

    private final TShirtService tShirtService;
    private final UserRepository userRepository;

    public TShirtController(TShirtService tShirtService, UserRepository userRepository) {
        this.tShirtService = tShirtService;
        this.userRepository = userRepository;
    }

    @GetMapping("/all")
    public List<TShirt> getAllTShirts(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return tShirtService.findAllWithLikeState(username);
    }

    @GetMapping("/my")
    public List<TShirt> getMyTShirts(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return List.of();
        }
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return tShirtService.findMineWithLikeState(user.getId(), username);
    }

    @PostMapping("/{id}/like")
    public TShirt like(@PathVariable Long id, Authentication authentication) {
        requireUser(authentication);
        TShirt t = tShirtService.like(id, authentication.getName());
        t.setLikedByCurrentUser(true);
        return t;
    }

    @DeleteMapping("/{id}/like")
    public TShirt unlike(@PathVariable Long id, Authentication authentication) {
        requireUser(authentication);
        TShirt t = tShirtService.unlike(id, authentication.getName());
        t.setLikedByCurrentUser(false);
        return t;
    }

    private static void requireUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
    }
}