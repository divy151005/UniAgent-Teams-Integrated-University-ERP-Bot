package com.university.erp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    private String id;

    @Field(name = "raw_text")
    private String rawText;

    @Field(name = "from_user")
    private String fromUser;

    private String intent;           // announcement | query | task

    @Field(name = "intent_confidence")
    private double intentConfidence;

    @Field(name = "entities_json")
    private String entitiesJson;     // JSON string of extracted entities

    @Field(name = "target_channels_json")
    private String targetChannelsJson; // JSON array of channel IDs

    private MessageStatus status;

    @Field(name = "erp_synced")
    private boolean erpSynced;

    @Field(name = "erp_event_id")
    private String erpEventId;

    @Field(name = "created_at")
    private LocalDateTime createdAt;

    @Field(name = "processed_at")
    private LocalDateTime processedAt;

    public enum MessageStatus {
        PENDING, ROUTED, ESCALATED, REJECTED
    }
}
