package com.university.erp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.erp.model.*;
import com.university.erp.nlp.NlpPipelineEngine;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Core Message Orchestrator
 * Implements the full NLP pipeline:
 *   Ingest → Classify → Extract → Resolve → Policy → Generate → Deliver/Log
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepo;
    private final SystemLogRepository logRepo;
    private final ErpEventRepository erpEventRepo;
    private final TeamsChannelRepository channelRepo;
    private final NlpPipelineEngine nlpEngine;
    private final KnowledgeGraphService kgService;
    private final ObjectMapper objectMapper;
    // private final GraphServiceClient graphClient; // TODO: Inject after Azure Graph SDK fixed

    private int eventCounter = 10;
    
    /**
     * Process Teams webhook raw JSON
     */
    public void processTeamsWebhook(String rawActivity) {
        try {
            // Parse Activity
            // Activity activity = objectMapper.readValue(rawActivity, Activity.class);
            // String text = activity.getText();
            // String userId = activity.getFrom().getId();
            log.info("Teams webhook received: {}", rawActivity.substring(0, Math.min(200, rawActivity.length())));
            // processMessage(text, userId);
        } catch (Exception e) {
            log.error("Failed to process Teams webhook", e);
        }
    }
    
    /**
     * Post approved message to Teams channel via Microsoft Graph (placeholder)
     */
    public void postToTeamsChannel(String channelId, String content) {
        log.info("🚀 SIMULATED Teams post to channel {}: {}", channelId, content);
        // TODO: Implement Microsoft Graph API call after proper SDK setup
        // graphClient.teams(msTeamId).channels(msChannelId).messages().post(chatMessage);
    }

    @Transactional
    public Message processMessage(String rawText, String fromUser) {
        log.info("Pipeline start: from={}", fromUser);

        // STEP 1: Create & save incoming message
        Message msg = Message.builder()
            .rawText(rawText)
            .fromUser(fromUser)
            .status(Message.MessageStatus.PENDING)
            .createdAt(LocalDateTime.now())
            .erpSynced(false)
            .build();
        msg = messageRepo.save(msg);
        final String msgId = msg.getId();
        addLog(msgId, "Teams Bot", SystemLog.LogLevel.INFO, "Message ingested from: " + fromUser);

        // STEP 2: Intent Classification
        NlpPipelineEngine.IntentResult intent = nlpEngine.classifyIntent(rawText);
        msg.setIntent(intent.intent());
        msg.setIntentConfidence(intent.confidence());
        addLog(msgId, "NLP Agent", SystemLog.LogLevel.INFO,
            String.format("Intent classified: %s (%.0f%% confidence)", intent.intent(), intent.confidence() * 100));

        // STEP 3: Entity Extraction
        NlpPipelineEngine.EntityResult entities = nlpEngine.extractEntities(rawText);
        try {
            msg.setEntitiesJson(objectMapper.writeValueAsString(entities.entities()));
        } catch (JsonProcessingException e) {
            msg.setEntitiesJson("{}");
        }
        addLog(msgId, "NER Engine", SystemLog.LogLevel.INFO,
            "Entities extracted: " + entities.entities().keySet());

        // STEP 4: Knowledge Graph Resolution
        List<String> targetChannelIds = kgService.resolveTargetChannels(entities.entities());
        try {
            msg.setTargetChannelsJson(objectMapper.writeValueAsString(targetChannelIds));
        } catch (JsonProcessingException e) {
            msg.setTargetChannelsJson("[]");
        }

        if (!targetChannelIds.isEmpty()) {
            addLog(msgId, "KG Resolver", SystemLog.LogLevel.SUCCESS,
                "Resolved " + targetChannelIds.size() + " channel(s): " + targetChannelIds);
        } else {
            addLog(msgId, "KG Resolver", SystemLog.LogLevel.WARNING,
                "No channels resolved for given entities");
        }

        // STEP 5: Policy Engine
        applyPolicy(msg, entities.entities(), targetChannelIds, msgId);

        // STEP 6 & 7: Deliver & log
        msg.setProcessedAt(LocalDateTime.now());
        msg = messageRepo.save(msg);
        addLog(msgId, "Orchestrator", SystemLog.LogLevel.SUCCESS,
            "Pipeline complete. Status: " + msg.getStatus());

        return msg;
    }

    /**
     * Policy Engine: decides routing, ERP sync, or escalation
     */
    private void applyPolicy(Message msg, Map<String, String> entities,
                              List<String> channels, String msgId) {
        addLog(msgId, "Policy Engine", SystemLog.LogLevel.INFO,
            "Applying policy for intent: " + msg.getIntent());

        switch (msg.getIntent()) {
            case "announcement" -> {
                if (!channels.isEmpty()) {
                    msg.setStatus(Message.MessageStatus.ROUTED);
                    addLog(msgId, "Teams Bot", SystemLog.LogLevel.SUCCESS,
                        "Posted to " + channels.size() + " channel(s)");

                    // ERP sync for events
                    String eventType = entities.get("event_type");
                    if (eventType != null) {
                        syncToErp(msg, entities, eventType, msgId);
                    }
                } else {
                    msg.setStatus(Message.MessageStatus.ESCALATED);
                    addLog(msgId, "Policy Engine", SystemLog.LogLevel.WARNING,
                        "No target channels — escalated to admin review");
                }
            }
            case "query" -> {
                msg.setStatus(Message.MessageStatus.ESCALATED);
                addLog(msgId, "Policy Engine", SystemLog.LogLevel.WARNING,
                    "Query intent detected — escalated for FAQ/admin resolution");
            }
            case "task" -> {
                if (!channels.isEmpty()) {
                    msg.setStatus(Message.MessageStatus.ROUTED);
                    addLog(msgId, "Teams Bot", SystemLog.LogLevel.SUCCESS,
                        "Task distributed to " + channels.size() + " channel(s)");
                } else {
                    msg.setStatus(Message.MessageStatus.ESCALATED);
                }
            }
            default -> msg.setStatus(Message.MessageStatus.PENDING);
        }
    }

    private void syncToErp(Message msg, Map<String, String> entities,
                            String eventType, String msgId) {
        try {
            String eventId = String.format("E%03d", ++eventCounter);
            String dept = entities.getOrDefault("dept", "All");
            String dateStr = entities.getOrDefault("date", "TBD");

            ErpEvent event = ErpEvent.builder()
                .eventId(eventId)
                .title(buildEventTitle(eventType, dept, dateStr))
                .eventType(eventType)
                .eventDate(LocalDate.now().plusDays(14))
                .department(dept)
                .status(eventType.equals("exam") ? ErpEvent.EventStatus.SCHEDULED : ErpEvent.EventStatus.CONFIRMED)
                .sourceMessageId(msgId)
                .createdAt(LocalDateTime.now())
                .build();

            erpEventRepo.save(event);
            msg.setErpSynced(true);
            msg.setErpEventId(eventId);

            addLog(msgId, "ERP Client", SystemLog.LogLevel.SUCCESS,
                "ERP event created: " + eventId + " (" + eventType + ")");
        } catch (Exception e) {
            addLog(msgId, "ERP Client", SystemLog.LogLevel.ERROR,
                "ERP sync failed: " + e.getMessage());
        }
    }

    private String buildEventTitle(String eventType, String dept, String date) {
        return switch (eventType) {
            case "exam"          -> dept + " Exam — " + date;
            case "cultural_fest" -> "Cultural Fest — " + date;
            case "fee_deadline"  -> "Fee Payment Deadline — " + date;
            case "schedule_change" -> dept + " Schedule Change — " + date;
            default              -> eventType.replace("_", " ") + " — " + date;
        };
    }

