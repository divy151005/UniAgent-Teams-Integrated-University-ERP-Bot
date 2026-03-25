package com.university.erp.config;

import com.university.erp.model.*;
import com.university.erp.repository.*;
import com.university.erp.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final SchoolRepository schoolRepo;
    private final DepartmentRepository deptRepo;
    private final ProgramRepository programRepo;
    private final TeamsChannelRepository channelRepo;
    private final ErpEventRepository erpEventRepo;
    private final SystemLogRepository logRepo;
    private final MessageService messageService;

    @Override
    public void run(String... args) {
        if (schoolRepo.count() > 0) return;
        log.info("Seeding database with university data...");

        // ── Schools ───────────────────────────────────────────────────────────
        School engSchool = schoolRepo.save(School.builder()
            .name("School of Engineering & Technology").code("SET").build());
        School mgmtSchool = schoolRepo.save(School.builder()
            .name("School of Management").code("SOM").build());
        School sciSchool = schoolRepo.save(School.builder()
            .name("School of Sciences").code("SOS").build());

        // ── Departments ───────────────────────────────────────────────────────
        Department cse = deptRepo.save(Department.builder().name("Computer Science & Engineering")
            .code("CSE").schoolId(engSchool.getId()).build());
        Department ece = deptRepo.save(Department.builder().name("Electronics & Communication Engineering")
            .code("ECE").schoolId(engSchool.getId()).build());
        Department mech = deptRepo.save(Department.builder().name("Mechanical Engineering")
            .code("MECH").schoolId(engSchool.getId()).build());
        Department mba = deptRepo.save(Department.builder().name("Master of Business Administration")
            .code("MBA").schoolId(mgmtSchool.getId()).build());
        Department phy = deptRepo.save(Department.builder().name("Physics")
            .code("PHYSICS").schoolId(sciSchool.getId()).build());

        // ── Programs ──────────────────────────────────────────────────────────
        Program cseBtech = programRepo.save(Program.builder().name("B.Tech").durationYears(4).departmentId(cse.getId()).build());
        Program cseMtech = programRepo.save(Program.builder().name("M.Tech").durationYears(2).departmentId(cse.getId()).build());
        Program eceBtech = programRepo.save(Program.builder().name("B.Tech").durationYears(4).departmentId(ece.getId()).build());
        Program mechBtech = programRepo.save(Program.builder().name("B.Tech").durationYears(4).departmentId(mech.getId()).build());
        Program mbaProg  = programRepo.save(Program.builder().name("MBA").durationYears(2).departmentId(mba.getId()).build());

        // ── Teams Channels ────────────────────────────────────────────────────
        // CSE B.Tech years 1-4
        channelRepo.saveAll(List.of(
            ch("CH001", "CSE_BTech_1st_Year", cseBtech, 1, 120),
            ch("CH002", "CSE_BTech_2nd_Year", cseBtech, 2, 118),
            ch("CH003", "CSE_BTech_3rd_Year", cseBtech, 3, 115),
            ch("CH004", "CSE_BTech_4th_Year", cseBtech, 4, 112),
            // CSE M.Tech
            ch("CH005", "CSE_MTech_1st_Year", cseMtech, 1, 45),
            ch("CH006", "CSE_MTech_2nd_Year", cseMtech, 2, 42),
            // ECE B.Tech years 1-4
            ch("CH007", "ECE_BTech_1st_Year", eceBtech, 1, 90),
            ch("CH008", "ECE_BTech_2nd_Year", eceBtech, 2, 88),
            ch("CH009", "ECE_BTech_3rd_Year", eceBtech, 3, 86),
            ch("CH010", "ECE_BTech_4th_Year", eceBtech, 4, 83),
            // MECH B.Tech
            ch("CH011", "MECH_BTech_1st_Year", mechBtech, 1, 75),
            ch("CH012", "MECH_BTech_2nd_Year", mechBtech, 2, 73),
            // MBA
            ch("CH013", "MBA_1st_Year", mbaProg, 1, 60),
            ch("CH014", "MBA_2nd_Year", mbaProg, 2, 58)
        ));

        // ── Seed ERP Events ───────────────────────────────────────────────────
        erpEventRepo.saveAll(List.of(
            ErpEvent.builder().eventId("E001").title("CSE Mid-Semester Exam").eventType("exam")
                .eventDate(LocalDate.now().plusDays(18)).department("CSE")
                .status(ErpEvent.EventStatus.SCHEDULED).createdAt(LocalDateTime.now()).build(),
            ErpEvent.builder().eventId("E002").title("Annual Cultural Fest").eventType("cultural_fest")
                .eventDate(LocalDate.now().plusDays(4)).department("All")
                .status(ErpEvent.EventStatus.REGISTRATION_OPEN).createdAt(LocalDateTime.now()).build(),
            ErpEvent.builder().eventId("E003").title("ECE Lab Reschedule").eventType("schedule_change")
                .eventDate(LocalDate.now().plusDays(2)).department("ECE")
                .status(ErpEvent.EventStatus.CONFIRMED).createdAt(LocalDateTime.now()).build()
        ));

        // ── Seed system logs ──────────────────────────────────────────────────
        logRepo.save(SystemLog.builder().timestamp(LocalDateTime.now().minusMinutes(45))
            .source("System").level(SystemLog.LogLevel.SUCCESS)
            .event("University ERP Agent started — all services online").build());
        logRepo.save(SystemLog.builder().timestamp(LocalDateTime.now().minusMinutes(44))
            .source("KG Resolver").level(SystemLog.LogLevel.INFO)
            .event("Knowledge graph loaded: 3 schools, 5 depts, 5 programs, 14 channels").build());
        logRepo.save(SystemLog.builder().timestamp(LocalDateTime.now().minusMinutes(43))
            .source("Teams Bot").level(SystemLog.LogLevel.SUCCESS)
            .event("Teams bot connected and listening on 14 channels").build());

        // ── Seed sample messages through pipeline ─────────────────────────────
        messageService.processMessage(
            "Attention all 3rd year B.Tech CSE students: Mid-semester exams begin March 15th. Timetable will be shared soon.",
            "Dr. Sharma (HOD-CSE)"
        );
        messageService.processMessage(
            "All departments: Annual cultural fest registrations are open till Feb 28. Please circulate to all students.",
            "Dean's Office"
        );
        messageService.processMessage(
            "1st year ECE students: Lab session has been rescheduled to Thursday 2 PM.",
            "Prof. Mehta (ECE)"
        );
        messageService.processMessage(
            "What is the deadline for project submission for CSE 2nd year?",
            "Student (Rahul, CSE-2)"
        );
        messageService.processMessage(
            "Fee payment deadline for all programs extended to March 5th.",
            "Finance Office"
        );

        log.info("Database seeding complete.");
    }

    private TeamsChannel ch(String id, String name, Program prog, int year, int members) {
        return TeamsChannel.builder()
            .channelId(id).channelName(name).programId(prog.getId())
            .year(year).memberCount(members).active(true).build();
    }
}
