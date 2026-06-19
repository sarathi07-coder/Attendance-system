package com.school.attendance.repository;

import com.school.attendance.entity.Attendance;
import com.school.attendance.entity.QRCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

        List<Attendance> findByAttendanceDateAndSection(LocalDate date, String section);

        List<Attendance> findByAttendanceDateAndClassBlock(LocalDate date, QRCode.ClassBlock classBlock);

        List<Attendance> findByAttendanceDateAndClassBlockAndSection(
                        LocalDate date,
                        QRCode.ClassBlock classBlock,
                        String section);

        Optional<Attendance> findByStudentIdAndAttendanceDateAndClassBlock(
                        Long studentId,
                        LocalDate date,
                        QRCode.ClassBlock classBlock);

        // Get students who have submitted (checked in)
        @Query("SELECT a FROM Attendance a WHERE a.attendanceDate = :date AND a.classBlock = :block AND a.submittedByStudent = true")
        List<Attendance> findSubmittedByDateAndBlock(LocalDate date, QRCode.ClassBlock block);

        // Get students who have not submitted
        @Query("SELECT a FROM Attendance a WHERE a.attendanceDate = :date AND a.classBlock = :block AND a.submittedByStudent = false")
        List<Attendance> findNotSubmittedByDateAndBlock(LocalDate date, QRCode.ClassBlock block);

        // Get absent students for messaging
        @Query("SELECT a FROM Attendance a WHERE a.attendanceDate = :date AND a.classBlock = :block AND a.status = 'ABSENT' AND a.isFinalized = true")
        List<Attendance> findAbsentAndFinalizedByDateAndBlock(LocalDate date, QRCode.ClassBlock block);

        // Get absentees for a date range (for regular absentee tracking)
        @Query("SELECT a.student.id, COUNT(a) FROM Attendance a WHERE a.attendanceDate BETWEEN :startDate AND :endDate AND a.status = 'ABSENT' GROUP BY a.student.id HAVING COUNT(a) >= :threshold")
        List<Object[]> findRegularAbsentees(LocalDate startDate, LocalDate endDate, Long threshold);

        // Count today's absentees
        @Query("SELECT COUNT(a) FROM Attendance a WHERE a.attendanceDate = :date AND a.status = 'ABSENT'")
        long countAbsentByDate(LocalDate date);

        // Count submitted today
        @Query("SELECT COUNT(a) FROM Attendance a WHERE a.attendanceDate = :date AND a.submittedByStudent = true")
        long countSubmittedByDate(LocalDate date);

        // Get all attendance for a student
        List<Attendance> findByStudentIdAndAttendanceDateBetween(Long studentId, LocalDate startDate,
                        LocalDate endDate);
}
