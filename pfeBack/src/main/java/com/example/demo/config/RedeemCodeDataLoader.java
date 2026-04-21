package com.example.demo.config;

import com.example.demo.entity.RedeemCode;
import com.example.demo.repositories.RedeemCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Seeds 5 virtual 4-digit bank card codes (one-time use) if the table is empty.
 */
@Component
public class RedeemCodeDataLoader implements CommandLineRunner {

    @Autowired
    private RedeemCodeRepository redeemCodeRepository;

    @Override
    public void run(String... args) {
        if (redeemCodeRepository.count() > 0) {
            return;
        }
        seed("4521", new BigDecimal("100"));
        seed("7830", new BigDecimal("200"));
        seed("1299", new BigDecimal("300"));
        seed("5544", new BigDecimal("500"));
        seed("9010", new BigDecimal("1000"));
    }

    private void seed(String code, BigDecimal amount) {
        RedeemCode rc = new RedeemCode();
        rc.setCode(code);
        rc.setAmount(amount);
        rc.setUsed(false);
        redeemCodeRepository.save(rc);
    }
}
