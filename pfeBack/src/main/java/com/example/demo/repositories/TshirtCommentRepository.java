package com.example.demo.repositories;

import com.example.demo.entity.TshirtComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TshirtCommentRepository extends JpaRepository<TshirtComment, Long> {

    @Query("SELECT c FROM TshirtComment c JOIN FETCH c.author WHERE c.tshirt.id = :tshirtId ORDER BY c.createdAt ASC")
    List<TshirtComment> findByTshirtIdWithAuthor(@Param("tshirtId") Long tshirtId);

    long countByTshirt_Id(Long tshirtId);
}
