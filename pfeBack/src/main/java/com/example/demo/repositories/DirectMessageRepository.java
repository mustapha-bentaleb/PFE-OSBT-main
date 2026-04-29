package com.example.demo.repositories;

import com.example.demo.entity.DirectMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;



public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {

    List<DirectMessage> findByConversation_IdOrderByCreatedAtAsc(Long conversationId);

    List<DirectMessage> findByConversation_IdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    @Query("SELECT m FROM DirectMessage m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt DESC")
    List<DirectMessage> findLastInConversation(@Param("conversationId") Long conversationId, Pageable pageable);

    // Force-load sender to avoid LazyInitializationException during JSON serialization.
    @Query("""
            SELECT m
            FROM DirectMessage m
            JOIN FETCH m.sender s
            WHERE m.conversation.id = :conversationId
            ORDER BY m.createdAt ASC
            """)
    List<DirectMessage> findMessagesForConversationFetchSender(@Param("conversationId") Long conversationId);
}