package com.example.demo.controllers;

import com.example.demo.entity.User;
import com.example.demo.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
    
    @PutMapping("/users/{userId}/status")
    @CrossOrigin(origins = "http://localhost:5173") // Ajouté spécifiquement
    public ResponseEntity<?> changeStatus(@PathVariable Long userId) {
        try {
            User updatedUser = adminService.changeStatus(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Statut de l'utilisateur modifié avec succès");
            response.put("user", updatedUser);
            response.put("isBanned", updatedUser.isBan());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}