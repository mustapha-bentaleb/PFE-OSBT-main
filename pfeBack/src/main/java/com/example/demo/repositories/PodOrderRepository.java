package com.example.demo.repositories;

import com.example.demo.entity.PodOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PodOrderRepository extends JpaRepository<PodOrder, Long> {

    List<PodOrder> findByBuyer_IdOrderByCreatedAtDesc(Long buyerId);

    List<PodOrder> findByComplaintTextIsNotNullOrderByCreatedAtDesc();
}
