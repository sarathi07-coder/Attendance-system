package com.school.attendance.dto;

import lombok.Data;

@Data
public class RegularAbsenteeDTO {
    private Long studentId;
    private String studentName;
    private String rollNo;
    private String section;
    private Long absentCount;
    private String parentPhone;
}
