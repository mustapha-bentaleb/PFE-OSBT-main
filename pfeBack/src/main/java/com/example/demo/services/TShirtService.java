package com.example.demo.services;

import com.example.demo.entity.Like;
import com.example.demo.entity.TShirt;
import com.example.demo.entity.User;
import com.example.demo.repositories.LikeRepository;
import com.example.demo.repositories.TShirtRepository;
import com.example.demo.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class TShirtService {

    @Autowired
    private TShirtRepository tShirtRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private UserRepository userRepository;

    public List<TShirt> getAll() {
        return tShirtRepository.findAll();
    }

    public List<TShirt> findAllWithLikeState(String username) {
        List<TShirt> list = tShirtRepository.findAllWithOwner();
        if (username == null || username.isBlank()) {
            list.forEach(t -> t.setLikedByCurrentUser(false));
            return list;
        }
        User viewer = userRepository.findByUsername(username).orElse(null);
        if (viewer == null) {
            list.forEach(t -> t.setLikedByCurrentUser(false));
            return list;
        }
        attachLikeState(list, viewer.getId());
        return list;
    }

    public List<TShirt> findMineWithLikeState(Long ownerId, String username) {
        List<TShirt> list = tShirtRepository.findByOwnerIdWithOwner(ownerId);
        if (username == null || username.isBlank()) {
            list.forEach(t -> t.setLikedByCurrentUser(false));
            return list;
        }
        User viewer = userRepository.findByUsername(username).orElse(null);
        if (viewer == null) {
            list.forEach(t -> t.setLikedByCurrentUser(false));
            return list;
        }
        attachLikeState(list, viewer.getId());
        return list;
    }

    private void attachLikeState(List<TShirt> shirts, Long viewerUserId) {
        for (TShirt t : shirts) {
            t.setLikedByCurrentUser(likeRepository.existsByUserIdAndTshirtId(viewerUserId, t.getId()));
        }
    }

    public TShirt create(String name, String ownerUsername) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("T-shirt name is required");
        }

        User owner = userRepository.findByUsername(ownerUsername)
            .orElseThrow(() -> new EntityNotFoundException("Owner user not found"));

        TShirt tShirt = new TShirt(name.trim(), owner);
        return tShirtRepository.save(tShirt);
    }

    @Transactional
    public TShirt like(Long tshirtId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        TShirt tShirt = tShirtRepository.findById(tshirtId)
            .orElseThrow(() -> new EntityNotFoundException("T-shirt not found"));

        if (likeRepository.existsByUserIdAndTshirtId(user.getId(), tShirt.getId())) {
            return tShirt;
        }

        likeRepository.save(new Like(user, tShirt));
        tShirt.setLikesCount(tShirt.getLikesCount() + 1);

        return tShirtRepository.save(tShirt);
    }

    @Transactional
    public TShirt unlike(Long tshirtId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        TShirt tShirt = tShirtRepository.findById(tshirtId)
            .orElseThrow(() -> new EntityNotFoundException("T-shirt not found"));

        boolean removed = likeRepository.findByUserIdAndTshirtId(user.getId(), tShirt.getId())
            .map(like -> {
                likeRepository.delete(like);
                return true;
            })
            .orElse(false);

        if (removed && tShirt.getLikesCount() > 0) {
            tShirt.setLikesCount(tShirt.getLikesCount() - 1);
        }

        return tShirtRepository.save(tShirt);
    }
}
