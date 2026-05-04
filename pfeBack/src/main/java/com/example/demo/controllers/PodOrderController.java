package com.example.demo.controllers;

import com.example.demo.entity.PodOrder;
import com.example.demo.entity.PodSourceType;
import com.example.demo.entity.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.PodOrderService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/pod/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8081", "http://localhost:8082"})
public class PodOrderController {

    private final PodOrderService podOrderService;
    private final UserRepository userRepository;

    public PodOrderController(PodOrderService podOrderService, UserRepository userRepository) {
        this.podOrderService = podOrderService;
        this.userRepository = userRepository;
    }

    private static String requireUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        return authentication.getName();
    }

    @PostMapping
    public ResponseEntity<?> place(@RequestBody JsonNode body, Authentication auth) {
        String username = requireUser(auth);
        if (body == null || !body.has("sourceType")) {
            return ResponseEntity.badRequest().body("sourceType required (CATALOG or CUSTOM)");
        }
        PodSourceType st;
        try {
            st = PodSourceType.valueOf(body.get("sourceType").asText().trim().toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid sourceType");
        }
        try {
            Integer catalogId = body.has("catalogItemId") && body.get("catalogItemId").isNumber()
                    ? body.get("catalogItemId").asInt()
                    : null;
            JsonNode design = body.get("design");
            PodOrder order = podOrderService.placeOrder(username, st, catalogId, design);
            Map<String, Object> out = podOrderService.orderPlacementResult(order);
            return ResponseEntity.ok(out);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody JsonNode body, Authentication auth) {
        String username = requireUser(auth);
        JsonNode items = body != null ? body.get("items") : null;
        if (items == null || !items.isArray() || items.isEmpty()) {
            return ResponseEntity.badRequest().body("items must be a non-empty array");
        }
        try {
            return ResponseEntity.ok(podOrderService.checkoutBatch(username, (ArrayNode) items));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/mine")
    public ResponseEntity<?> mine(Authentication auth) {
        String username = requireUser(auth);
        User u = userRepository.findByUsername(username).orElseThrow();
        return ResponseEntity.ok(podOrderService.listMine(u.getId()));
    }

    @PostMapping("/{id}/received")
    public ResponseEntity<?> received(@PathVariable Long id, Authentication auth) {
        String username = requireUser(auth);
        try {
            return ResponseEntity.ok(podOrderService.markReceived(id, username));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/complaint")
    public ResponseEntity<?> complaint(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication auth) {
        String username = requireUser(auth);
        String msg = body != null ? body.get("message") : null;
        String phone = body != null ? body.get("phone") : null;
        try {
            return ResponseEntity.ok(podOrderService.fileComplaint(id, username, msg, phone));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
