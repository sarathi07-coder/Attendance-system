package com.school.attendance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "qr_codes", indexes = {
        @Index(name = "idx_qr_token", columnList = "qrToken"),
        @Index(name = "idx_session_date_block", columnList = "sessionDate, classBlock")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate sessionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClassBlock classBlock;

    @Column(nullable = false, unique = true, length = 100)
    private String qrToken;

    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime generatedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private Boolean isActive = true;

    public enum ClassBlock {
        MORNING_1,
        MORNING_2,
        AFTERNOON_1,
        AFTERNOON_2
    }

    // Generate unique token
    @PrePersist
    public void generateToken() {
        if (this.qrToken == null) {
            this.qrToken = UUID.randomUUID().toString();
        }
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return isActive && !isExpired();
    }
}
