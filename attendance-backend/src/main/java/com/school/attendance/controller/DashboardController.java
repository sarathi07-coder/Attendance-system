package com.school.attendance.controller;

import com.school.attendance.dto.DashboardStats;
import com.school.attendance.entity.QRCode;
import com.school.attendance.service.AttendanceService;
import com.school.attendance.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class DashboardController {

    private final DashboardService dashboardService;
    private final AttendanceService attendanceService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getTodayStats() {
        return ResponseEntity.ok(dashboardService.getTodayStats());
    }

    @GetMapping("/absentees/today")
    public ResponseEntity<?> getTodayAbsentees() {
        // Get all sessions' not-submitted students for today
        Map<String, Object> result = new HashMap<>();
        for (QRCode.ClassBlock block : QRCode.ClassBlock.values()) {
            result.put(block.name(), attendanceService.getNotSubmittedStudents(block, null));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/absentees/regular")
    public ResponseEntity<List<Map<String, Object>>> getRegularAbsentees() {
        return ResponseEntity.ok(attendanceService.getRegularAbsentees(3, 30));
    }
}
