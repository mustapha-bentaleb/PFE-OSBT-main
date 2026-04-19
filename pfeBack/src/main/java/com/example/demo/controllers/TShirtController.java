package com.example.demo.controllers;

import com.example.demo.entity.User;
import com.example.demo.entity.TShirt;
import com.example.demo.repositories.TShirtRepository;
import com.example.demo.repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tshirts")
@CrossOrigin(origins = "http://localhost:5173")
public class TShirtController {

    private final TShirtRepository tShirtRepository;
    private final UserRepository userRepository;

    public TShirtController(
            TShirtRepository tShirtRepository,
            UserRepository userRepository
    ) {
        this.tShirtRepository = tShirtRepository;
        this.userRepository = userRepository;
    }

    // ALL TSHIRTS
    @GetMapping("/all")
    public List<TShirt> getAllTShirts() {
        return tShirtRepository.findAll();
    }

    // MY TSHIRTS
    @GetMapping("/my")
    public List<TShirt> getMyTShirts(Authentication auth) {

        if (auth == null) {
            return List.of();
        }

        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return tShirtRepository.findByOwner_Id(user.getId());
    }
}