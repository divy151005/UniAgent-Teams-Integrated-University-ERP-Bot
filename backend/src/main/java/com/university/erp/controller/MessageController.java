package com.university.erp.controller;

import com.university.erp.dto.MessageRequest;
import com.university.erp.model.Message;
import com.university.erp.repository.MessageRepository;
import com.university.erp.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class MessageController {

    private final MessageService messageService;
    private final MessageRepository messageRepo;
    
    /**
     * POST /api/messages/teams/webhook - Teams Bot Framework webhook endpoint
     */
    @PostMapping("/teams/webhook")
    public ResponseEntity<String> teamsWebhook(@RequestBody String rawActivity) {
        // Forward to MessageService.processTeamsMessage for bot activity processing
        messageService.processTeamsWebhook(rawActivity);
        return ResponseEntity.ok("OK");
    }

    /**
     * POST /api/messages — ingest & process a new message through NLP pipeline
     */
    @PostMapping
    public ResponseEntity<Message> ingestMessage(@Valid @RequestBody MessageRequest req) {
        Message result = messageService.processMessage(req.getRawText(), req.getFromUser());
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/messages — list all messages (optionally filter by status/intent)
     */
    @GetMapping
    public ResponseEntity<List<Message>> getMessages(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String intent
    ) {
        List<Message> messages;
        if (status != null) {
            try {
                messages = messageRepo.findByStatusOrderByCreatedAtDesc(
                    Message.MessageStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else if (intent != null) {
            messages = messageRepo.findByIntentOrderByCreatedAtDesc(intent.toLowerCase());
        } else {
            messages = messageRepo.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(messages);
    }

    /**
     * GET /api/messages/:id
     */
    @GetMapping("/{id}")
    public ResponseEntity<Message> getMessage(@PathVariable String id) {
        return messageRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/messages/:id/approve — admin approves pending message
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Message> approve(@PathVariable String id) {
        Message msg = messageService.approveMessage(id);
        return ResponseEntity.ok(msg);
    }

    /**
     * POST /api/messages/:id/reject
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<Message> reject(@PathVariable String id) {
        Message msg = messageService.rejectMessage(id);
        return ResponseEntity.ok(msg);
    }

    /**
     * GET /api/messages/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> stats() {
        return ResponseEntity.ok(Map.of(
            "total",     messageRepo.count(),
            "routed",    messageRepo.countByStatus(Message.MessageStatus.ROUTED),
            "pending",   messageRepo.countByStatus(Message.MessageStatus.PENDING),
            "escalated", messageRepo.countByStatus(Message.MessageStatus.ESCALATED)
        ));
    }
}
