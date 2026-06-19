package com.school.attendance.service;

import com.school.attendance.entity.Student;
import com.school.attendance.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> getStudentsBySection(String section) {
        return studentRepository.findBySection(section);
    }

    public List<Student> getActiveStudents() {
        return studentRepository.findByEnrollmentStatus(Student.EnrollmentStatus.ACTIVE);
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
    }

    public Student getStudentByRollNo(String rollNo) {
        return studentRepository.findByRollNo(rollNo)
                .orElseThrow(() -> new RuntimeException("Student not found with roll number: " + rollNo));
    }

    @Transactional
    public Student createStudent(Student student) {
        if (studentRepository.existsByRollNo(student.getRollNo())) {
            throw new RuntimeException("Student with roll number " + student.getRollNo() + " already exists");
        }
        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudent(Long id, Student studentDetails) {
        Student student = getStudentById(id);

        student.setStudentName(studentDetails.getStudentName());
        student.setSection(studentDetails.getSection());
        student.setStudentPhone(studentDetails.getStudentPhone());
        student.setParentPhone(studentDetails.getParentPhone());
        student.setEnrollmentStatus(studentDetails.getEnrollmentStatus());

        return studentRepository.save(student);
    }

    @Transactional
    public void deactivateStudent(Long id) {
        Student student = getStudentById(id);
        student.setEnrollmentStatus(Student.EnrollmentStatus.INACTIVE);
        studentRepository.save(student);
    }

    public Long getClassStrength(String section) {
        return studentRepository.countActiveStudentsBySection(section);
    }
}
