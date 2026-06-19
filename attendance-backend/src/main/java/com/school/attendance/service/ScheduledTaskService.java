package com.school.attendance.service;

import com.school.attendance.entity.QRCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledTaskService {

    private final AttendanceService attendanceService;
    private final QRCodeService qrCodeService;

    /**
     * Morning Session 1 - Auto-finalize at 9:35 AM
     */
    @Scheduled(cron = "${attendance.scheduler.morning1-cron}")
    public void finalizeMorning1() {
        log.info("Auto-finalizing Morning Session 1");
        autoFinalizeSession(QRCode.ClassBlock.MORNING_1);
    }

    /**
     * Morning Session 2 - Auto-finalize at 11:15 AM
     */
    @Scheduled(cron = "${attendance.scheduler.morning2-cron}")
    public void finalizeMorning2() {
        log.info("Auto-finalizing Morning Session 2");
        autoFinalizeSession(QRCode.ClassBlock.MORNING_2);
    }

    /**
     * Afternoon Session 1 - Auto-finalize at 1:35 PM
     */
    @Scheduled(cron = "${attendance.scheduler.afternoon1-cron}")
    public void finalizeAfternoon1() {
        log.info("Auto-finalizing Afternoon Session 1");
        autoFinalizeSession(QRCode.ClassBlock.AFTERNOON_1);
    }

    /**
     * Afternoon Session 2 - Auto-finalize at 3:15 PM
     */
    @Scheduled(cron = "${attendance.scheduler.afternoon2-cron}")
    public void finalizeAfternoon2() {
        log.info("Auto-finalizing Afternoon Session 2");
        autoFinalizeSession(QRCode.ClassBlock.AFTERNOON_2);
    }

    /**
     * Auto-finalize a session and send messages to absent students
     */
    private void autoFinalizeSession(QRCode.ClassBlock classBlock) {
        try {
            var notSubmitted = attendanceService.getNotSubmittedStudents(classBlock, null);
            List<Long> absentIds = notSubmitted.stream()
                    .map(s -> (Long) s.get("studentId"))
                    .toList();

            var result = attendanceService.finalizeAttendance(
                    classBlock,
                    absentIds,
                    List.of(),
                    List.of(),
                    "system-auto");

            log.info("Auto-finalized {}: {} absent, {} messages queued",
                    classBlock,
                    result.get("absent"),
                    result.get("messagesQueued"));
        } catch (Exception e) {
            log.error("Error auto-finalizing session {}: {}", classBlock, e.getMessage());
        }
    }

    /**
     * Weekly report on Sundays at 8 PM
     */
    @Scheduled(cron = "${attendance.scheduler.weekly-report-cron}")
    public void generateWeeklyReport() {
        log.info("Running weekly regular absentee check");
        var regularAbsentees = attendanceService.getRegularAbsentees(3, 30);
        log.info("Found {} regular absentees in the last 30 days", regularAbsentees.size());
    }
}
