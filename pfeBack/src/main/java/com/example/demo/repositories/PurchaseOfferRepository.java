package com.example.demo.repositories;

import com.example.demo.entity.OfferStatus;
import com.example.demo.entity.PurchaseOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PurchaseOfferRepository extends JpaRepository<PurchaseOffer, Long> {

    List<PurchaseOffer> findByTshirt_IdOrderByCreatedAtDesc(Long tshirtId);

    @Query("SELECT o FROM PurchaseOffer o JOIN FETCH o.tshirt t JOIN FETCH o.buyer b JOIN FETCH t.owner ow WHERE ow.id = :ownerId ORDER BY o.createdAt DESC")
    List<PurchaseOffer> findIncomingForSeller(@Param("ownerId") Long ownerId);

    @Query("SELECT o FROM PurchaseOffer o JOIN FETCH o.tshirt t JOIN FETCH o.buyer b JOIN FETCH t.owner ow WHERE b.id = :buyerId ORDER BY o.createdAt DESC")
    List<PurchaseOffer> findOutgoingForBuyer(@Param("buyerId") Long buyerId);

    List<PurchaseOffer> findByTshirt_IdAndIdNotAndStatusIn(Long tshirtId, Long excludeId, List<OfferStatus> statuses);
}
