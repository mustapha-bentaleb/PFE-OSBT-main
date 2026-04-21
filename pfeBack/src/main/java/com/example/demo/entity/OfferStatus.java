package com.example.demo.entity;

public enum OfferStatus {
    /** Buyer’s offer waiting for seller */
    PENDING,
    /** Seller proposed a new price; waiting for buyer */
    SELLER_COUNTERED,
    ACCEPTED,
    REJECTED,
    WITHDRAWN
}
