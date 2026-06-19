package com.school.attendance.controller;

import com.school.attendance.entity.Attendance;
import com.school.attendance.entity.QRCode;
import com.school.attendance.entity.Student;
import com.school.attendance.repository.AttendanceRepository;
import com.school.attendance.repository.StudentRepository;
import com.school.attendance.service.QRCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class StudentAttendanceController {

    private final QRCodeService qrCodeService;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Student Login
     */
    @PostMapping("/login")
    public ResponseEntity<?> studentLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password required"));
        }

        Optional<Student> studentOpt = studentRepository.findByEmail(email);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));
        }

        Student student = studentOpt.get();
        if (!passwordEncoder.matches(password, student.getPasswordHash())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid password"));
        }

        // Generate a simple token (in production use JWT)
        String token = UUID.randomUUID().toString();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", token);
        response.put("student", Map.of(
                "id", student.getId(),
                "rollNo", student.getRollNo(),
                "name", student.getStudentName(),
                "department", student.getDepartment(),
                "section", student.getSection(),
                "email", student.getEmail()));

        return ResponseEntity.ok(response);
    }

    /**
     * Get student's unique QR code for current session
     */
    @GetMapping("/{studentId}/qrcode")
    public ResponseEntity<?> getStudentQRCode(@PathVariable Long studentId) {
        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));
        }

        Student student = studentOpt.get();
        LocalDate today = LocalDate.now();

        // Get current session
        Optional<QRCode.ClassBlock> currentSession = qrCodeService.getCurrentSession();

        Map<String, Object> response = new HashMap<>();
        response.put("studentId", studentId);
        response.put("rollNo", student.getRollNo());
        response.put("name", student.getStudentName());
        response.put("date", today);

        if (currentSession.isPresent()) {
            QRCode.ClassBlock block = currentSession.get();

            // Generate unique QR for this student + session + date
            String uniqueToken = generateStudentQRToken(student.getId(), block, today);

            // Check if already checked in
            Optional<Attendance> existing = attendanceRepository
                    .findByStudentIdAndAttendanceDateAndClassBlock(studentId, today, block);

            boolean alreadyCheckedIn = existing.isPresent() && existing.get().getSubmittedByStudent();

            response.put("inSession", true);
            response.put("currentSession", block);
            response.put("qrToken", uniqueToken);
            response.put("alreadyCheckedIn", alreadyCheckedIn);
            if (alreadyCheckedIn) {
                response.put("checkinTime", existing.get().getSubmissionTime());
            }
        } else {
            response.put("inSession", false);
            response.put("message", "No active session right now");
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Get student's attendance history
     */
    @GetMapping("/{studentId}/attendance-history")
    public ResponseEntity<?> getAttendanceHistory(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "30") int days) {

        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));
        }

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);

        List<Attendance> attendances = attendanceRepository
                .findByStudentIdAndAttendanceDateBetween(studentId, startDate, endDate);

        // Group by date
        Map<LocalDate, List<Map<String, Object>>> byDate = new TreeMap<>(Collections.reverseOrder());

        for (Attendance a : attendances) {
            byDate.computeIfAbsent(a.getAttendanceDate(), k -> new ArrayList<>())
                    .add(Map.of(
                            "session", a.getClassBlock(),
                            "status", a.getAttendanceType(),
                            "checkedIn", a.getSubmittedByStudent(),
                            "submissionTime", a.getSubmissionTime() != null ? a.getSubmissionTime().toString() : null));
        }

        // Calculate statistics
        long totalSessions = attendances.size();
        long presentCount = attendances.stream()
                .filter(a -> a.getAttendanceType() == Attendance.AttendanceType.PRESENT)
                .count();
        long absentCount = attendances.stream()
                .filter(a -> a.getAttendanceType() == Attendance.AttendanceType.ABSENT)
                .count();
        long odCount = attendances.stream()
                .filter(a -> a.getAttendanceType() == Attendance.AttendanceType.OD)
                .count();

        double attendancePercentage = totalSessions > 0 ? (presentCount * 100.0 / totalSessions) : 0;

        Map<String, Object> response = new HashMap<>();
        response.put("studentId", studentId);
        response.put("startDate", startDate);
        response.put("endDate", endDate);
        response.put("history", byDate);
        response.put("stats", Map.of(
                "totalSessions", totalSessions,
                "present", presentCount,
                "absent", absentCount,
                "od", odCount,
                "attendancePercentage", Math.round(attendancePercentage * 100.0) / 100.0));

        return ResponseEntity.ok(response);
    }

    /**
     * Admin scans student QR to mark attendance
     */
    @PostMapping("/scan-checkin")
    public ResponseEntity<?> scanCheckIn(@RequestBody Map<String, Object> request) {
        try {
            Long studentId = Long.valueOf(request.get("studentId").toString());
            String blockStr = (String) request.get("classBlock");
            QRCode.ClassBlock block = QRCode.ClassBlock.valueOf(blockStr);

            Optional<Student> studentOpt = studentRepository.findById(studentId);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Student not found"));
            }

            Student student = studentOpt.get();
            return processCheckIn(student.getRollNo(), block);

        } catch (Exception e) {
            log.error("Scan check-in error", e);
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Invalid request data"));
        }
    }

    /**
     * Student check-in with their unique QR code
     */
    @PostMapping("/checkin")
    public ResponseEntity<?> checkIn(@RequestBody Map<String, String> request) {
        String qrToken = request.get("qrToken");
        String rollNo = request.get("rollNo");

        // Validate inputs
        if (qrToken == null || qrToken.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "QR Token is required"));
        }
        if (rollNo == null || rollNo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Roll number is required"));
        }

        // Parse the student QR token
        String[] parts = qrToken.split("-");
        if (parts.length < 4) {
            // Try validating against admin QR
            Optional<QRCode> qrCode = qrCodeService.validateToken(qrToken);
            if (qrCode.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Invalid or expired QR code. Please scan again."));
            }

            // Use admin QR flow
            return processCheckIn(rollNo, qrCode.get().getClassBlock());
        }

        // Parse student-specific QR
        try {
            Long studentId = Long.parseLong(parts[0]);
            QRCode.ClassBlock block = QRCode.ClassBlock.valueOf(parts[1]);
            LocalDate date = LocalDate.parse(parts[2]);

            // Verify date is today
            if (!date.equals(LocalDate.now())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "This QR code has expired. Please use today's code."));
            }

            // Verify student
            Optional<Student> studentOpt = studentRepository.findByRollNo(rollNo);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Student not found"));
            }

            if (!studentOpt.get().getId().equals(studentId)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "This QR code is not assigned to you"));
            }

            return processCheckIn(rollNo, block);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Invalid QR code format"));
        }
    }

    private ResponseEntity<?> processCheckIn(String rollNo, QRCode.ClassBlock block) {
        Optional<Student> studentOpt = studentRepository.findByRollNo(rollNo);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Student not found"));
        }

        Student student = studentOpt.get();
        LocalDate today = LocalDate.now();

        // Check if already submitted
        Optional<Attendance> existingAttendance = attendanceRepository
                .findByStudentIdAndAttendanceDateAndClassBlock(student.getId(), today, block);

        if (existingAttendance.isPresent() && existingAttendance.get().getSubmittedByStudent()) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "alreadySubmitted", true,
                    "message", "You have already checked in for this session",
                    "submissionTime", existingAttendance.get().getSubmissionTime()));
        }

        // Create or update attendance record
        Attendance attendance;
        if (existingAttendance.isPresent()) {
            attendance = existingAttendance.get();
        } else {
            attendance = new Attendance();
            attendance.setStudent(student);
            attendance.setAttendanceDate(today);
            attendance.setSection(student.getSection());
            attendance.setClassBlock(block);
        }

        attendance.setSubmittedByStudent(true);
        attendance.setSubmissionTime(LocalDateTime.now());
        attendance.setStatus(Attendance.AttendanceStatus.PRESENT);
        attendance.setAttendanceType(Attendance.AttendanceType.PRESENT);

        attendanceRepository.save(attendance);

        log.info("Student {} checked in for {} on {}", rollNo, block, today);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Check-in successful!",
                "studentName", student.getStudentName(),
                "rollNo", student.getRollNo(),
                "section", student.getSection(),
                "session", block,
                "submissionTime", attendance.getSubmissionTime()));
    }

    /**
     * Check student attendance status
     */
    @GetMapping("/status")
    public ResponseEntity<?> checkStatus(
            @RequestParam String rollNo,
            @RequestParam(required = false) String classBlock) {

        Optional<Student> studentOpt = studentRepository.findByRollNo(rollNo);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));
        }

        Student student = studentOpt.get();
        LocalDate today = LocalDate.now();

        Map<String, Object> response = new HashMap<>();
        response.put("studentName", student.getStudentName());
        response.put("rollNo", student.getRollNo());

        if (classBlock != null) {
            try {
                QRCode.ClassBlock block = QRCode.ClassBlock.valueOf(classBlock.toUpperCase());
                Optional<Attendance> attendance = attendanceRepository
                        .findByStudentIdAndAttendanceDateAndClassBlock(student.getId(), today, block);

                if (attendance.isPresent()) {
                    response.put("hasSubmitted", attendance.get().getSubmittedByStudent());
                    response.put("submissionTime", attendance.get().getSubmissionTime());
                    response.put("status", attendance.get().getAttendanceType());
                } else {
                    response.put("hasSubmitted", false);
                }
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid class block"));
            }
        } else {
            // Return status for all sessions today
            Map<String, Object> sessions = new HashMap<>();
            for (QRCode.ClassBlock block : QRCode.ClassBlock.values()) {
                Optional<Attendance> attendance = attendanceRepository
                        .findByStudentIdAndAttendanceDateAndClassBlock(student.getId(), today, block);

                Map<String, Object> sessionStatus = new HashMap<>();
                if (attendance.isPresent()) {
                    sessionStatus.put("submitted", attendance.get().getSubmittedByStudent());
                    sessionStatus.put("submissionTime", attendance.get().getSubmissionTime());
                    sessionStatus.put("type", attendance.get().getAttendanceType());
                } else {
                    sessionStatus.put("submitted", false);
                }
                sessions.put(block.name(), sessionStatus);
            }
            response.put("sessions", sessions);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Generate unique QR token for student
     */
    private String generateStudentQRToken(Long studentId, QRCode.ClassBlock block, LocalDate date) {
        // Format: studentId-block-date-hash
        String baseToken = studentId + "-" + block.name() + "-" + date.toString();
        String hash = UUID.nameUUIDFromBytes(baseToken.getBytes()).toString().substring(0, 8);
        return baseToken + "-" + hash;
    }
}
