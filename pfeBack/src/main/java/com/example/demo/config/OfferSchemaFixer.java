package com.example.demo.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Fixes legacy MySQL schema where {@code purchase_offers.status} was created as ENUM
 * without newer values (e.g. SELLER_COUNTERED), causing "Data truncated" errors.
 *
 * We convert it to VARCHAR to keep enum evolution safe with Hibernate ddl-auto=update.
 */
@Component
public class OfferSchemaFixer implements ApplicationRunner {

    private final JdbcTemplate jdbc;

    public OfferSchemaFixer(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            List<Map<String, Object>> rows = jdbc.queryForList(
                    "SELECT COLUMN_TYPE, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH " +
                            "FROM information_schema.COLUMNS " +
                            "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchase_offers' AND COLUMN_NAME = 'status'");
            if (rows.isEmpty()) return;

            Map<String, Object> r = rows.get(0);
            String columnType = r.get("COLUMN_TYPE") != null ? r.get("COLUMN_TYPE").toString() : "";
            String dataType = r.get("DATA_TYPE") != null ? r.get("DATA_TYPE").toString() : "";

            boolean isEnum = "enum".equalsIgnoreCase(dataType) || columnType.toLowerCase().startsWith("enum(");
            if (isEnum) {
                // Convert ENUM to VARCHAR(32) so new statuses won't break.
                jdbc.execute("ALTER TABLE purchase_offers MODIFY status VARCHAR(32) NOT NULL");
                return;
            }

            // If it's already varchar but too short, widen it.
            Object maxLen = r.get("CHARACTER_MAXIMUM_LENGTH");
            if (maxLen instanceof Number n && n.intValue() < 32) {
                jdbc.execute("ALTER TABLE purchase_offers MODIFY status VARCHAR(32) NOT NULL");
            }
        } catch (Exception ignored) {
            // Don't block app startup; worst case user still sees the original error.
        }
    }
}

