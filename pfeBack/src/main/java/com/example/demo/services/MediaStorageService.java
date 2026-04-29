package com.example.demo.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;




import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
@Service
public class MediaStorageService {

    private static final Logger log = LoggerFactory.getLogger(MediaStorageService.class);

    private final Path messagesDir = Path.of("public", "messages").toAbsolutePath().normalize();

    public StoredMedia storeMessageMedia(MultipartFile file, String attachmentType) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File required");
        }

        Files.createDirectories(messagesDir);

        String mime = file.getContentType();
        if (mime == null) {
            throw new IllegalArgumentException("Unknown file type");
        }

        log.info("Uploading message media: originalFilename={}, typeFromClient={}, contentType={}",
                file.getOriginalFilename(),
                attachmentType,
                mime);

        String type = normalizeType(attachmentType, mime);

        if (type.equals("IMAGE") && !isAllowedImage(mime)) {
            throw new IllegalArgumentException("Only images allowed");
        }

        if (type.equals("AUDIO") && !isAllowedAudio(mime)) {
            throw new IllegalArgumentException("Only audio allowed");
        }

        String ext = extFromMime(mime);
        if (ext.isBlank()) ext = "bin";

        // 🔥 UUID pour éviter collisions
        String filename = UUID.randomUUID() + "." + ext;

        Path target = messagesDir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        log.info("Stored message media: filename={}, storedMime={}, storedType={}",
                filename, mime, type);

        return new StoredMedia(filename, mime, type);
    }

    private static String normalizeType(String t, String mime) {
        if (t != null) {
            String v = t.trim().toUpperCase();
            if (v.equals("IMAGE") || v.equals("AUDIO")) return v;
        }
        if (mime.startsWith("image/")) return "IMAGE";
        if (mime.startsWith("audio/") || mime.equals("video/webm")) return "AUDIO";
        return "FILE";
    }

    private static boolean isAllowedImage(String mime) {
        return mime.equals("image/png")
                || mime.equals("image/jpeg")
                || mime.equals("image/jpg")
                || mime.equals("image/webp")
                || mime.equals("image/gif");
    }

    private static boolean isAllowedAudio(String mime) {
        String m = mime.toLowerCase();
        return m.startsWith("audio/") || m.equals("video/webm");
    }

    private static String extFromMime(String mime) {
        return switch (mime) {
            case "image/png" -> "png";
            case "image/jpeg", "image/jpg" -> "jpg";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            case "audio/mpeg" -> "mp3";
            case "audio/wav" -> "wav";
            case "audio/ogg" -> "ogg";
            case "audio/webm", "video/webm" -> "webm";
            default -> "";
        };
    }

    public record StoredMedia(String filename, String mime, String type) {}
}