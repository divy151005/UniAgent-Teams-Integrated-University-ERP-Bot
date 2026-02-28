package com.university.erp.service;

import com.university.erp.model.TeamsChannel;
import com.university.erp.repository.TeamsChannelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.*;
import java.util.stream.Collectors;

/**
 * Knowledge Graph Resolver
 * Translates extracted entities (e.g. "3rd year CSE") → target channel IDs
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeGraphService {

    private final TeamsChannelRepository channelRepository;

    /**
     * Resolve audience string and entity map → list of target channel IDs
     */
    public List<String> resolveTargetChannels(Map<String, String> entities) {
        String audience = entities.getOrDefault("audience", "");
        String dept = entities.getOrDefault("dept", "");
        String yearStr = entities.getOrDefault("year", "");

        log.debug("KG resolving: audience={}, dept={}, year={}", audience, dept, yearStr);

        // Broadcast to all
        if ("all".equalsIgnoreCase(audience) || audience.toLowerCase().contains("all")) {
            List<TeamsChannel> all = channelRepository.findByActiveTrue();
            log.info("KG resolved ALL channels: {}", all.size());
            return all.stream().map(TeamsChannel::getChannelId).collect(Collectors.toList());
        }

        // Specific dept + year
        if (!dept.isEmpty() && !yearStr.isEmpty()) {
            int year = extractYear(yearStr);
            if (year > 0) {
                List<TeamsChannel> channels = channelRepository.findByDeptCodeAndYear(dept, year);
                log.info("KG resolved dept={} year={}: {} channels", dept, year, channels.size());
                return channels.stream().map(TeamsChannel::getChannelId).collect(Collectors.toList());
            }
        }

        // Dept only
        if (!dept.isEmpty()) {
            List<TeamsChannel> channels = channelRepository.findByDeptCode(dept);
            log.info("KG resolved dept={}: {} channels", dept, channels.size());
            return channels.stream().map(TeamsChannel::getChannelId).collect(Collectors.toList());
        }

        log.warn("KG could not resolve any channels for entities: {}", entities);
        return Collections.emptyList();
    }

    private int extractYear(String yearStr) {
        Pattern p = Pattern.compile("(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(yearStr);
        if (m.find()) {
            int yr = Integer.parseInt(m.group(1));
            return (yr >= 1 && yr <= 6) ? yr : 0;
        }
        return 0;
    }

    /**
     * Build the full knowledge graph hierarchy for admin view
     */
    public Map<String, Object> buildHierarchy(
        com.university.erp.repository.SchoolRepository schoolRepo,
        com.university.erp.repository.DepartmentRepository deptRepo,
        com.university.erp.repository.ProgramRepository programRepo
    ) {
        Map<String, Object> graph = new LinkedHashMap<>();
        var schools = schoolRepo.findAll();
        List<Map<String, Object>> schoolNodes = new ArrayList<>();

        for (var school : schools) {
            Map<String, Object> sNode = new LinkedHashMap<>();
            sNode.put("id", school.getId());
            sNode.put("name", school.getName());
            sNode.put("code", school.getCode());
            sNode.put("type", "SCHOOL");

            List<Map<String, Object>> deptNodes = new ArrayList<>();
            var depts = deptRepo.findBySchoolId(school.getId());
            for (var dept : depts) {
                Map<String, Object> dNode = new LinkedHashMap<>();
                dNode.put("id", dept.getId());
                dNode.put("name", dept.getName());
                dNode.put("code", dept.getCode());
                dNode.put("type", "DEPARTMENT");

                List<Map<String, Object>> progNodes = new ArrayList<>();
                var progs = programRepo.findByDepartmentId(dept.getId());
                for (var prog : progs) {
                    Map<String, Object> pNode = new LinkedHashMap<>();
                    pNode.put("id", prog.getId());
                    pNode.put("name", prog.getName());
                    pNode.put("type", "PROGRAM");
                    pNode.put("durationYears", prog.getDurationYears());

                    var channels = channelRepository.findByProgramId(prog.getId());
                    pNode.put("channels", channels.stream().map(c -> Map.of(
                        "channelId", c.getChannelId(),
                        "channelName", c.getChannelName(),
                        "year", c.getYear(),
                        "memberCount", c.getMemberCount(),
                        "type", "CHANNEL"
                    )).collect(Collectors.toList()));

                    progNodes.add(pNode);
                }
                dNode.put("programs", progNodes);
                deptNodes.add(dNode);
            }
            sNode.put("departments", deptNodes);
            schoolNodes.add(sNode);
        }

        graph.put("schools", schoolNodes);
        graph.put("totalChannels", channelRepository.count());
        return graph;
    }
}
