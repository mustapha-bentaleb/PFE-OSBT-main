package com.example.demo.services;

import com.example.demo.entity.Like;
import com.example.demo.entity.TShirt;
import com.example.demo.entity.User;
import com.example.demo.repositories.LikeRepository;
import com.example.demo.repositories.TShirtRepository;
import com.example.demo.repositories.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * يُنشئ قميصاً من لقطة JSON (نفس حقول الواجهة / tshirt.json بدون id/price/clubName).
     */
    @Transactional
    public TShirt createFromDesignSnapshot(User owner, String designSnapshotJson) {
        if (owner == null) {
            throw new IllegalArgumentException("Owner required");
        }
        if (designSnapshotJson == null || designSnapshotJson.isBlank()) {
            throw new IllegalArgumentException("Design snapshot required");
        }
        try {
            JsonNode n = objectMapper.readTree(designSnapshotJson);
            TShirt t = new TShirt();
            t.setOwner(owner);
            String label = text(n, "name");
            if (label == null || label.isBlank()) {
                label = text(n, "number");
            }
            if (label == null || label.isBlank()) {
                label = "Print-on-demand";
            }
            t.setName(label.trim());

            t.setMainColor(text(n, "mainColor"));
            t.setSecondColor(text(n, "secondColor"));
            t.setCollarColor(text(n, "collarColor"));
            t.setInsideColor(text(n, "insideColor"));
            t.setPattern(text(n, "pattern"));
            t.setNumber(text(n, "number"));
            t.setNameNumberColor(text(n, "name_number_color", "nameNumberColor"));
            t.setTextFont(text(n, "textFont"));
            t.setSponsorFont(text(n, "sponsorFont"));
            t.setSponsor(text(n, "sponsor"));
            t.setSponsorColor(text(n, "sponsorColor"));
            t.setBrand(text(n, "brand"));
            t.setLogo(text(n, "logo"));
            t.setLogoPosition(text(n, "logoPosition"));

            return tShirtRepository.save(t);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid design JSON: " + e.getMessage());
        }
    }

    private static String text(JsonNode n, String... keys) {
        for (String k : keys) {
            if (n != null && n.has(k) && !n.get(k).isNull()) {
                String s = n.get(k).asText();
                if (s != null && !s.isBlank()) {
                    return s;
                }
            }
        }
        return null;
    }

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
