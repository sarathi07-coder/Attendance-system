package com.school.attendance.service;

import com.school.attendance.entity.QRCode;
import com.school.attendance.repository.QRCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class QRCodeService {

    private final QRCodeRepository qrCodeRepository;

    @Value("${session.morning1.start}")
    private String morning1Start;

    @Value("${session.morning1.end}")
    private String morning1End;

    @Value("${session.morning2.start}")
    private String morning2Start;

    @Value("${session.morning2.end}")
    private String morning2End;

    @Value("${session.afternoon1.start}")
    private String afternoon1Start;

    @Value("${session.afternoon1.end}")
    private String afternoon1End;

    @Value("${session.afternoon2.start}")
    private String afternoon2Start;

    @Value("${session.afternoon2.end}")
    private String afternoon2End;

    /**
     * Generate a new QR code for the specified session
     */
    @Transactional
    public QRCode generateQRCode(QRCode.ClassBlock classBlock) {
        LocalDate today = LocalDate.now();

        // Deactivate any existing QR for this session
        qrCodeRepository.deactivateBySessionDateAndBlock(today, classBlock);

        // Create new QR code
        QRCode qrCode = new QRCode();
        qrCode.setSessionDate(today);
        qrCode.setClassBlock(classBlock);
        qrCode.setIsActive(true);
        qrCode.setExpiresAt(getSessionEndTime(classBlock));

        QRCode saved = qrCodeRepository.save(qrCode);
        log.info("Generated new QR code for {} on {}: {}", classBlock, today, saved.getQrToken());

        return saved;
    }

    /**
     * Get current active QR code for a session
     */
    public Optional<QRCode> getCurrentQRCode(QRCode.ClassBlock classBlock) {
        return qrCodeRepository.findActiveQR(LocalDate.now(), classBlock);
    }

    /**
     * Validate a QR token
     */
    public Optional<QRCode> validateToken(String token) {
        Optional<QRCode> qrCode = qrCodeRepository.findByQrToken(token);

        if (qrCode.isPresent() && qrCode.get().isValid()) {
            return qrCode;
        }

        return Optional.empty();
    }

    /**
     * Get the current active session based on time
     */
    public Optional<QRCode.ClassBlock> getCurrentSession() {
        LocalTime now = LocalTime.now();

        LocalTime m1Start = LocalTime.parse(morning1Start);
        LocalTime m1End = LocalTime.parse(morning1End);
        LocalTime m2Start = LocalTime.parse(morning2Start);
        LocalTime m2End = LocalTime.parse(morning2End);
        LocalTime a1Start = LocalTime.parse(afternoon1Start);
        LocalTime a1End = LocalTime.parse(afternoon1End);
        LocalTime a2Start = LocalTime.parse(afternoon2Start);
        LocalTime a2End = LocalTime.parse(afternoon2End);

        if (now.isAfter(m1Start) && now.isBefore(m1End)) {
            return Optional.of(QRCode.ClassBlock.MORNING_1);
        } else if (now.isAfter(m2Start) && now.isBefore(m2End)) {
            return Optional.of(QRCode.ClassBlock.MORNING_2);
        } else if (now.isAfter(a1Start) && now.isBefore(a1End)) {
            return Optional.of(QRCode.ClassBlock.AFTERNOON_1);
        } else if (now.isAfter(a2Start) && now.isBefore(a2End)) {
            return Optional.of(QRCode.ClassBlock.AFTERNOON_2);
        }

        return Optional.empty();
    }

    /**
     * Get session end time as LocalDateTime
     */
    private LocalDateTime getSessionEndTime(QRCode.ClassBlock block) {
        LocalDate today = LocalDate.now();
        LocalTime endTime;

        switch (block) {
            case MORNING_1:
                endTime = LocalTime.parse(morning1End);
                break;
            case MORNING_2:
                endTime = LocalTime.parse(morning2End);
                break;
            case AFTERNOON_1:
                endTime = LocalTime.parse(afternoon1End);
                break;
            case AFTERNOON_2:
                endTime = LocalTime.parse(afternoon2End);
                break;
            default:
                endTime = LocalTime.of(23, 59);
        }

        return LocalDateTime.of(today, endTime);
    }

    /**
     * Check if currently within a session time
     */
    public boolean isWithinSessionTime(QRCode.ClassBlock block) {
        LocalTime now = LocalTime.now();
        LocalTime start, end;

        switch (block) {
            case MORNING_1:
                start = LocalTime.parse(morning1Start);
                end = LocalTime.parse(morning1End);
                break;
            case MORNING_2:
                start = LocalTime.parse(morning2Start);
                end = LocalTime.parse(morning2End);
                break;
            case AFTERNOON_1:
                start = LocalTime.parse(afternoon1Start);
                end = LocalTime.parse(afternoon1End);
                break;
            case AFTERNOON_2:
                start = LocalTime.parse(afternoon2Start);
                end = LocalTime.parse(afternoon2End);
                break;
            default:
                return false;
        }

        return now.isAfter(start) && now.isBefore(end);
    }
}
