package com.example.demo.services;

import com.example.demo.entity.TShirt;
import com.example.demo.entity.TshirtComment;
import com.example.demo.entity.User;
import com.example.demo.repositories.TshirtCommentRepository;
import com.example.demo.repositories.TShirtRepository;
import com.example.demo.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TshirtCommentService {

    @Autowired
    private TshirtCommentRepository commentRepository;

    @Autowired
    private TShirtRepository tShirtRepository;

    @Autowired
    private UserRepository userRepository;

    public long countByTshirt(Long tshirtId) {
        return commentRepository.countByTshirt_Id(tshirtId);
    }

    public List<TshirtComment> listComments(Long tshirtId) {
        return commentRepository.findByTshirtIdWithAuthor(tshirtId);
    }

    @Transactional
    public TshirtComment addComment(Long tshirtId, String username, String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Comment cannot be empty");
        }
        String trimmed = content.trim();
        if (trimmed.length() > 2000) {
            throw new IllegalArgumentException("Comment too long");
        }
        TShirt tshirt = tShirtRepository.findById(tshirtId)
                .orElseThrow(() -> new EntityNotFoundException("T-shirt not found"));
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        TshirtComment c = new TshirtComment();
        c.setTshirt(tshirt);
        c.setAuthor(author);
        c.setContent(trimmed);
        return commentRepository.save(c);
    }
}
