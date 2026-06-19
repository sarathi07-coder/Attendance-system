package com.school.attendance.controller;

import com.school.attendance.entity.Attendance;
import com.school.attendance.entity.QRCode;
import com.school.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class AttendanceController {

    private final AttendanceService attendanceService;

    /**
     * Get students who have submitted (checked in) for a session
     */
    @GetMapping("/session/{classBlock}/submitted")
    public ResponseEntity<List<Map<String, Object>>> getSubmittedStudents(
            @PathVariable String classBlock,
            @RequestParam(required = false) String section) {
        try {
            QRCode.ClassBlock block = QRCode.ClassBlock.valueOf(classBlock.toUpperCase());
            return ResponseEntity.ok(attendanceService.getSubmittedStudents(block, section));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get students who have NOT submitted for a session
     */
    @GetMapping("/session/{classBlock}/not-submitted")
    public ResponseEntity<List<Map<String, Object>>> getNotSubmittedStudents(
            @PathVariable String classBlock,
            @RequestParam(required = false) String section) {
        try {
            QRCode.ClassBlock block = QRCode.ClassBlock.valueOf(classBlock.toUpperCase());
            return ResponseEntity.ok(attendanceService.getNotSubmittedStudents(block, section));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update attendance type (OD, Pre-informed, Absent)
     */
    @PutMapping("/mark-type")
    public ResponseEntity<?> updateAttendanceType(@RequestBody Map<String, Object> request) {
        try {
            Long studentId = Long.valueOf(request.get("studentId").toString());
            QRCode.ClassBlock classBlock = QRCode.ClassBlock.valueOf(
                    request.get("classBlock").toString().toUpperCase());
            Attendance.AttendanceType type = Attendance.AttendanceType.valueOf(
                    request.get("attendanceType").toString().toUpperCase());
            String markedBy = request.get("markedBy") != null ? request.get("markedBy").toString() : "admin";

            attendanceService.updateAttendanceType(studentId, classBlock, type, markedBy);

            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Finalize attendance for a session and send messages
     */
    @PostMapping("/finalize")
    public ResponseEntity<?> finalizeAttendance(@RequestBody Map<String, Object> request) {
        try {
            QRCode.ClassBlock classBlock = QRCode.ClassBlock.valueOf(
                    request.get("classBlock").toString().toUpperCase());

            @SuppressWarnings("unchecked")
            List<Long> absentIds = request.get("absentStudentIds") != null
                    ? ((List<Number>) request.get("absentStudentIds")).stream()
                            .map(Number::longValue).toList()
                    : List.of();

            @SuppressWarnings("unchecked")
            List<Long> odIds = request.get("odStudentIds") != null
                    ? ((List<Number>) request.get("odStudentIds")).stream()
                            .map(Number::longValue).toList()
                    : List.of();

            @SuppressWarnings("unchecked")
            List<Long> preInformedIds = request.get("preInformedStudentIds") != null
                    ? ((List<Number>) request.get("preInformedStudentIds")).stream()
                            .map(Number::longValue).toList()
                    : List.of();

            String finalizedBy = request.get("finalizedBy") != null ? request.get("finalizedBy").toString() : "admin";

            Map<String, Object> result = attendanceService.finalizeAttendance(
                    classBlock, absentIds, odIds, preInformedIds, finalizedBy);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get regular absentees
     */
    @GetMapping("/regular-absentees")
    public ResponseEntity<?> getRegularAbsentees(
            @RequestParam(defaultValue = "3") int threshold,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(attendanceService.getRegularAbsentees(threshold, days));
    }

    /**
     * Get session summary for dashboard
     */
    @GetMapping("/session-summary/{classBlock}")
    public ResponseEntity<?> getSessionSummary(@PathVariable String classBlock) {
        try {
            QRCode.ClassBlock block = QRCode.ClassBlock.valueOf(classBlock.toUpperCase());

            List<Map<String, Object>> submitted = attendanceService.getSubmittedStudents(block, null);
            List<Map<String, Object>> notSubmitted = attendanceService.getNotSubmittedStudents(block, null);

            Map<String, Object> summary = new HashMap<>();
            summary.put("session", block);
            summary.put("submittedCount", submitted.size());
            summary.put("notSubmittedCount", notSubmitted.size());
            summary.put("totalStudents", submitted.size() + notSubmitted.size());
            summary.put("submitted", submitted);
            summary.put("notSubmitted", notSubmitted);

            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid class block"));
        }
    }
}
