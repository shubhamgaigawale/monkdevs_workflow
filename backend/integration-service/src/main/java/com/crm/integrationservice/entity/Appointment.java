package com.crm.integrationservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "appointments", schema = "integration_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Appointment extends BaseEntity {

    @Column(name = "lead_id")
    private UUID leadId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "external_id")
    private String externalId;

    @Column(name = "event_type", length = 100)
    private String eventType;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(name = "meeting_url", columnDefinition = "TEXT")
    private String meetingUrl;

    @Column(name = "invitee_name")
    private String inviteeName;

    @Column(name = "invitee_email")
    private String inviteeEmail;

    @Column(name = "invitee_phone", length = 50)
    private String inviteePhone;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    public enum AppointmentStatus {
        SCHEDULED,
        COMPLETED,
        CANCELLED,
        RESCHEDULED
    }
}
