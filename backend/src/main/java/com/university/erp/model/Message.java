package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String rawText;

    @Column(nullable = false)
    private String fromUser;

    private String intent;           // announcement | query | task

    private double intentConfidence;

    @Column(length = 1000)
    private String entitiesJson;     // JSON string of extracted entities

    @Column(length = 500)
    private String targetChannelsJson; // JSON array of channel IDs

    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    private boolean erpSynced;

    private String erpEventId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime processedAt;

    public enum MessageStatus {
        PENDING, ROUTED, ESCALATED, REJECTED
    }
}
