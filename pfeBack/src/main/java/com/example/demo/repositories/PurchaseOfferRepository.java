package com.example.demo.repositories;

import com.example.demo.entity.OfferStatus;
import com.example.demo.entity.PurchaseOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PurchaseOfferRepository extends JpaRepository<PurchaseOffer, Long> {

    /**
     * Loads buyer, t-shirt and owner so REST JSON ({@code getTshirtId}, {@code getSellerUsername}) never hits lazy.
     * Owner is LEFT-fetched so the row is still found if {@code user_id} is null (bad data).
     */
    @Query("SELECT DISTINCT o FROM PurchaseOffer o "
            + "JOIN FETCH o.buyer JOIN FETCH o.tshirt t LEFT JOIN FETCH t.owner WHERE o.id = :id")
    Optional<PurchaseOffer> findByIdWithAssociations(@Param("id") Long id);

    List<PurchaseOffer> findByTshirt_IdOrderByCreatedAtDesc(Long tshirtId);

    @Query("SELECT o FROM PurchaseOffer o JOIN FETCH o.tshirt t JOIN FETCH o.buyer b JOIN FETCH t.owner ow WHERE ow.id = :ownerId ORDER BY o.createdAt DESC")
    List<PurchaseOffer> findIncomingForSeller(@Param("ownerId") Long ownerId);

    @Query("SELECT o FROM PurchaseOffer o JOIN FETCH o.tshirt t JOIN FETCH o.buyer b JOIN FETCH t.owner ow WHERE b.id = :buyerId ORDER BY o.createdAt DESC")
    List<PurchaseOffer> findOutgoingForBuyer(@Param("buyerId") Long buyerId);

    List<PurchaseOffer> findByTshirt_IdAndIdNotAndStatusIn(Long tshirtId, Long excludeId, List<OfferStatus> statuses);
}
