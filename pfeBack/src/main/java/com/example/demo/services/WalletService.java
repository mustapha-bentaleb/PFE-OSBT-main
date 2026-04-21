package com.example.demo.services;

import com.example.demo.entity.RedeemCode;
import com.example.demo.entity.User;
import com.example.demo.repositories.RedeemCodeRepository;
import com.example.demo.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class WalletService {

    @Autowired
    private RedeemCodeRepository redeemCodeRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public User redeemCode(String username, String rawCode) {
        if (rawCode == null || rawCode.isBlank()) {
            throw new IllegalArgumentException("Code required");
        }
        String code = rawCode.trim();
        if (code.length() != 4 || !code.chars().allMatch(Character::isDigit)) {
            throw new IllegalArgumentException("Code must be 4 digits");
        }

        RedeemCode rc = redeemCodeRepository.findByCodeAndUsedFalse(code)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or already used code"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        BigDecimal amt = rc.getAmount();
        user.setBalance(user.getBalance().add(amt));
        rc.setUsed(true);
        rc.setUsedBy(user);
        rc.setUsedAt(LocalDateTime.now());
        redeemCodeRepository.save(rc);
        return userRepository.save(user);
    }
}
