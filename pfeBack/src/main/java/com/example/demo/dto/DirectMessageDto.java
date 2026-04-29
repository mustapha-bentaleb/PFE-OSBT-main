package com.example.demo.dto;

import com.example.demo.entity.DirectMessage;

public class DirectMessageDto {
    private Long id;
    private String body;
    private String attachmentUrl;
    private String attachmentType;
    private SenderDto sender;

    public static class SenderDto {
        private Long id;
        private String username;

        public SenderDto() {}

        public SenderDto(Long id, String username) {
            this.id = id;
            this.username = username;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }
    }

    public static DirectMessageDto from(DirectMessage m) {
        DirectMessageDto dto = new DirectMessageDto();
        dto.id = m.getId();
        dto.body = m.getBody();
        dto.attachmentType = m.getAttachmentType();
        dto.attachmentUrl =
                m.getAttachmentName() != null && !m.getAttachmentName().isBlank()
                        ? "/public/messages/" + m.getAttachmentName()
                        : null;

        if (m.getSender() != null) {
            dto.sender = new SenderDto(m.getSender().getId(), m.getSender().getUsername());
        }

        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public String getAttachmentType() {
        return attachmentType;
    }

    public void setAttachmentType(String attachmentType) {
        this.attachmentType = attachmentType;
    }

    public SenderDto getSender() {
        return sender;
    }

    public void setSender(SenderDto sender) {
        this.sender = sender;
    }
}

