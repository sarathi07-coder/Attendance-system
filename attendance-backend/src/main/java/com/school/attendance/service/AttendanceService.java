package com.school.attendance.service;

import com.school.attendance.entity.Attendance;
import com.school.attendance.entity.QRCode;
import com.school.attendance.entity.Student;
import com.school.attendance.repository.AttendanceRepository;
import com.school.attendance.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final MessageService messageService;

    /**
     * Get list of students who have submitted (checked in) for a session
     */
    public List<Map<String, Object>> getSubmittedStudents(QRCode.ClassBlock classBlock, String section) {
        LocalDate today = LocalDate.now();
        List<Attendance> submitted;

        if (section != null && !section.isEmpty()) {
            submitted = attendanceRepository.findByAttendanceDateAndClassBlockAndSection(today, classBlock, section)
                    .stream()
                    .filter(Attendance::getSubmittedByStudent)
                    .collect(Collectors.toList());
        } else {
            submitted = attendanceRepository.findSubmittedByDateAndBlock(today, classBlock);
        }

        return submitted.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("studentId", a.getStudent().getId());
            map.put("rollNo", a.getStudent().getRollNo());
            map.put("studentName", a.getStudent().getStudentName());
            map.put("section", a.getStudent().getSection());
            map.put("submissionTime", a.getSubmissionTime());
            map.put("attendanceType", a.getAttendanceType());
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * Get list of students who have NOT submitted for a session
     */
    public List<Map<String, Object>> getNotSubmittedStudents(QRCode.ClassBlock classBlock, String section) {
        LocalDate today = LocalDate.now();

        // Get all active students
        List<Student> allStudents;
        if (section != null && !section.isEmpty()) {
            allStudents = studentRepository.findBySection(section).stream()
                    .filter(s -> s.getEnrollmentStatus() == Student.EnrollmentStatus.ACTIVE)
                    .collect(Collectors.toList());
        } else {
            allStudents = studentRepository.findAll().stream()
                    .filter(s -> s.getEnrollmentStatus() == Student.EnrollmentStatus.ACTIVE)
                    .collect(Collectors.toList());
        }

        // Get submitted student IDs
        List<Long> submittedIds = attendanceRepository.findSubmittedByDateAndBlock(today, classBlock)
                .stream()
                .map(a -> a.getStudent().getId())
                .collect(Collectors.toList());

        // Filter out submitted students
        return allStudents.stream()
                .filter(s -> !submittedIds.contains(s.getId()))
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("studentId", s.getId());
                    map.put("rollNo", s.getRollNo());
                    map.put("studentName", s.getStudentName());
                    map.put("section", s.getSection());
                    map.put("parentPhone", s.getParentPhone());
                    map.put("studentPhone", s.getStudentPhone());
                    return map;
                })
                .collect(Collectors.toList());
    }

    /**
     * Update attendance type (OD, Pre-informed, Absent)
     */
    @Transactional
    public void updateAttendanceType(Long studentId, QRCode.ClassBlock classBlock,
            Attendance.AttendanceType type, String markedBy) {
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository
                .findByStudentIdAndAttendanceDateAndClassBlock(studentId, today, classBlock)
                .orElseGet(() -> {
                    Student student = studentRepository.findById(studentId)
                            .orElseThrow(() -> new RuntimeException("Student not found"));

                    Attendance a = new Attendance();
                    a.setStudent(student);
                    a.setAttendanceDate(today);
                    a.setSection(student.getSection());
                    a.setClassBlock(classBlock);
                    return a;
                });

        attendance.setAttendanceType(type);
        attendance.setStatus(type == Attendance.AttendanceType.PRESENT ? Attendance.AttendanceStatus.PRESENT
                : Attendance.AttendanceStatus.ABSENT);
        attendance.setMarkedBy(markedBy);

        attendanceRepository.save(attendance);
        log.info("Updated attendance for student {} to {} by {}", studentId, type, markedBy);
    }

    /**
     * Finalize attendance for a session and send messages
     */
    @Transactional
    public Map<String, Object> finalizeAttendance(QRCode.ClassBlock classBlock,
            List<Long> absentStudentIds,
            List<Long> odStudentIds,
            List<Long> preInformedIds,
            String finalizedBy) {
        LocalDate today = LocalDate.now();
        List<Attendance> toSendMessages = new ArrayList<>();

        // Get all active students
        List<Student> allStudents = studentRepository.findAll().stream()
                .filter(s -> s.getEnrollmentStatus() == Student.EnrollmentStatus.ACTIVE)
                .collect(Collectors.toList());

        // Get submitted student IDs
        List<Long> submittedIds = attendanceRepository.findSubmittedByDateAndBlock(today, classBlock)
                .stream()
                .map(a -> a.getStudent().getId())
                .collect(Collectors.toList());

        int messagesQueued = 0;

        for (Student student : allStudents) {
            Attendance attendance = attendanceRepository
                    .findByStudentIdAndAttendanceDateAndClassBlock(student.getId(), today, classBlock)
                    .orElseGet(() -> {
                        Attendance a = new Attendance();
                        a.setStudent(student);
                        a.setAttendanceDate(today);
                        a.setSection(student.getSection());
                        a.setClassBlock(classBlock);
                        return a;
                    });

            // Determine status
            if (submittedIds.contains(student.getId())) {
                attendance.setAttendanceType(Attendance.AttendanceType.PRESENT);
                attendance.setStatus(Attendance.AttendanceStatus.PRESENT);
            } else if (odStudentIds != null && odStudentIds.contains(student.getId())) {
                attendance.setAttendanceType(Attendance.AttendanceType.OD);
                attendance.setStatus(Attendance.AttendanceStatus.ABSENT);
            } else if (preInformedIds != null && preInformedIds.contains(student.getId())) {
                attendance.setAttendanceType(Attendance.AttendanceType.PRE_INFORMED);
                attendance.setStatus(Attendance.AttendanceStatus.ABSENT);
            } else {
                // Not submitted and not OD/pre-informed = absent
                attendance.setAttendanceType(Attendance.AttendanceType.ABSENT);
                attendance.setStatus(Attendance.AttendanceStatus.ABSENT);
                toSendMessages.add(attendance);
            }

            attendance.setIsFinalized(true);
            attendance.setFinalizedAt(LocalDateTime.now());
            attendance.setFinalizedBy(finalizedBy);

            attendanceRepository.save(attendance);
        }

        // Send WhatsApp messages to absent students' parents
        for (Attendance a : toSendMessages) {
            try {
                messageService.sendAbsentNotification(a);
                messagesQueued++;
            } catch (Exception e) {
                log.error("Failed to send message for student {}: {}",
                        a.getStudent().getRollNo(), e.getMessage());
            }
        }

        log.info("Finalized attendance for {} by {}. Messages queued: {}",
                classBlock, finalizedBy, messagesQueued);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("session", classBlock);
        result.put("totalStudents", allStudents.size());
        result.put("present", submittedIds.size());
        result.put("absent", toSendMessages.size());
        result.put("od", odStudentIds != null ? odStudentIds.size() : 0);
        result.put("preInformed", preInformedIds != null ? preInformedIds.size() : 0);
        result.put("messagesQueued", messagesQueued);

        return result;
    }

    /**
     * Get regular absentees
     */
    public List<Map<String, Object>> getRegularAbsentees(int threshold, int lookbackDays) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(lookbackDays);

        List<Object[]> results = attendanceRepository.findRegularAbsentees(startDate, endDate, (long) threshold);

        return results.stream().map(row -> {
            Long studentId = (Long) row[0];
            Long absentCount = (Long) row[1];

            Student student = studentRepository.findById(studentId).orElse(null);
            if (student == null)
                return null;

            Map<String, Object> map = new HashMap<>();
            map.put("studentId", studentId);
            map.put("rollNo", student.getRollNo());
            map.put("studentName", student.getStudentName());
            map.put("section", student.getSection());
            map.put("absentCount", absentCount);
            map.put("parentPhone", student.getParentPhone());
            return map;
        }).filter(m -> m != null).collect(Collectors.toList());
    }
}
