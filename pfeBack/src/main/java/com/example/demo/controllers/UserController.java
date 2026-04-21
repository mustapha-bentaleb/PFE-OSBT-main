package com.example.demo.controllers;

import com.example.demo.entity.User;
import com.example.demo.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userService.findByUsername(userDetails.getUsername()).orElseThrow();
        
        return ResponseEntity.ok(user);
    }

    @PutMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@RequestBody Map<String, String> body) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String icon = body != null ? body.get("profileAvatarIcon") : null;
        String color = body != null ? body.get("profileAvatarColor") : null;
        try {
            User updated = userService.updateProfileAvatar(userDetails.getUsername(), icon, color);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}