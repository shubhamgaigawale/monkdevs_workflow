package com.crm.notificationservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", schema = "notification_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Builder
public class Notification extends BaseEntity {

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationType type; // EMAIL, SMS

    @Column(nullable = false)
    private String recipient; // Email or phone number

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationStatus status; // PENDING, SENT, FAILED

    @Column
    private LocalDateTime sentAt;

    @Column
    private String errorMessage;

    @Column
    private Integer retryCount;

    public enum NotificationType {
        EMAIL, SMS
    }

    public enum NotificationStatus {
        PENDING, SENT, FAILED
    }
}
