package com.school.attendance.repository;

import com.school.attendance.entity.QRCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface QRCodeRepository extends JpaRepository<QRCode, Long> {

    Optional<QRCode> findByQrToken(String qrToken);

    Optional<QRCode> findBySessionDateAndClassBlockAndIsActiveTrue(
            LocalDate sessionDate,
            QRCode.ClassBlock classBlock);

    @Modifying
    @Query("UPDATE QRCode q SET q.isActive = false WHERE q.sessionDate = :date AND q.classBlock = :block")
    void deactivateBySessionDateAndBlock(LocalDate date, QRCode.ClassBlock block);

    @Query("SELECT q FROM QRCode q WHERE q.sessionDate = :date AND q.classBlock = :block AND q.isActive = true")
    Optional<QRCode> findActiveQR(LocalDate date, QRCode.ClassBlock block);
}
