package com.crm.integrationservice.service;

import com.crm.integrationservice.dto.response.AppointmentDTO;
import com.crm.integrationservice.entity.Appointment;
import com.crm.integrationservice.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    /**
     * Get all appointments
     */
    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAllAppointments(UUID tenantId, UUID userId, List<String> roles, int page, int size) {
        log.info("Fetching appointments for tenant: {}", tenantId);

        Pageable pageable = PageRequest.of(page, size, Sort.by("startTime").descending());

        Page<Appointment> appointments;

        if (roles.contains("AGENT")) {
            appointments = appointmentRepository.findByTenantIdAndUserIdOrderByStartTimeDesc(tenantId, userId, pageable);
        } else {
            appointments = appointmentRepository.findByTenantIdOrderByStartTimeDesc(tenantId, pageable);
        }

        return appointments.map(this::convertToDTO);
    }

    /**
     * Get upcoming appointments
     */
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getUpcomingAppointments(UUID tenantId) {
        log.info("Fetching upcoming appointments for tenant: {}", tenantId);

        List<Appointment> appointments = appointmentRepository.findUpcomingAppointments(tenantId, LocalDateTime.now());

        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert to DTO
     */
    private AppointmentDTO convertToDTO(Appointment appointment) {
        return AppointmentDTO.builder()
                .id(appointment.getId())
                .tenantId(appointment.getTenantId())
                .leadId(appointment.getLeadId())
                .userId(appointment.getUserId())
                .externalId(appointment.getExternalId())
                .eventType(appointment.getEventType())
                .startTime(appointment.getStartTime())
                .endTime(appointment.getEndTime())
                .status(appointment.getStatus())
                .meetingUrl(appointment.getMeetingUrl())
                .inviteeName(appointment.getInviteeName())
                .inviteeEmail(appointment.getInviteeEmail())
                .inviteePhone(appointment.getInviteePhone())
                .notes(appointment.getNotes())
                .metadata(appointment.getMetadata())
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}
