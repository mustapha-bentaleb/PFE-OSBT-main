package com.example.demo.repositories;

import com.example.demo.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE c.userLowerId = :uid OR c.userHigherId = :uid ORDER BY c.lastActivityAt DESC")
    List<Conversation> findForUserOrderByActivity(@Param("uid") Long userId);

    Optional<Conversation> findByUserLowerIdAndUserHigherId(Long userLowerId, Long userHigherId);
}
