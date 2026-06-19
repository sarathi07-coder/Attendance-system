package com.school.attendance.dto;

import com.school.attendance.entity.Attendance;
import com.school.attendance.entity.QRCode;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AttendanceRequest {
    private Long studentId;
    private LocalDate date;
    private String section;
    private QRCode.ClassBlock classBlock;
    private Attendance.AttendanceStatus status;
    private Attendance.AttendanceType attendanceType;
    private String markedBy;
    private String notes;
}
