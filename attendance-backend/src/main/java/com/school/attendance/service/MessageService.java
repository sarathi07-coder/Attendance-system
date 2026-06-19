package com.school.attendance.service;

import com.school.attendance.entity.Attendance;
import com.school.attendance.entity.Message;
import com.school.attendance.repository.MessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class MessageService {

    @Value("${whatsapp.service.url:http://localhost:3001}")
    private String whatsappServiceUrl;

    @Value("${school.name}")
    private String schoolName;

    private final RestTemplate restTemplate = new RestTemplate();
    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    private static final String PARENT_ABSENT_TEMPLATE = "🔔 *%s Attendance Alert*\n\n" +
            "Dear Parent,\n\n" +
            "Your child *%s* (Roll: %s, Section: %s) was marked absent during *%s* on %s.\n\n" +
            "If this is unexpected, please contact the school immediately.\n\n" +
            "Thank you,\n%s";

    private static final String STUDENT_ABSENT_TEMPLATE = "⚠️ *Attendance Notice*\n\n" +
            "Dear %s,\n\n" +
            "You were marked absent during *%s* on %s. " +
            "Please contact your teacher if this is incorrect.\n\n" +
            "- %s";

    /**
     * Send absent notification to parent and student
     */
    public void sendAbsentNotification(Attendance attendance) {
        String sessionName = formatSessionName(attendance.getClassBlock().name());
        String dateStr = attendance.getAttendanceDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));

        // Send to parent
        if (attendance.getStudent().getParentPhone() != null &&
                !attendance.getStudent().getParentPhone().isEmpty()) {

            String parentMessage = String.format(
                    PARENT_ABSENT_TEMPLATE,
                    schoolName,
                    attendance.getStudent().getStudentName(),
                    attendance.getStudent().getRollNo(),
                    attendance.getStudent().getSection(),
                    sessionName,
                    dateStr,
                    schoolName);

            Message.MessageStatus status = sendWhatsAppMessage(
                    attendance.getStudent().getParentPhone(),
                    parentMessage);

            // Save message record
            Message msg = new Message();
            msg.setAttendance(attendance);
            msg.setRecipientPhone(attendance.getStudent().getParentPhone());
            msg.setRecipientType(Message.RecipientType.PARENT);
            msg.setMessageBody(parentMessage);
            msg.setStatus(status);
            msg.setSentAt(LocalDateTime.now());
            messageRepository.save(msg);

            log.info("Parent notification sent for {} - Status: {}",
                    attendance.getStudent().getRollNo(), status);
        }

        // Send to student
        if (attendance.getStudent().getStudentPhone() != null &&
                !attendance.getStudent().getStudentPhone().isEmpty()) {

            String studentMessage = String.format(
                    STUDENT_ABSENT_TEMPLATE,
                    attendance.getStudent().getStudentName(),
                    sessionName,
                    dateStr,
                    schoolName);

            Message.MessageStatus status = sendWhatsAppMessage(
                    attendance.getStudent().getStudentPhone(),
                    studentMessage);

            // Save message record
            Message msg = new Message();
            msg.setAttendance(attendance);
            msg.setRecipientPhone(attendance.getStudent().getStudentPhone());
            msg.setRecipientType(Message.RecipientType.STUDENT);
            msg.setMessageBody(studentMessage);
            msg.setStatus(status);
            msg.setSentAt(LocalDateTime.now());
            messageRepository.save(msg);
        }
    }

    /**
     * Send WhatsApp message via service
     */
    public Message.MessageStatus sendWhatsAppMessage(String phone, String message) {
        try {
            String url = whatsappServiceUrl + "/send-message";

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("phone", phone);
            requestBody.put("message", message);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null &&
                    Boolean.TRUE.equals(response.getBody().get("success"))) {
                log.info("WhatsApp message sent to: {}", phone);
                return Message.MessageStatus.SENT;
            } else {
                log.error("Failed to send WhatsApp message to {}", phone);
                return Message.MessageStatus.FAILED;
            }

        } catch (Exception e) {
            log.error("Error sending WhatsApp message to {}: {}", phone, e.getMessage());
            return Message.MessageStatus.FAILED;
        }
    }

    /**
     * Format session name for display
     */
    private String formatSessionName(String blockName) {
        switch (blockName) {
            case "MORNING_1":
                return "Morning Session 1 (8:30 - 9:35)";
            case "MORNING_2":
                return "Morning Session 2 (10:40 - 11:15)";
            case "AFTERNOON_1":
                return "Afternoon Session 1 (1:00 - 1:35)";
            case "AFTERNOON_2":
                return "Afternoon Session 2 (2:50 - 3:15)";
            default:
                return blockName;
        }
    }
}
