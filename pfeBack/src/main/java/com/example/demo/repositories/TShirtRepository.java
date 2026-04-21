package com.example.demo.repositories;

import com.example.demo.entity.TShirt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TShirtRepository extends JpaRepository<TShirt, Long> {

    List<TShirt> findByOwner_Id(Long id);

    @Query("SELECT DISTINCT t FROM TShirt t LEFT JOIN FETCH t.owner")
    List<TShirt> findAllWithOwner();

    @Query("SELECT DISTINCT t FROM TShirt t LEFT JOIN FETCH t.owner WHERE t.owner.id = :ownerId")
    List<TShirt> findByOwnerIdWithOwner(@Param("ownerId") Long ownerId);
}