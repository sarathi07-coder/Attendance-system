package com.school.attendance.config;

import com.school.attendance.entity.Student;
import com.school.attendance.entity.User;
import com.school.attendance.repository.StudentRepository;
import com.school.attendance.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Create default admin user if no users exist
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setFullName("System Administrator");
                admin.setRole(User.UserRole.ADMIN);
                admin.setEmail("admin@school.com");
                admin.setIsActive(true);

                userRepository.save(admin);
                log.info("✅ Default admin user created!");
                log.info("   Username: admin");
                log.info("   Password: admin123");
            }

            // Create 5 default students
            if (studentRepository.count() == 0) {
                createStudent(studentRepository, passwordEncoder,
                        "24102116", "Partha", "AIDS", "A",
                        "+916374198638", "+916374198638",
                        "partha@school.com", "partha123");

                createStudent(studentRepository, passwordEncoder,
                        "24102117", "Ravi Kumar", "AIDS", "A",
                        "+916374198638", "+916374198638",
                        "ravi@school.com", "ravi123");

                createStudent(studentRepository, passwordEncoder,
                        "24102118", "Priya Sharma", "AIDS", "A",
                        "+916374198638", "+916374198638",
                        "priya@school.com", "priya123");

                createStudent(studentRepository, passwordEncoder,
                        "24102119", "Arjun Singh", "AIDS", "A",
                        "+916374198638", "+916374198638",
                        "arjun@school.com", "arjun123");

                createStudent(studentRepository, passwordEncoder,
                        "24102120", "Sneha Patel", "AIDS", "A",
                        "+916374198638", "+916374198638",
                        "sneha@school.com", "sneha123");

                log.info("✅ 5 Default students created!");
                log.info("   Student 1: partha@school.com / partha123");
                log.info("   Student 2: ravi@school.com / ravi123");
                log.info("   Student 3: priya@school.com / priya123");
                log.info("   Student 4: arjun@school.com / arjun123");
                log.info("   Student 5: sneha@school.com / sneha123");
            }
        };
    }

    private void createStudent(StudentRepository repo, PasswordEncoder encoder,
            String rollNo, String name, String dept, String section,
            String studentPhone, String parentPhone,
            String email, String password) {
        Student student = new Student();
        student.setRollNo(rollNo);
        student.setStudentName(name);
        student.setDepartment(dept);
        student.setSection(section);
        student.setStudentPhone(studentPhone);
        student.setParentPhone(parentPhone);
        student.setEmail(email);
        student.setPasswordHash(encoder.encode(password));
        student.setEnrollmentStatus(Student.EnrollmentStatus.ACTIVE);
        repo.save(student);
    }
}
