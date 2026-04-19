package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tshirts")
public class TShirt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 👤 MANY TSHIRTS → 1 USER
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User owner;

    // 🎨 COLORS
    private String mainColor;
    private String secondColor;
    private String collarColor;
    private String insideColor;

    // 🧩 PATTERN
    private String pattern;

    // 🔢 TEXT
    private String number;
    private String name;

    @Column(name = "name_number_color")
    private String nameNumberColor;

    // 🔤 FONTS
    private String textFont;
    private String sponsorFont;

    // 🏷️ SPONSOR
    private String sponsor;
    private String sponsorColor;

    // 🏟️ BRAND
    private String brand;

    // 🖼️ LOGO
    private String logo;
    private String logoPosition;

    // getters / setters

    public Long getId() { return id; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public String getMainColor() { return mainColor; }
    public void setMainColor(String mainColor) { this.mainColor = mainColor; }

    public String getSecondColor() { return secondColor; }
    public void setSecondColor(String secondColor) { this.secondColor = secondColor; }

    public String getCollarColor() { return collarColor; }
    public void setCollarColor(String collarColor) { this.collarColor = collarColor; }

    public String getInsideColor() { return insideColor; }
    public void setInsideColor(String insideColor) { this.insideColor = insideColor; }

    public String getPattern() { return pattern; }
    public void setPattern(String pattern) { this.pattern = pattern; }

    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getNameNumberColor() { return nameNumberColor; }
    public void setNameNumberColor(String nameNumberColor) { this.nameNumberColor = nameNumberColor; }

    public String getTextFont() { return textFont; }
    public void setTextFont(String textFont) { this.textFont = textFont; }

    public String getSponsorFont() { return sponsorFont; }
    public void setSponsorFont(String sponsorFont) { this.sponsorFont = sponsorFont; }

    public String getSponsor() { return sponsor; }
    public void setSponsor(String sponsor) { this.sponsor = sponsor; }

    public String getSponsorColor() { return sponsorColor; }
    public void setSponsorColor(String sponsorColor) { this.sponsorColor = sponsorColor; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }

    public String getLogoPosition() { return logoPosition; }
    public void setLogoPosition(String logoPosition) { this.logoPosition = logoPosition; }
}