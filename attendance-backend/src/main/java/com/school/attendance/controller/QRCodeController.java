package com.school.attendance.controller;

import com.school.attendance.entity.QRCode;
import com.school.attendance.service.QRCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class QRCodeController {

    private final QRCodeService qrCodeService;

    /**
     * Generate new QR code for a session (Admin only)
     */
    @PostMapping("/generate/{classBlock}")
    public ResponseEntity<?> generateQR(@PathVariable String classBlock) {
        try {
            QRCode.ClassBlock block = QRCode.ClassBlock.valueOf(classBlock.toUpperCase());
            QRCode qrCode = qrCodeService.generateQRCode(block);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("qrToken", qrCode.getQrToken());
            response.put("classBlock", qrCode.getClassBlock());
            response.put("expiresAt", qrCode.getExpiresAt());
            response.put("generatedAt", qrCode.getGeneratedAt());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid class block. Use: MORNING_1, MORNING_2, AFTERNOON_1, AFTERNOON_2"));
        }
    }

    /**
     * Get current active QR code for a session (Admin only)
     */
    @GetMapping("/current/{classBlock}")
    public ResponseEntity<?> getCurrentQR(@PathVariable String classBlock) {
        try {
            QRCode.ClassBlock block = QRCode.ClassBlock.valueOf(classBlock.toUpperCase());
            Optional<QRCode> qrCode = qrCodeService.getCurrentQRCode(block);

            if (qrCode.isPresent()) {
                QRCode qr = qrCode.get();
                Map<String, Object> response = new HashMap<>();
                response.put("found", true);
                response.put("qrToken", qr.getQrToken());
                response.put("classBlock", qr.getClassBlock());
                response.put("expiresAt", qr.getExpiresAt());
                response.put("isActive", qr.getIsActive());
                response.put("isValid", qr.isValid());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.ok(Map.of("found", false, "message", "No active QR code for this session"));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid class block"));
        }
    }

    /**
     * Get current session info
     */
    @GetMapping("/current-session")
    public ResponseEntity<?> getCurrentSession() {
        Optional<QRCode.ClassBlock> session = qrCodeService.getCurrentSession();

        Map<String, Object> response = new HashMap<>();
        if (session.isPresent()) {
            response.put("inSession", true);
            response.put("currentSession", session.get());

            Optional<QRCode> qr = qrCodeService.getCurrentQRCode(session.get());
            if (qr.isPresent()) {
                response.put("hasActiveQR", true);
                response.put("qrToken", qr.get().getQrToken());
                response.put("expiresAt", qr.get().getExpiresAt());
            } else {
                response.put("hasActiveQR", false);
            }
        } else {
            response.put("inSession", false);
            response.put("message", "No active session at this time");
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Validate QR token (Student scan)
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateQR(@RequestBody Map<String, String> request) {
        String token = request.get("qrToken");

        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "error", "QR token required"));
        }

        Optional<QRCode> qrCode = qrCodeService.validateToken(token);

        if (qrCode.isPresent()) {
            QRCode qr = qrCode.get();
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "classBlock", qr.getClassBlock(),
                    "sessionDate", qr.getSessionDate(),
                    "expiresAt", qr.getExpiresAt()));
        } else {
            return ResponseEntity.ok(Map.of("valid", false, "error", "Invalid or expired QR code"));
        }
    }
}
