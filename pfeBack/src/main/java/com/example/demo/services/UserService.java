package com.example.demo.services;

import com.example.demo.entity.User;
import com.example.demo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        return userRepository.save(user);
    }

    /**
     * Persists random icon + hex color once for users created before this feature or missing data.
     */
    public User ensureProfileAvatarPersisted(User user) {
        boolean missing = isBlank(user.getProfileAvatarColor()) || isBlank(user.getProfileAvatarIcon());
        if (!missing) {
            return user;
        }
        assignProfileAvatarIfMissing(user);
        return userRepository.save(user);
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
    
}