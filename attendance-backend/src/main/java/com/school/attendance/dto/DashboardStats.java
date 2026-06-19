package com.school.attendance.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.Map;

@Data
public class DashboardStats {
    private LocalDate date;
    private Map<String, Long> classStrength;
    private Map<String, Long> absentees;
    private Long messagesSent;
    private Long messagesFailed;
}
