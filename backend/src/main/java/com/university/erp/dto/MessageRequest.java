package com.university.erp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MessageRequest {
    @NotBlank(message = "rawText is required")
    private String rawText;

    private String fromUser = "Anonymous";
}
