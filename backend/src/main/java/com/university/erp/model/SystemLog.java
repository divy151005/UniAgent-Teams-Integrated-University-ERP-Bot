package com.university.erp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.*;
import java.time.LocalDateTime;

@Document(collection = "system_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemLog {

    @Id
    private Long id;

    private LocalDateTime timestamp;

    private String source;    // NLP Agent | KG Resolver | Policy Engine | Teams Bot | ERP Client

    private String event;

    private LogLevel level;

    @Field(name = "message_id")
    private Long messageId;

    public enum LogLevel {
        INFO, SUCCESS, WARNING, ERROR
    }
}
