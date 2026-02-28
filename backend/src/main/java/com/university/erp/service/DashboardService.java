package com.university.erp.service;

import com.university.erp.model.Message;
import com.university.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.LinkedHashMap;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MessageRepository messageRepo;
    private final TeamsChannelRepository channelRepo;
    private final ErpEventRepository erpEventRepo;
    private final SystemLogRepository logRepo;

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        stats.put("totalMessages",   messageRepo.count());
        stats.put("routedMessages",  messageRepo.countByStatus(Message.MessageStatus.ROUTED));
        stats.put("pendingMessages", messageRepo.countByStatus(Message.MessageStatus.PENDING));
        stats.put("escalatedMessages", messageRepo.countByStatus(Message.MessageStatus.ESCALATED));
        stats.put("totalChannels",   channelRepo.count());
        stats.put("totalEvents",     erpEventRepo.count());
        stats.put("erpSynced",       messageRepo.countErpSynced());

        Map<String, Long> intentBreakdown = new LinkedHashMap<>();
        intentBreakdown.put("announcement", messageRepo.countByIntent("announcement"));
        intentBreakdown.put("query",        messageRepo.countByIntent("query"));
        intentBreakdown.put("task",         messageRepo.countByIntent("task"));
        stats.put("intentBreakdown", intentBreakdown);

        stats.put("recentMessages",  messageRepo.findAllByOrderByCreatedAtDesc()
            .stream().limit(5).toList());
        stats.put("recentLogs",      logRepo.findTop50ByOrderByTimestampDesc()
            .stream().limit(10).toList());
        stats.put("upcomingEvents",  erpEventRepo.findAllByOrderByCreatedAtDesc()
            .stream().limit(5).toList());

        return stats;
    }
}
