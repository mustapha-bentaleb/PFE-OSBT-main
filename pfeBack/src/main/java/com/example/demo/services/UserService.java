package com.example.demo.services;

import com.example.demo.entity.User;
import com.example.demo.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class UserService {

    private static final String[] PROFILE_AVATAR_ICONS = {
            "FaUserCircle", "FaSmile", "FaStar", "FaHeart", "FaLeaf",
            "FaFutbol", "FaPalette", "FaPaintBrush", "FaGem", "FaRocket"
    };

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        assignProfileAvatarIfMissing(user);
        user.setBalance(new BigDecimal("50.00"));
        return userRepository.save(user);
    }

    /**
     * Persists random icon + hex color once for users created before this feature or missing data.
     * Ensures wallet balance default for legacy rows.
     */
    public User ensureProfileAvatarPersisted(User user) {
        boolean changed = false;
        if (isBlank(user.getProfileAvatarColor()) || isBlank(user.getProfileAvatarIcon())) {
            assignProfileAvatarIfMissing(user);
            changed = true;
        }
        if (user.getBalance() == null) {
            user.setBalance(new BigDecimal("50.00"));
            changed = true;
        }
        return changed ? userRepository.save(user) : user;
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private void assignProfileAvatarIfMissing(User user) {
        if (isBlank(user.getProfileAvatarColor())) {
            user.setProfileAvatarColor(randomHexColor());
        }
        if (isBlank(user.getProfileAvatarIcon())) {
            int i = ThreadLocalRandom.current().nextInt(PROFILE_AVATAR_ICONS.length);
            user.setProfileAvatarIcon(PROFILE_AVATAR_ICONS[i]);
        }
    }

    private static String randomHexColor() {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        int r255 = r.nextInt(40, 220);
        int g255 = r.nextInt(40, 220);
        int b255 = r.nextInt(40, 220);
        return String.format("#%02X%02X%02X", r255, g255, b255);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }


    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User updateProfileAvatar(String username, String icon, String color) {
        User u = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (icon != null && !icon.isBlank()) {
            String ic = icon.trim();
            if (!Arrays.asList(PROFILE_AVATAR_ICONS).contains(ic)) {
                throw new IllegalArgumentException("Invalid avatar icon");
            }
            u.setProfileAvatarIcon(ic);
        }
        if (color != null && !color.isBlank()) {
            String c = color.trim();
            if (!c.matches("^#[0-9A-Fa-f]{6}$")) {
                throw new IllegalArgumentException("Invalid color (use #RRGGBB)");
            }
            u.setProfileAvatarColor(c);
        }
        return userRepository.save(u);
    }
}