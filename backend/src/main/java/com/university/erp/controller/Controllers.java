package com.university.erp.controller;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import com.university.erp.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// ── Dashboard Controller ───────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }
}

// ── Knowledge Graph Controller ────────────────────────────────────────────────
@RestController
@RequestMapping("/api/knowledge-graph")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
class KnowledgeGraphController {
    private final KnowledgeGraphService kgService;
    private final SchoolRepository schoolRepo;
    private final DepartmentRepository deptRepo;
    private final ProgramRepository programRepo;
    private final TeamsChannelRepository channelRepo;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getGraph() {
        return ResponseEntity.ok(kgService.buildHierarchy(schoolRepo, deptRepo, programRepo));
    }

    @GetMapping("/schools")
    public ResponseEntity<List<School>> getSchools() {
        return ResponseEntity.ok(schoolRepo.findAll());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments(
        @RequestParam(required = false) String schoolId
    ) {
        List<Department> depts = schoolId != null
            ? deptRepo.findBySchoolId(schoolId)
            : deptRepo.findAll();
        return ResponseEntity.ok(depts);
    }

    @GetMapping("/programs")
    public ResponseEntity<List<Program>> getPrograms(
        @RequestParam(required = false) String deptId
    ) {
        List<Program> progs = deptId != null
            ? programRepo.findByDepartmentId(deptId)
            : programRepo.findAll();
        return ResponseEntity.ok(progs);
    }
}

// ── Channels Controller ────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/channels")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
class ChannelsController {
    private final TeamsChannelRepository channelRepo;

    @GetMapping
    public ResponseEntity<List<TeamsChannel>> getChannels() {
        return ResponseEntity.ok(channelRepo.findByActiveTrue());
    }

    @GetMapping("/{channelId}")
    public ResponseEntity<TeamsChannel> getChannel(@PathVariable String channelId) {
        return channelRepo.findById(channelId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}

// ── ERP Events Controller ──────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
class ErpEventsController {
    private final ErpEventRepository erpEventRepo;

    @GetMapping
    public ResponseEntity<List<ErpEvent>> getEvents(
        @RequestParam(required = false) String dept,
        @RequestParam(required = false) String type
    ) {
        List<ErpEvent> events;
        if (dept != null) {
            events = erpEventRepo.findByDepartmentIgnoreCase(dept);
        } else if (type != null) {
            events = erpEventRepo.findByEventType(type);
        } else {
            events = erpEventRepo.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<ErpEvent> getEvent(@PathVariable String eventId) {
        return erpEventRepo.findById(eventId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}

// ── System Logs Controller ─────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
class SystemLogsController {
    private final SystemLogRepository logRepo;

    @GetMapping
    public ResponseEntity<List<SystemLog>> getLogs(
        @RequestParam(required = false) String messageId,
        @RequestParam(defaultValue = "100") int limit
    ) {
        List<SystemLog> logs = messageId != null
            ? logRepo.findByMessageId(messageId)
            : logRepo.findTop50ByOrderByTimestampDesc();
        return ResponseEntity.ok(logs.stream().limit(limit).toList());
    }
}
