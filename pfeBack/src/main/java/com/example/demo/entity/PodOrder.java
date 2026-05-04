package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "pod_orders")
public class PodOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "buyer_id")
    @JsonIgnoreProperties({"password", "tshirts"})
    private User buyer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PodSourceType sourceType;

    /** معرف السجل في pod-catalog.json / tshirt.json */
    private Integer catalogItemId;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String designSnapshotJson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PodOrderStatus status = PodOrderStatus.PENDING_DELIVERY;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal pricePaid;

    @Column(columnDefinition = "TEXT")
    private String complaintText;

    @Column(length = 64)
    private String complaintPhone;

    @Column(columnDefinition = "TEXT")
    private String adminResponse;

    private Long createdTshirtId;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }

    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }

    public PodSourceType getSourceType() { return sourceType; }
    public void setSourceType(PodSourceType sourceType) { this.sourceType = sourceType; }

    public Integer getCatalogItemId() { return catalogItemId; }
    public void setCatalogItemId(Integer catalogItemId) { this.catalogItemId = catalogItemId; }

    public String getDesignSnapshotJson() { return designSnapshotJson; }
    public void setDesignSnapshotJson(String designSnapshotJson) { this.designSnapshotJson = designSnapshotJson; }

    public PodOrderStatus getStatus() { return status; }
    public void setStatus(PodOrderStatus status) { this.status = status; }

    public BigDecimal getPricePaid() { return pricePaid; }
    public void setPricePaid(BigDecimal pricePaid) { this.pricePaid = pricePaid; }

    public String getComplaintText() { return complaintText; }
    public void setComplaintText(String complaintText) { this.complaintText = complaintText; }

    public String getComplaintPhone() { return complaintPhone; }
    public void setComplaintPhone(String complaintPhone) { this.complaintPhone = complaintPhone; }

    public String getAdminResponse() { return adminResponse; }
    public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }

    public Long getCreatedTshirtId() { return createdTshirtId; }
    public void setCreatedTshirtId(Long createdTshirtId) { this.createdTshirtId = createdTshirtId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
