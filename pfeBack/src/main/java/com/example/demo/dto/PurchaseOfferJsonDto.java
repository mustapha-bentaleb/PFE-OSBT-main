package com.example.demo.dto;

import com.example.demo.entity.PurchaseOffer;
import com.example.demo.entity.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Stable JSON shape for REST — built from a loaded {@link PurchaseOffer} without Hibernate proxies in the response.
 */
public class PurchaseOfferJsonDto {

    private Long id;
    private Long tshirtId;
    private String tshirtName;
    private String tshirtNumber;
    private String sellerUsername;
    /** Same practical fields as {@link User} JSON before (no password). */
    private BuyerJson buyer;
    private BigDecimal proposedPrice;
    private BigDecimal sellerCounterPrice;
    private String message;
    private List<Long> barterTshirtIds;
    private List<String> barterTshirtSummaries;
    private String status;
    private LocalDateTime createdAt;

    public record BuyerJson(
            Long id,
            String username,
            String email,
            BigDecimal balance,
            String profileAvatarColor,
            String profileAvatarIcon) {

        static BuyerJson fromUser(User u) {
            return new BuyerJson(
                    u.getId(),
                    u.getUsername(),
                    u.getEmail(),
                    u.getBalance(),
                    u.getProfileAvatarColor(),
                    u.getProfileAvatarIcon());
        }
    }

    public static PurchaseOfferJsonDto from(PurchaseOffer o) {
        PurchaseOfferJsonDto d = new PurchaseOfferJsonDto();
        d.id = o.getId();
        d.tshirtId = o.getTshirtId();
        d.tshirtName = o.getTshirtName();
        d.tshirtNumber = o.getTshirtNumber();
        d.sellerUsername = o.getSellerUsername();
        User b = o.getBuyer();
        if (b != null) {
            d.buyer = BuyerJson.fromUser(b);
        }
        d.proposedPrice = o.getProposedPrice();
        d.sellerCounterPrice = o.getSellerCounterPrice();
        d.message = o.getMessage();
        d.barterTshirtIds = new ArrayList<>(o.getBarterTshirtIds());
        List<String> sums = o.getBarterTshirtSummaries();
        d.barterTshirtSummaries = sums != null ? new ArrayList<>(sums) : new ArrayList<>();
        d.status = o.getStatus() != null ? o.getStatus().name() : null;
        d.createdAt = o.getCreatedAt();
        return d;
    }

    public Long getId() {
        return id;
    }

    public Long getTshirtId() {
        return tshirtId;
    }

    public String getTshirtName() {
        return tshirtName;
    }

    public String getTshirtNumber() {
        return tshirtNumber;
    }

    public String getSellerUsername() {
        return sellerUsername;
    }

    public BuyerJson getBuyer() {
        return buyer;
    }

    public BigDecimal getProposedPrice() {
        return proposedPrice;
    }

    public BigDecimal getSellerCounterPrice() {
        return sellerCounterPrice;
    }

    public String getMessage() {
        return message;
    }

    public List<Long> getBarterTshirtIds() {
        return barterTshirtIds;
    }

    public List<String> getBarterTshirtSummaries() {
        return barterTshirtSummaries;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
