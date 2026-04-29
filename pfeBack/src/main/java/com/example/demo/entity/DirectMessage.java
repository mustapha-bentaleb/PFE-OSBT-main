package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "direct_messages")
public class DirectMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Column(length = 4000)
    private String body;

    /** Stored filename under ./public/messages/ (e.g. photo1.webp). */
    @Column(length = 255)
    private String attachmentName;

    /** IMAGE or AUDIO (string to keep schema simple). */
    @Column(length = 16)
    private String attachmentType;

    @Column(length = 128)
    private String attachmentMime;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime readAt;

    public DirectMessage() {}

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }

    @JsonIgnore
    public Conversation getConversation() { return conversation; }

    public Long getConversationId() {
        return conversation != null ? conversation.getId() : null;
    }
    public void setConversation(Conversation conversation) { this.conversation = conversation; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    /** URL served by backend static handler. */
    @JsonProperty("attachmentUrl")
    public String getAttachmentUrl() {
        return attachmentName != null && !attachmentName.isBlank()
                ? "/public/messages/" + attachmentName
                : null;
    }

    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }

    public String getAttachmentType() { return attachmentType; }
    public void setAttachmentType(String attachmentType) { this.attachmentType = attachmentType; }

    public String getAttachmentMime() { return attachmentMime; }
    public void setAttachmentMime(String attachmentMime) { this.attachmentMime = attachmentMime; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
}
