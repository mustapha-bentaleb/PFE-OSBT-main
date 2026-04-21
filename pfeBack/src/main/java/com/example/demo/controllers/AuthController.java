package com.example.demo.controllers;

import com.example.demo.entity.User;
import com.example.demo.services.UserService;
import com.example.demo.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userService.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (userService.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        
        User registeredUser = userService.registerUser(user);
        String token = jwtUtil.generateToken(registeredUser.getUsername());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", registeredUser.getId());
        response.put("username", registeredUser.getUsername());
        response.put("email", registeredUser.getEmail());
        response.put("isAdmin", registeredUser.isAdmin());
        response.put("profileAvatarIcon", registeredUser.getProfileAvatarIcon());
        response.put("profileAvatarColor", registeredUser.getProfileAvatarColor());
        response.put("balance", registeredUser.getBalance());

        return ResponseEntity.ok(response);
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.get("username"),
                            loginRequest.get("password")
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userService.findByUsername(loginRequest.get("username")).orElseThrow();
            user = userService.ensureProfileAvatarPersisted(user);

            String token = jwtUtil.generateToken(user.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("isAdmin", user.isAdmin());
            response.put("profileAvatarIcon", user.getProfileAvatarIcon());
            response.put("profileAvatarColor", user.getProfileAvatarColor());
            response.put("balance", user.getBalance());

            return ResponseEntity.ok(response);

        } catch (DisabledException e) {
            return ResponseEntity.badRequest().body("Your account is banned!");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
    }

}
