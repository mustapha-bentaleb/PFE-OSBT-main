package com.example.demo.repositories;

import com.example.demo.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByUserIdAndTshirtId(Long userId, Long tshirtId);
    Optional<Like> findByUserIdAndTshirtId(Long userId, Long tshirtId);
}
