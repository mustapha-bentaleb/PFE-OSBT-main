package com.example.demo.services;

import com.example.demo.entity.OfferStatus;
import com.example.demo.entity.PurchaseOffer;
import com.example.demo.entity.TShirt;
import com.example.demo.entity.User;
import com.example.demo.repositories.PurchaseOfferRepository;
import com.example.demo.repositories.TShirtRepository;
import com.example.demo.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Service
public class PurchaseOfferService {

    @Autowired
    private PurchaseOfferRepository offerRepository;

    @Autowired
    private TShirtRepository tShirtRepository;

    @Autowired
    private UserRepository userRepository;

    public List<PurchaseOffer> listIncomingForSeller(Long ownerId) {
        return offerRepository.findIncomingForSeller(ownerId);
    }

    public List<PurchaseOffer> listOutgoingForBuyer(Long buyerId) {
        return offerRepository.findOutgoingForBuyer(buyerId);
    }

    public PurchaseOffer getOffer(Long id) {
        return offerRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Offer not found"));
    }

    @Transactional
    public PurchaseOffer createOffer(Long tshirtId, String buyerUsername, BigDecimal proposedPrice, String message) {
        TShirt tshirt = tShirtRepository.findById(tshirtId)
                .orElseThrow(() -> new EntityNotFoundException("T-shirt not found"));
        User buyer = userRepository.findByUsername(buyerUsername)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        User owner = tshirt.getOwner();
        if (owner == null || owner.getId().equals(buyer.getId())) {
            throw new IllegalArgumentException("Cannot make an offer on your own listing");
        }

        PurchaseOffer offer = new PurchaseOffer();
        offer.setTshirt(tshirt);
        offer.setBuyer(buyer);
        if (proposedPrice != null && proposedPrice.compareTo(BigDecimal.ZERO) > 0) {
            offer.setProposedPrice(proposedPrice);
        }
        if (message != null && !message.isBlank()) {
            String m = message.trim();
            if (m.length() > 1000) {
                throw new IllegalArgumentException("Message too long");
            }
            offer.setMessage(m);
        }
        offer.setStatus(OfferStatus.PENDING);
        return offerRepository.save(offer);
    }

    /** Seller accepts buyer’s initial price — money + shirt transfer */
    @Transactional
    public PurchaseOffer sellerAcceptInitial(Long offerId, String sellerUsername) {
        PurchaseOffer offer = getOffer(offerId);
        assertStatus(offer, OfferStatus.PENDING);
        User seller = resolveSeller(offer);
        if (!seller.getUsername().equals(sellerUsername)) {
            throw new SecurityException("Only the seller can accept here");
        }
        if (offer.getProposedPrice() == null || offer.getProposedPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("No price to accept — ask the buyer to set an offer price or send a counter-offer");
        }
        executeTrade(offer, offer.getProposedPrice());
        closeCompetingOffers(offer);
        return offerRepository.findById(offerId).orElseThrow();
    }

    /** Seller rejects buyer’s initial offer */
    @Transactional
    public PurchaseOffer sellerRejectInitial(Long offerId, String sellerUsername) {
        PurchaseOffer offer = getOffer(offerId);
        assertStatus(offer, OfferStatus.PENDING);
        User seller = resolveSeller(offer);
        if (!seller.getUsername().equals(sellerUsername)) {
            throw new SecurityException("Only the seller can reject here");
        }
        offer.setStatus(OfferStatus.REJECTED);
        return offerRepository.save(offer);
    }

    /**
     * Seller raises the price (counter-offer). Buyer must accept/reject this amount.
     */
    @Transactional
    public PurchaseOffer sellerCounter(Long offerId, String sellerUsername, BigDecimal counterPrice) {
        PurchaseOffer offer = getOffer(offerId);
        assertStatus(offer, OfferStatus.PENDING);
        User seller = resolveSeller(offer);
        if (!seller.getUsername().equals(sellerUsername)) {
            throw new SecurityException("Only the seller can counter");
        }
        if (counterPrice == null || counterPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Counter price must be positive");
        }
        if (offer.getProposedPrice() != null && counterPrice.compareTo(offer.getProposedPrice()) < 0) {
            throw new IllegalArgumentException("Counter price cannot be below the buyer’s offer");
        }
        offer.setSellerCounterPrice(counterPrice);
        offer.setStatus(OfferStatus.SELLER_COUNTERED);
        return offerRepository.save(offer);
    }

