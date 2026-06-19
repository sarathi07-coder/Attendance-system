package com.school.attendance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance", indexes = {
        @Index(name = "idx_date", columnList = "attendanceDate"),
        @Index(name = "idx_student_date", columnList = "student_id, attendanceDate"),
        @Index(name = "idx_date_block", columnList = "attendanceDate, classBlock")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private LocalDate attendanceDate;

    @Column(nullable = false, length = 10)
    private String section;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QRCode.ClassBlock classBlock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status = AttendanceStatus.NOT_MARKED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceType attendanceType = AttendanceType.NOT_SUBMITTED;

    // Student self check-in fields
    @Column(nullable = false)
    private Boolean submittedByStudent = false;

    private LocalDateTime submissionTime;

    // Finalization fields
    @Column(nullable = false)
    private Boolean isFinalized = false;

    private LocalDateTime finalizedAt;

    private String finalizedBy;

    // Message tracking
    @Column(nullable = false)
    private Boolean parentMessageSent = false;

    private Long parentMessageId;

    private LocalDateTime parentMessageSentAt;

    @Column(nullable = false)
    private Boolean studentMessageSent = false;

    private Long studentMessageId;

    private LocalDateTime studentMessageSentAt;

    private String markedBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public enum AttendanceStatus {
        NOT_MARKED,
        PRESENT,
        ABSENT
    }

    public enum AttendanceType {
        NOT_SUBMITTED, // Student hasn't scanned QR
        PRESENT, // Student scanned and marked present
        ABSENT, // Admin marked as absent
        OD, // On Duty - student is officially elsewhere
        PRE_INFORMED // Student informed in advance about absence
    }
}
