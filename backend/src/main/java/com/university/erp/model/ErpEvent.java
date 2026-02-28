package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "erp_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErpEvent {

    @Id
    private String eventId;   // E001, E002...

    @Column(nullable = false)
    private String title;

    private String eventType;   // exam | cultural_fest | schedule_change | fee_deadline

    private LocalDate eventDate;

    private String department;  // All or specific dept

    @Enumerated(EnumType.STRING)
    private EventStatus status;

    private Long sourceMessageId;

    private LocalDateTime createdAt;

    public enum EventStatus {
        SCHEDULED, REGISTRATION_OPEN, CONFIRMED, CANCELLED, COMPLETED
    }
}
