package com.university.erp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String source;    // NLP Agent | KG Resolver | Policy Engine | Teams Bot | ERP Client

    @Column(nullable = false, length = 1000)
    private String event;

    @Enumerated(EnumType.STRING)
    private LogLevel level;

    private Long messageId;

    public enum LogLevel {
        INFO, SUCCESS, WARNING, ERROR
    }
}
