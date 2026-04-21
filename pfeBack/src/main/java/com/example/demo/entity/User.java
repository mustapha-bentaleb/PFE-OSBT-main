package com.example.demo.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    private boolean isAdmin = false;

    private boolean isBan = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    /** Hex color for profile avatar, e.g. #A3B4C5 */
    @Column(name = "profile_avatar_color", length = 7)
    private String profileAvatarColor;

    /** React-icons / Fa icon name, e.g. FaUserCircle */
    @Column(name = "profile_avatar_icon", length = 64)
    private String profileAvatarIcon;

    // 👇 1 USER → MANY TSHIRTS
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<TShirt> tshirts = new HashSet<>();

    // getters/setters
    public Long getId() { return id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getProfileAvatarColor() { return profileAvatarColor; }
    public void setProfileAvatarColor(String profileAvatarColor) { this.profileAvatarColor = profileAvatarColor; }

    public String getProfileAvatarIcon() { return profileAvatarIcon; }
    public void setProfileAvatarIcon(String profileAvatarIcon) { this.profileAvatarIcon = profileAvatarIcon; }

    public boolean isAdmin() { return isAdmin; }
    public void setAdmin(boolean admin) { isAdmin = admin; }

    public boolean isBan() { return isBan; }
    public void setBan(boolean ban) { isBan = ban; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public Set<TShirt> getTshirts() { return tshirts; }
    public void setTshirts(Set<TShirt> tshirts) { this.tshirts = tshirts; }
}