package com.example.demo.repositories;

import com.example.demo.entity.DirectMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {

    @Query("SELECT m FROM DirectMessage m JOIN FETCH m.sender WHERE m.conversation.id = :cid ORDER BY m.createdAt ASC")
    List<DirectMessage> findByConversation_IdWithSender(@Param("cid") Long conversationId);

    @Query("SELECT m FROM DirectMessage m JOIN FETCH m.sender WHERE m.conversation.id = :cid ORDER BY m.createdAt DESC")
    List<DirectMessage> findLastInConversation(@Param("cid") Long conversationId, Pageable pageable);
}
