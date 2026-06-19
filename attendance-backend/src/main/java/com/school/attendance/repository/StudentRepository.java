package com.school.attendance.repository;

import com.school.attendance.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByRollNo(String rollNo);

    Optional<Student> findByEmail(String email);

    List<Student> findBySection(String section);

    List<Student> findByEnrollmentStatus(Student.EnrollmentStatus status);

    List<Student> findBySectionAndEnrollmentStatus(String section, Student.EnrollmentStatus status);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.section = :section AND s.enrollmentStatus = 'ACTIVE'")
    Long countActiveStudentsBySection(String section);

    boolean existsByRollNo(String rollNo);
}
