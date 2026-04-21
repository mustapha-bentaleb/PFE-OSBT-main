package com.example.demo.repositories;

import com.example.demo.entity.RedeemCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RedeemCodeRepository extends JpaRepository<RedeemCode, Long> {

    Optional<RedeemCode> findByCodeAndUsedFalse(String code);
}
