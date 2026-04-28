package com.example.demo.services;

import com.example.demo.dto.PurchaseOfferJsonDto;
import com.example.demo.entity.*;
import com.example.demo.repositories.PurchaseOfferRepository;
import com.example.demo.repositories.TShirtRepository;
import com.example.demo.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PurchaseOfferService {

    private final PurchaseOfferRepository offerRepository;
    private final TShirtRepository tShirtRepository;
    private final UserRepository userRepository;

    public PurchaseOfferService(
            PurchaseOfferRepository offerRepository,
            TShirtRepository tShirtRepository,
            UserRepository userRepository
    ) {
        this.offerRepository = offerRepository;
        this.tShirtRepository = tShirtRepository;
        this.userRepository = userRepository;
    }

    /* =========================
       LISTING
    ========================== */

    public List<PurchaseOffer> listIncomingForSeller(Long ownerId) {
        return enrich(offerRepository.findIncomingForSeller(ownerId));
    }

    public List<PurchaseOffer> listOutgoingForBuyer(Long buyerId) {
        return enrich(offerRepository.findOutgoingForBuyer(buyerId));
    }

    private List<PurchaseOffer> enrich(List<PurchaseOffer> offers) {
        offers.forEach(this::enrichBarterSummaries);
        return offers;
    }

    /* =========================
       CREATE OFFER
    ========================== */

    @Transactional
    public PurchaseOffer createOffer(
            Long tshirtId,
            String buyerUsername,
            BigDecimal proposedPrice,
            String message,
            List<Long> barterTshirtIds
    ) {

        TShirt tshirt = tShirtRepository.findById(tshirtId)
                .orElseThrow(() -> new EntityNotFoundException("T-shirt not found"));

        User buyer = userRepository.findByUsername(buyerUsername)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (tshirt.getOwner() == null || tshirt.getOwner().getId().equals(buyer.getId())) {
            throw new IllegalArgumentException("Invalid listing");
        }

        List<Long> barter = normalize(barterTshirtIds);

        boolean hasMoney = proposedPrice != null && proposedPrice.compareTo(BigDecimal.ZERO) > 0;
        boolean hasBarter = !barter.isEmpty();

        if (!hasMoney && !hasBarter) {
            throw new IllegalArgumentException("Offer must include money or items");
        }

        validateBarterOwnership(barter, buyer.getId());

        PurchaseOffer offer = new PurchaseOffer();
        offer.setTshirt(tshirt);
        offer.setBuyer(buyer);
        offer.setProposedPrice(hasMoney ? proposedPrice : null);
        offer.setBarterTshirtIds(barter);
        offer.setMessage(message != null ? message.trim() : null);
        offer.setStatus(OfferStatus.PENDING);

        return offerRepository.save(offer);
    }

    /* =========================
       SELLER ACTIONS
    ========================== */

    @Transactional
    public PurchaseOffer sellerAcceptInitial(Long offerId, String username) {

        PurchaseOffer offer = getOffer(offerId);

        assertStatus(offer, OfferStatus.PENDING);
        assertSeller(offer, username);

        BigDecimal cash = optionalMoney(offer.getProposedPrice());

        completeTrade(offer, cash);

        closeOthers(offer);

        return offer;
    }

    @Transactional
    public PurchaseOffer sellerRejectInitial(Long offerId, String username) {
        PurchaseOffer offer = getOffer(offerId);

        assertStatus(offer, OfferStatus.PENDING);
        assertSeller(offer, username);

        offer.setStatus(OfferStatus.REJECTED);

        return offer;
    }

    @Transactional
    public PurchaseOffer sellerCounterPrice(Long offerId, String username, BigDecimal amount) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid price");
        }

        PurchaseOffer offer = getOffer(offerId);

        assertStatus(offer, OfferStatus.PENDING);
        assertSeller(offer, username);

        offer.setSellerCounterPrice(amount);
        offer.setStatus(OfferStatus.SELLER_COUNTERED);

        return offer;
    }

    /* =========================
       BUYER ACTIONS
    ========================== */

    @Transactional
    public PurchaseOffer buyerAcceptCounter(Long offerId, String username) {

        PurchaseOffer offer = getOffer(offerId);

        assertStatus(offer, OfferStatus.SELLER_COUNTERED);
        assertBuyer(offer, username);

        if (offer.getSellerCounterPrice() == null) {
            throw new IllegalStateException("Missing counter price");
        }

        completeTrade(offer, offer.getSellerCounterPrice());

        closeOthers(offer);

        return offer;
    }

    @Transactional
    public PurchaseOffer buyerRejectCounter(Long offerId, String username) {

        PurchaseOffer offer = getOffer(offerId);

        assertStatus(offer, OfferStatus.SELLER_COUNTERED);
        assertBuyer(offer, username);

        offer.setStatus(OfferStatus.REJECTED);

        return offer;
    }

    @Transactional
    public PurchaseOffer buyerWithdraw(Long offerId, String username) {

        PurchaseOffer offer = getOffer(offerId);

        assertStatus(offer, OfferStatus.PENDING);
        assertBuyer(offer, username);

        offer.setStatus(OfferStatus.WITHDRAWN);

        return offer;
    }

    /* =========================
       CORE TRADE ENGINE
    ========================== */

    private void completeTrade(PurchaseOffer offer, BigDecimal cash) {

        User buyer = offer.getBuyer();
        TShirt tshirt = offer.getTshirt();
        User seller = tshirt.getOwner();

        List<TShirt> barterItems = loadBarterItems(offer.getBarterTshirtIds(), buyer.getId());

        if (cash.compareTo(BigDecimal.ZERO) > 0) {
            if (buyer.getBalance().compareTo(cash) < 0) {
                throw new IllegalArgumentException("Insufficient balance");
            }
            buyer.setBalance(buyer.getBalance().subtract(cash));
            seller.setBalance(seller.getBalance().add(cash));
        }

        // transfer barter items
        for (TShirt t : barterItems) {
            t.setOwner(seller);
        }

        // transfer main item
        tshirt.setOwner(buyer);

        offer.setStatus(OfferStatus.ACCEPTED);
    }

    /* =========================
       HELPERS
    ========================== */

    private PurchaseOffer getOffer(Long id) {
        return offerRepository.findByIdWithAssociations(id)
                .orElseThrow(() -> new EntityNotFoundException("Offer not found"));
    }

    private void assertStatus(PurchaseOffer o, OfferStatus s) {
        if (o.getStatus() != s) {
            throw new IllegalStateException("Invalid state: " + o.getStatus());
        }
    }

    private void assertSeller(PurchaseOffer o, String username) {
        if (!o.getTshirt().getOwner().getUsername().equals(username)) {
            throw new SecurityException("Not seller");
        }
    }

    private void assertBuyer(PurchaseOffer o, String username) {
        if (!o.getBuyer().getUsername().equals(username)) {
            throw new SecurityException("Not buyer");
        }
    }

    private BigDecimal optionalMoney(BigDecimal v) {
        return v != null && v.compareTo(BigDecimal.ZERO) > 0 ? v : BigDecimal.ZERO;
    }

    private List<Long> normalize(List<Long> ids) {
        if (ids == null) return List.of();
        return ids.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    private void validateBarterOwnership(List<Long> ids, Long buyerId) {
        if (ids.isEmpty()) return;

        List<TShirt> shirts = tShirtRepository.findAllById(ids);

        for (TShirt t : shirts) {
            if (t.getOwner() == null || !t.getOwner().getId().equals(buyerId)) {
                throw new IllegalArgumentException("Invalid barter item");
            }
        }
    }

    private List<TShirt> loadBarterItems(List<Long> ids, Long buyerId) {
        if (ids == null || ids.isEmpty()) return List.of();

        List<TShirt> shirts = tShirtRepository.findAllById(ids);

        for (TShirt t : shirts) {
            if (!t.getOwner().getId().equals(buyerId)) {
                throw new IllegalArgumentException("Barter item not owned anymore");
            }
        }

        return shirts;
    }

    private void closeOthers(PurchaseOffer accepted) {
        List<PurchaseOffer> others =
                offerRepository.findByTshirt_IdAndIdNotAndStatusIn(
                        accepted.getTshirt().getId(),
                        accepted.getId(),
                        List.of(OfferStatus.PENDING, OfferStatus.SELLER_COUNTERED)
                );

        others.forEach(o -> o.setStatus(OfferStatus.REJECTED));
    }

    private void enrichBarterSummaries(PurchaseOffer o) {
        List<Long> ids = o.getBarterTshirtIds();
        if (ids == null || ids.isEmpty()) {
            o.setBarterTshirtSummaries(List.of());
            return;
        }

        List<String> summaries = tShirtRepository.findAllById(ids)
                .stream()
                .map(t -> "#" + t.getId() + " · " +
                        (t.getName() != null ? t.getName() : t.getNumber()))
                .collect(Collectors.toList());

        o.setBarterTshirtSummaries(summaries);
    }
}