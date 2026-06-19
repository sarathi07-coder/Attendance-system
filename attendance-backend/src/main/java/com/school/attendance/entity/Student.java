package com.school.attendance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "students", indexes = {
        @Index(name = "idx_section", columnList = "section"),
        @Index(name = "idx_roll_no", columnList = "rollNo"),
        @Index(name = "idx_email", columnList = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String rollNo;

    @Column(nullable = false, length = 100)
    private String studentName;

    @Column(nullable = false, length = 50)
    private String department;

    @Column(nullable = false, length = 10)
    private String section;

    @Column(length = 15)
    private String studentPhone;

    @Column(length = 15)
    private String parentPhone;

    @Column(unique = true, length = 100)
    private String email;

    @Column(length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus enrollmentStatus = EnrollmentStatus.ACTIVE;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public enum EnrollmentStatus {
        ACTIVE, INACTIVE
    }
}
