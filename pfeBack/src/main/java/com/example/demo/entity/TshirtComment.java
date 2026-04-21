package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tshirt_comments")
public class TshirtComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tshirt_id")
    private TShirt tshirt;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User author;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public TshirtComment() {}

    public Long getId() { return id; }

    @JsonIgnore
    public TShirt getTshirt() { return tshirt; }
    public void setTshirt(TShirt tshirt) { this.tshirt = tshirt; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
