package com.university.erp.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.university.erp.service.MessageService;

@Slf4j
@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class BotController {

    private final MessageService messageService;

    @PostMapping("/webhook/messages")
    public String teamsWebhook(@RequestBody String rawPayload) {
        log.info("Teams webhook payload received (length: {})", rawPayload.length());
        messageService.processTeamsWebhook(rawPayload);
        return "{\"type\":\"message\",\"text\":\"ERP Bot: Message received and processing...\"}";
    }
}