    /** Buyer accepts seller’s counter — pay sellerCounterPrice and receive shirt */
    @Transactional
    public PurchaseOffer buyerAcceptCounter(Long offerId, String buyerUsername) {
        PurchaseOffer offer = getOffer(offerId);
        assertStatus(offer, OfferStatus.SELLER_COUNTERED);
        if (!offer.getBuyer().getUsername().equals(buyerUsername)) {
            throw new SecurityException("Only the buyer can accept the counter");
        }
        if (offer.getSellerCounterPrice() == null || offer.getSellerCounterPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Invalid counter price");
        }
        executeTrade(offer, offer.getSellerCounterPrice());
        closeCompetingOffers(offer);
        return offerRepository.findById(offerId).orElseThrow();
    }

    @Transactional
    public PurchaseOffer buyerRejectCounter(Long offerId, String buyerUsername) {
        PurchaseOffer offer = getOffer(offerId);
        assertStatus(offer, OfferStatus.SELLER_COUNTERED);
        if (!offer.getBuyer().getUsername().equals(buyerUsername)) {
            throw new SecurityException("Only the buyer can reject the counter");
        }
        offer.setStatus(OfferStatus.REJECTED);
        return offerRepository.save(offer);
    }

    @Transactional
    public PurchaseOffer buyerWithdraw(Long offerId, String buyerUsername) {
        PurchaseOffer offer = getOffer(offerId);
        assertStatus(offer, OfferStatus.PENDING);
        if (!offer.getBuyer().getUsername().equals(buyerUsername)) {
            throw new SecurityException("Only the buyer can withdraw");
        }
        offer.setStatus(OfferStatus.WITHDRAWN);
        return offerRepository.save(offer);
    }

    private static void assertStatus(PurchaseOffer offer, OfferStatus expected) {
        if (offer.getStatus() != expected) {
            throw new IllegalArgumentException("Invalid offer state: " + offer.getStatus());
        }
    }

    private User resolveSeller(PurchaseOffer offer) {
        TShirt t = offer.getTshirt();
        User owner = t.getOwner();
        if (owner == null) {
            throw new IllegalStateException("T-shirt has no owner");
        }
        return owner;
    }

    private void executeTrade(PurchaseOffer offer, BigDecimal price) {
        User buyer = userRepository.findById(offer.getBuyer().getId()).orElseThrow();
        TShirt shirt = tShirtRepository.findById(offer.getTshirt().getId()).orElseThrow();
        User seller = userRepository.findById(shirt.getOwner().getId()).orElseThrow();

        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid price");
        }
        if (buyer.getBalance().compareTo(price) < 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        buyer.setBalance(buyer.getBalance().subtract(price));
        seller.setBalance(seller.getBalance().add(price));
        shirt.setOwner(buyer);
        offer.setStatus(OfferStatus.ACCEPTED);

        userRepository.save(buyer);
        userRepository.save(seller);
        tShirtRepository.save(shirt);
        offerRepository.save(offer);
    }

    private void closeCompetingOffers(PurchaseOffer accepted) {
        Long tid = accepted.getTshirt().getId();
        List<OfferStatus> active = Arrays.asList(OfferStatus.PENDING, OfferStatus.SELLER_COUNTERED);
        List<PurchaseOffer> others = offerRepository.findByTshirt_IdAndIdNotAndStatusIn(tid, accepted.getId(), active);
        for (PurchaseOffer o : others) {
            o.setStatus(OfferStatus.REJECTED);
            offerRepository.save(o);
        }
    }
}
