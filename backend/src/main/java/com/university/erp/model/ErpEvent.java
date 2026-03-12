package com.university.erp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "erp_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErpEvent {

    @Id
    private String eventId;   // E001, E002...

    private String title;

    @Field(name = "event_type")
    private String eventType;   // exam | cultural_fest | schedule_change | fee_deadline

    @Field(name = "event_date")
    private LocalDate eventDate;

    private String department;  // All or specific dept

    private EventStatus status;

    @Field(name = "source_message_id")
    private String sourceMessageId;

    @Field(name = "created_at")
    private LocalDateTime createdAt;

    public enum EventStatus {
        SCHEDULED, REGISTRATION_OPEN, CONFIRMED, CANCELLED, COMPLETED
    }
}
