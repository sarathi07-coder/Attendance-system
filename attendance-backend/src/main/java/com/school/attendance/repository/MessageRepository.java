package com.school.attendance.repository;

import com.school.attendance.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByStatus(Message.MessageStatus status);

    List<Message> findBySentAtBetween(LocalDateTime startTime, LocalDateTime endTime);

    @Query("SELECT m FROM Message m WHERE m.attendance.attendanceDate = :date")
    List<Message> findByAttendanceDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.attendance.attendanceDate = :date AND m.status = :status")
    Long countByDateAndStatus(@Param("date") LocalDate date, @Param("status") Message.MessageStatus status);
}