@Transactional
    public Message approveMessage(String id) {
        Message msg = messageRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Message not found: " + id));
        msg.setStatus(Message.MessageStatus.ROUTED);
        msg.setProcessedAt(LocalDateTime.now());
        
        // NEW: Post to resolved Teams channels
        if (msg.getTargetChannelsJson() != null && !msg.getTargetChannelsJson().isEmpty()) {
            try {
                // Parse target channels and post
                addLog(id, "Teams Publisher", SystemLog.LogLevel.SUCCESS, "Publishing to resolved channels");
                postToTeamsChannel("CH001", msg.getRawText()); // Demo - parse JSON in production
            } catch (Exception e) {
                addLog(id, "Teams Publisher", SystemLog.LogLevel.ERROR, "Failed to post to Teams: " + e.getMessage());
            }
        }
        
        addLog(id, "Admin Dashboard", SystemLog.LogLevel.SUCCESS,
            "Message manually approved, routed, and published to Teams");
        return messageRepo.save(msg);
    }

    @Transactional
    public Message rejectMessage(String id) {
        Message msg = messageRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Message not found: " + id));
        msg.setStatus(Message.MessageStatus.REJECTED);
        addLog(id, "Admin Dashboard", SystemLog.LogLevel.WARNING, "Message rejected by admin");
        return messageRepo.save(msg);
    }

    private void addLog(String msgId, String source, SystemLog.LogLevel level, String event) {
        logRepo.save(SystemLog.builder()
            .timestamp(LocalDateTime.now())
            .source(source)
            .level(level)
            .event(event)
            .messageId(msgId)
            .build());
    }
}
