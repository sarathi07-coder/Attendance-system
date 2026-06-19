package com.school.attendance.service;

import com.school.attendance.dto.DashboardStats;
import com.school.attendance.entity.Message;
import com.school.attendance.repository.AttendanceRepository;
import com.school.attendance.repository.MessageRepository;
import com.school.attendance.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final MessageRepository messageRepository;

    @Value("${school.absent.threshold:3}")
    private Long absentThreshold;

    @Value("${school.lookback.days:30}")
    private Integer lookbackDays;

    public DashboardStats getTodayStats() {
        LocalDate today = LocalDate.now();

        DashboardStats stats = new DashboardStats();
        stats.setDate(today);

        // Class strength by section
        Map<String, Long> classStrength = new HashMap<>();
        for (String section : List.of("A", "B", "C", "D")) {
            classStrength.put(section, studentRepository.countActiveStudentsBySection(section));
        }
        stats.setClassStrength(classStrength);

        // Absentees by section (count from attendance table)
        Map<String, Long> absentees = new HashMap<>();
        for (String section : List.of("A", "B", "C", "D")) {
            // Count students who haven't submitted today
            long totalStudents = studentRepository.countActiveStudentsBySection(section);
            long submitted = attendanceRepository.countSubmittedByDate(today);
            absentees.put(section, Math.max(0, totalStudents - submitted));
        }
        stats.setAbsentees(absentees);

        // Message statistics
        stats.setMessagesSent(messageRepository.countByDateAndStatus(today, Message.MessageStatus.SENT));
        stats.setMessagesFailed(messageRepository.countByDateAndStatus(today, Message.MessageStatus.FAILED));

        return stats;
    }
}
