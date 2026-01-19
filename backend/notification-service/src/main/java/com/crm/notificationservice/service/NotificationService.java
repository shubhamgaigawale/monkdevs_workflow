package com.crm.notificationservice.service;

import com.crm.common.security.util.SecurityContextUtil;
import com.crm.notificationservice.entity.Notification;
import com.crm.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Transactional
    public Notification sendEmail(String recipient, String subject, String content) {
        UUID tenantId = SecurityContextUtil.getTenantId();

        Notification notification = Notification.builder()
                .type(Notification.NotificationType.EMAIL)
                .recipient(recipient)
                .subject(subject)
                .content(content)
                .status(Notification.NotificationStatus.PENDING)
                .retryCount(0)
                .build();

        notification.setTenantId(tenantId);
        notification = notificationRepository.save(notification);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(content, true);

            mailSender.send(message);

            notification.setStatus(Notification.NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            log.info("Email sent successfully to: {}", recipient);
        } catch (Exception e) {
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            log.error("Failed to send email to: {}", recipient, e);
        }

        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification sendSMS(String phoneNumber, String content) {
        UUID tenantId = SecurityContextUtil.getTenantId();

        Notification notification = Notification.builder()
                .type(Notification.NotificationType.SMS)
                .recipient(phoneNumber)
                .subject("SMS")
                .content(content)
                .status(Notification.NotificationStatus.PENDING)
                .retryCount(0)
                .build();

        notification.setTenantId(tenantId);
        notification = notificationRepository.save(notification);

        try {
            // TODO: Implement Twilio SMS sending
            log.info("SMS would be sent to: {}", phoneNumber);

            notification.setStatus(Notification.NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
        } catch (Exception e) {
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            log.error("Failed to send SMS to: {}", phoneNumber, e);
        }

        return notificationRepository.save(notification);
    }

    public List<Notification> getAll() {
        UUID tenantId = SecurityContextUtil.getTenantId();
        return notificationRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    public List<Notification> getPending() {
        UUID tenantId = SecurityContextUtil.getTenantId();
        return notificationRepository.findByTenantIdAndStatus(tenantId, Notification.NotificationStatus.PENDING);
    }
}
