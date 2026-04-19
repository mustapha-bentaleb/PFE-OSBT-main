package com.example.demo.repositories;

import com.example.demo.entity.TShirt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
public interface TShirtRepository extends JpaRepository<TShirt, Long> {

    List<TShirt> findByOwner_Id(Long id);
}