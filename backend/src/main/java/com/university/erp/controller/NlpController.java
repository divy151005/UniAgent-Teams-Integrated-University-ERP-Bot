package com.university.erp.controller;

import com.university.erp.dto.MessageRequest;
import com.university.erp.nlp.NlpPipelineEngine;
import com.university.erp.service.KnowledgeGraphService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * NLP Pipeline endpoint — returns full pipeline analysis without persisting
 */
@RestController
@RequestMapping("/api/nlp")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class NlpController {

    private final NlpPipelineEngine nlpEngine;
    private final KnowledgeGraphService kgService;

    /**
     * POST /api/nlp/analyze — run pipeline steps and return analysis
     */
    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyze(@RequestBody MessageRequest req) {
        String text = req.getRawText();
        Map<String, Object> result = new LinkedHashMap<>();

        // Step 1: Intent
        NlpPipelineEngine.IntentResult intent = nlpEngine.classifyIntent(text);
        result.put("step", "complete");

        result.put("intent", intent.intent());
        result.put("intentConfidence", intent.confidence());

        // Step 2: Entities
        NlpPipelineEngine.EntityResult entities = nlpEngine.extractEntities(text);
        result.put("entities", entities.entities());

        // Step 3: KG Resolution
        List<String> channels = kgService.resolveTargetChannels(entities.entities());
        result.put("resolvedChannels", channels);
        result.put("channelCount", channels.size());

        // Step 4: Policy decision
        String policy;
        if ("query".equals(intent.intent())) {
            policy = "ESCALATE_TO_ADMIN";
        } else if (!channels.isEmpty()) {
            policy = "ROUTE_TO_CHANNELS";
        } else {
            policy = "ESCALATE_NO_AUDIENCE";
        }
        result.put("policyDecision", policy);

        // Step 5: ERP needed?
        boolean erpNeeded = entities.entities().containsKey("event_type")
            && "announcement".equals(intent.intent())
            && !channels.isEmpty();
        result.put("erpSyncRequired", erpNeeded);

        return ResponseEntity.ok(result);
    }
}
