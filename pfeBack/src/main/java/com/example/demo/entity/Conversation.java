package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * One row per pair of users (user_lower_id &lt; user_higher_id).
 */
@Entity
@Table(
    name = "conversations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_lower_id", "user_higher_id"})
)
public class Conversation {

    public Conversation() {}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_lower_id", nullable = false)
    private Long userLowerId;

    @Column(name = "user_higher_id", nullable = false)
    private Long userHigherId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime lastActivityAt = LocalDateTime.now();

    public static long[] orderedPair(Long a, Long b) {
        if (a.equals(b)) {
            throw new IllegalArgumentException("Cannot create conversation with self");
        }
        long al = a;
        long bl = b;
        if (al < bl) {
            return new long[]{al, bl};
        }
        return new long[]{bl, al};
    }

    public Long getId() { return id; }

    public Long getUserLowerId() { return userLowerId; }
    public void setUserLowerId(Long userLowerId) { this.userLowerId = userLowerId; }

    public Long getUserHigherId() { return userHigherId; }
    public void setUserHigherId(Long userHigherId) { this.userHigherId = userHigherId; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getLastActivityAt() { return lastActivityAt; }
    public void setLastActivityAt(LocalDateTime lastActivityAt) { this.lastActivityAt = lastActivityAt; }
}
