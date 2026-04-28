package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_offers")
public class PurchaseOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tshirt_id")
    private TShirt tshirt;

    /** Buyer making the offer */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id")
    private User buyer;

    @Column(precision = 14, scale = 2)
    private BigDecimal proposedPrice;

    /** When seller counters: price buyer must pay if they accept */
    @Column(precision = 14, scale = 2)
    private BigDecimal sellerCounterPrice;

    @Column(length = 1000)
    private String message;

    /** T-shirt IDs the buyer offers in exchange (must be owned by buyer). */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "purchase_offer_barter_tshirts", joinColumns = @JoinColumn(name = "offer_id"))
    @Column(name = "tshirt_id")
    private List<Long> barterTshirtIds = new ArrayList<>();

    /** Short labels for JSON (e.g. "#12 · Team A"); set when listing offers. */
    @Transient
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> barterTshirtSummaries = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private OfferStatus status = OfferStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public PurchaseOffer() {}

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }

    @JsonIgnore
    public TShirt getTshirt() { return tshirt; }

    /** Exposed to JSON instead of full tshirt */
    public Long getTshirtId() {
        return tshirt != null ? tshirt.getId() : null;
    }

    public String getTshirtName() {
        return tshirt != null ? tshirt.getName() : null;
    }

    public String getTshirtNumber() {
        return tshirt != null ? tshirt.getNumber() : null;
    }

    public String getSellerUsername() {
        if (tshirt == null || tshirt.getOwner() == null) {
            return null;
        }
        return tshirt.getOwner().getUsername();
    }

    public void setTshirt(TShirt tshirt) { this.tshirt = tshirt; }

    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }

    public BigDecimal getProposedPrice() { return proposedPrice; }
    public void setProposedPrice(BigDecimal proposedPrice) { this.proposedPrice = proposedPrice; }

    public BigDecimal getSellerCounterPrice() { return sellerCounterPrice; }
    public void setSellerCounterPrice(BigDecimal sellerCounterPrice) { this.sellerCounterPrice = sellerCounterPrice; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<Long> getBarterTshirtIds() {
        return barterTshirtIds != null ? barterTshirtIds : List.of();
    }

    public void setBarterTshirtIds(List<Long> barterTshirtIds) {
        this.barterTshirtIds = barterTshirtIds != null ? new ArrayList<>(barterTshirtIds) : new ArrayList<>();
    }

    public List<String> getBarterTshirtSummaries() {
        return barterTshirtSummaries;
    }

    public void setBarterTshirtSummaries(List<String> barterTshirtSummaries) {
        this.barterTshirtSummaries = barterTshirtSummaries != null ? barterTshirtSummaries : new ArrayList<>();
    }

    public OfferStatus getStatus() { return status; }
    public void setStatus(OfferStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
