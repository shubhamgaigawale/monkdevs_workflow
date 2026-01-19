package com.crm.integrationservice.dto.response;

import com.crm.integrationservice.entity.Appointment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {

    private UUID id;
    private UUID tenantId;
    private UUID leadId;
    private UUID userId;
    private String externalId;
    private String eventType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Appointment.AppointmentStatus status;
    private String meetingUrl;
    private String inviteeName;
    private String inviteeEmail;
    private String inviteePhone;
    private String notes;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
}
