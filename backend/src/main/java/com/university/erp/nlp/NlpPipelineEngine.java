package com.university.erp.nlp;

import org.springframework.stereotype.Component;
import java.util.*;
import java.util.regex.*;

/**
 * NLP Pipeline Engine
 * Performs intent classification, entity extraction, and audience resolution
 * using rule-based + keyword matching (production: replace with spaCy/OpenNLP)
 */
@Component
public class NlpPipelineEngine {

    // ── Intent Classification ─────────────────────────────────────────────────

    private static final List<String> ANNOUNCEMENT_KEYWORDS = Arrays.asList(
        "attention", "notice", "inform", "circulate", "all students", "announced",
        "scheduled", "rescheduled", "cancelled", "extended", "deadline", "exam",
        "timetable", "holiday", "registration", "fest", "session", "postponed"
    );
    private static final List<String> QUERY_KEYWORDS = Arrays.asList(
        "what", "when", "where", "how", "why", "?", "please tell", "can you",
        "do you know", "is there", "are there", "deadline for"
    );
    private static final List<String> TASK_KEYWORDS = Arrays.asList(
        "please submit", "submit by", "please send", "send your", "upload",
        "fill the form", "register by", "complete the", "assignment"
    );

    public IntentResult classifyIntent(String text) {
        String lower = text.toLowerCase();
        int announcementScore = 0, queryScore = 0, taskScore = 0;

        for (String kw : ANNOUNCEMENT_KEYWORDS) if (lower.contains(kw)) announcementScore += 2;
        for (String kw : QUERY_KEYWORDS)         if (lower.contains(kw)) queryScore += 2;
        for (String kw : TASK_KEYWORDS)           if (lower.contains(kw)) taskScore += 2;

        // Boost query score if ends with ?
        if (lower.trim().endsWith("?")) queryScore += 3;

        int total = Math.max(1, announcementScore + queryScore + taskScore);
        String intent;
        double confidence;

        if (queryScore > announcementScore && queryScore > taskScore) {
            intent = "query";
            confidence = Math.min(0.98, 0.55 + (double) queryScore / total * 0.43);
        } else if (taskScore > announcementScore) {
            intent = "task";
            confidence = Math.min(0.96, 0.55 + (double) taskScore / total * 0.41);
        } else {
            intent = "announcement";
            confidence = Math.min(0.99, 0.60 + (double) announcementScore / total * 0.39);
        }

        return new IntentResult(intent, Math.round(confidence * 100.0) / 100.0);
    }

    // ── Entity Extraction ─────────────────────────────────────────────────────

    public EntityResult extractEntities(String text) {
        String lower = text.toLowerCase();
        Map<String, String> entities = new LinkedHashMap<>();

        // Year extraction
        Pattern yearPattern = Pattern.compile("(\\d+)(st|nd|rd|th)\\s+year", Pattern.CASE_INSENSITIVE);
        Matcher yearMatcher = yearPattern.matcher(lower);
        if (yearMatcher.find()) {
            entities.put("year", yearMatcher.group(0));
        }

        // Department extraction
        Map<String, String> deptAliases = new LinkedHashMap<>();
        deptAliases.put("computer science|cse|cs", "CSE");
        deptAliases.put("electronics|ece|ec", "ECE");
        deptAliases.put("mechanical|mech|me", "ME");
        deptAliases.put("civil|ce", "CE");
        deptAliases.put("mba|management", "MBA");
        deptAliases.put("physics|phy", "PHYSICS");

        for (Map.Entry<String, String> entry : deptAliases.entrySet()) {
            if (Pattern.compile("\\b(" + entry.getKey() + ")\\b", Pattern.CASE_INSENSITIVE).matcher(lower).find()) {
                entities.put("dept", entry.getValue());
                break;
            }
        }

        // Date extraction
        Pattern datePattern = Pattern.compile(
            "(january|february|march|april|may|june|july|august|september|october|november|december|" +
            "jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\\s*\\d{1,2}(st|nd|rd|th)?|" +
            "\\d{1,2}\\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|" +
            "(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\\s*(\\d{1,2}\\s*(am|pm))?|" +
            "\\d{1,2}/\\d{1,2}/\\d{2,4}",
            Pattern.CASE_INSENSITIVE
        );
        Matcher dateMatcher = datePattern.matcher(lower);
        if (dateMatcher.find()) {
            entities.put("date", dateMatcher.group(0).trim());
        }

        // Event type extraction
        if (lower.contains("exam") || lower.contains("test") || lower.contains("mid-semester") || lower.contains("semester exam")) {
            entities.put("event_type", "exam");
        } else if (lower.contains("fest") || lower.contains("festival") || lower.contains("cultural")) {
            entities.put("event_type", "cultural_fest");
        } else if (lower.contains("fee") || lower.contains("payment")) {
            entities.put("event_type", "fee_deadline");
        } else if (lower.contains("rescheduled") || lower.contains("reschedule") || lower.contains("postponed")) {
            entities.put("event_type", "schedule_change");
        } else if (lower.contains("lab") || lower.contains("laboratory")) {
            entities.put("event_type", "lab_session");
        } else if (lower.contains("seminar") || lower.contains("workshop")) {
            entities.put("event_type", "seminar");
        }

        // Audience extraction
        boolean hasAll = lower.contains("all students") || lower.contains("all departments") ||
                         lower.contains("all programs") || lower.contains("everyone");
        if (hasAll) {
            entities.put("audience", "all");
        } else if (entities.containsKey("year") && entities.containsKey("dept")) {
            entities.put("audience", entities.get("year") + " " + entities.get("dept"));
        } else if (entities.containsKey("dept")) {
            entities.put("audience", entities.get("dept"));
        }

        // Location extraction
        Pattern locationPattern = Pattern.compile(
            "\\b(room|hall|lab|auditorium|block|building)\\s*[a-z0-9]+\\b", Pattern.CASE_INSENSITIVE
        );
        Matcher locMatcher = locationPattern.matcher(lower);
        if (locMatcher.find()) {
            entities.put("location", locMatcher.group(0).trim());
        }

        return new EntityResult(entities);
    }

    // ── Result DTOs ───────────────────────────────────────────────────────────

    public record IntentResult(String intent, double confidence) {}

    public record EntityResult(Map<String, String> entities) {}
}
