package com.example.demo.services;

import com.example.demo.entity.*;
import com.example.demo.repositories.PodOrderRepository;
import com.example.demo.repositories.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class PodOrderService {

    private static final BigDecimal CUSTOM_PRICE = new BigDecimal("189.00");

    private final PodOrderRepository podOrderRepository;
    private final UserRepository userRepository;
    private final TShirtService tShirtService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /** محتوى pod-catalog.json */
    private JsonNode catalogArray = objectMapper.createArrayNode();

    public PodOrderService(
            PodOrderRepository podOrderRepository,
            UserRepository userRepository,
            TShirtService tShirtService) {
        this.podOrderRepository = podOrderRepository;
        this.userRepository = userRepository;
        this.tShirtService = tShirtService;
    }

    @PostConstruct
    public void loadCatalog() {
        try {
            ClassPathResource res = new ClassPathResource("pod-catalog.json");
            try (InputStream is = res.getInputStream()) {
                String s = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                catalogArray = objectMapper.readTree(s);
            }
        } catch (Exception e) {
            catalogArray = objectMapper.createArrayNode();
        }
    }

    private JsonNode findCatalogRow(int id) {
        if (!catalogArray.isArray()) {
            throw new IllegalArgumentException("Catalog unavailable");
        }
        for (JsonNode row : catalogArray) {
            if (row.path("id").asInt() == id) {
                return row;
            }
        }
        throw new IllegalArgumentException("Unknown catalog item id: " + id);
    }

    private BigDecimal priceFromCatalogRow(JsonNode row) {
        if (row.has("price") && row.get("price").isNumber()) {
            return BigDecimal.valueOf(row.get("price").asDouble());
        }
        throw new IllegalArgumentException("Catalog item has no price");
    }

    private String designOnlyJson(JsonNode catalogRow) {
        ObjectNode o = (ObjectNode) catalogRow.deepCopy();
        o.remove("id");
        o.remove("clubName");
        o.remove("price");
        try {
            return objectMapper.writeValueAsString(o);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private String designOnlyFromCustomPayload(JsonNode designNode) {
        ObjectNode o = (ObjectNode) designNode.deepCopy();
        o.remove("id");
        o.remove("clubName");
        o.remove("price");
        try {
            return objectMapper.writeValueAsString(o);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    @Transactional
    public PodOrder placeOrder(String username, PodSourceType sourceType, Integer catalogItemId, JsonNode customDesign) {
        User buyer = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        String snapshot;
        BigDecimal price;

        if (sourceType == PodSourceType.CATALOG) {
            if (catalogItemId == null) {
                throw new IllegalArgumentException("catalogItemId required");
            }
            JsonNode row = findCatalogRow(catalogItemId);
            price = priceFromCatalogRow(row);
            snapshot = designOnlyJson(row);
        } else {
            if (customDesign == null || customDesign.isNull()) {
                throw new IllegalArgumentException("design required for custom order");
            }
            price = CUSTOM_PRICE;
            snapshot = designOnlyFromCustomPayload(customDesign);
        }

        if (buyer.getBalance().compareTo(price) < 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        buyer.setBalance(buyer.getBalance().subtract(price));
        userRepository.save(buyer);

        PodOrder order = new PodOrder();
        order.setBuyer(buyer);
        order.setSourceType(sourceType);
        order.setCatalogItemId(sourceType == PodSourceType.CATALOG ? catalogItemId : null);
        order.setDesignSnapshotJson(snapshot);
        order.setStatus(PodOrderStatus.PENDING_DELIVERY);
        order.setPricePaid(price);

        return podOrderRepository.save(order);
    }

    /**
     * شراء عدة قمصان في معاملة واحدة (سلة).
     */
    @Transactional
    public Map<String, Object> checkoutBatch(String username, ArrayNode items) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("User required");
        }
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        User buyer = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<BigDecimal> linePrices = new ArrayList<>();
        List<String> snapshots = new ArrayList<>();
        List<PodSourceType> sourceTypes = new ArrayList<>();
        List<Integer> catalogIds = new ArrayList<>();

        BigDecimal total = BigDecimal.ZERO;

        for (JsonNode item : items) {
            if (item == null || !item.has("sourceType")) {
                throw new IllegalArgumentException("Each item needs sourceType");
            }
            PodSourceType st = PodSourceType.valueOf(item.get("sourceType").asText().trim().toUpperCase());
            if (st == PodSourceType.CATALOG) {
                if (!item.has("catalogItemId")) {
                    throw new IllegalArgumentException("catalogItemId required for catalog line");
                }
                int cid = item.get("catalogItemId").asInt();
                JsonNode row = findCatalogRow(cid);
                BigDecimal price = priceFromCatalogRow(row);
                total = total.add(price);
                linePrices.add(price);
                snapshots.add(designOnlyJson(row));
                sourceTypes.add(st);
                catalogIds.add(cid);
            } else {
                JsonNode design = item.get("design");
                if (design == null || design.isNull()) {
                    throw new IllegalArgumentException("design required for custom line");
                }
                total = total.add(CUSTOM_PRICE);
                linePrices.add(CUSTOM_PRICE);
                snapshots.add(designOnlyFromCustomPayload(design));
                sourceTypes.add(st);
                catalogIds.add(null);
            }
        }

        if (buyer.getBalance().compareTo(total) < 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        buyer.setBalance(buyer.getBalance().subtract(total));
        userRepository.save(buyer);

        List<PodOrder> created = new ArrayList<>();
        for (int i = 0; i < snapshots.size(); i++) {
            PodOrder order = new PodOrder();
            order.setBuyer(buyer);
            order.setSourceType(sourceTypes.get(i));
            order.setCatalogItemId(catalogIds.get(i));
            order.setDesignSnapshotJson(snapshots.get(i));
            order.setStatus(PodOrderStatus.PENDING_DELIVERY);
            order.setPricePaid(linePrices.get(i));
            created.add(podOrderRepository.save(order));
        }

        return Map.of(
                "orders", created,
                "newBalance", buyer.getBalance(),
                "totalPaid", total
        );
    }

    public List<PodOrder> listMine(Long userId) {
        return podOrderRepository.findByBuyer_IdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public PodOrder markReceived(Long orderId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        PodOrder order = podOrderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        if (!order.getBuyer().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Not your order");
        }
        if (order.getStatus() == PodOrderStatus.FULFILLED || order.getCreatedTshirtId() != null) {
            throw new IllegalArgumentException("Order cannot be fulfilled in current state");
        }

        TShirt shirt = tShirtService.createFromDesignSnapshot(user, order.getDesignSnapshotJson());
        order.setCreatedTshirtId(shirt.getId());
        order.setStatus(PodOrderStatus.FULFILLED);
        return podOrderRepository.save(order);
    }

    @Transactional
    public PodOrder fileComplaint(Long orderId, String username, String message, String phone) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        PodOrder order = podOrderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        if (!order.getBuyer().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Not your order");
        }
        if (order.getStatus() == PodOrderStatus.FULFILLED) {
            throw new IllegalArgumentException("Complaint not allowed for this order");
        }
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("Message required");
        }

        order.setComplaintText(message.trim());
        order.setComplaintPhone(phone != null && !phone.isBlank() ? phone.trim() : null);
        /* تبقى الحالة PENDING_DELIVERY حتى يؤكد الزبون الاستلام — يبقى زر التأكيد ظاهراً */
        return podOrderRepository.save(order);
    }

    public List<PodOrder> listComplaintsForAdmin() {
        return podOrderRepository.findByComplaintTextIsNotNullOrderByCreatedAtDesc();
    }

    @Transactional
    public PodOrder adminRespond(Long orderId, String responseText) {
        PodOrder order = podOrderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if (order.getComplaintText() == null || order.getComplaintText().isBlank()) {
            throw new IllegalArgumentException("No complaint on this order");
        }
        if (responseText == null || responseText.isBlank()) {
            throw new IllegalArgumentException("Response required");
        }
        order.setAdminResponse(responseText.trim());
        return podOrderRepository.save(order);
    }

    /** لتمرير رصيد محدث للواجهة بعد الشراء */
    public Map<String, Object> orderPlacementResult(PodOrder order) {
        return Map.of(
                "order", order,
                "newBalance", order.getBuyer().getBalance()
        );
    }
}
