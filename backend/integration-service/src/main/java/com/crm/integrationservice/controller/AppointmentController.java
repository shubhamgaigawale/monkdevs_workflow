package com.crm.integrationservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.integrationservice.dto.response.AppointmentDTO;
import com.crm.integrationservice.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/integrations/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Calendly appointments management")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    @PreAuthorize("hasAuthority('integrations:read')")
    @Operation(summary = "Get all appointments", description = "Get paginated list of appointments")
    public ApiResponse<Page<AppointmentDTO>> getAllAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) httpRequest.getAttribute("roles");

        Page<AppointmentDTO> appointments = appointmentService.getAllAppointments(tenantId, userId, roles, page, size);
        return ApiResponse.success(appointments);
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasAuthority('integrations:read')")
    @Operation(summary = "Get upcoming appointments", description = "Get upcoming scheduled appointments")
    public ApiResponse<List<AppointmentDTO>> getUpcomingAppointments(HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        List<AppointmentDTO> appointments = appointmentService.getUpcomingAppointments(tenantId);
        return ApiResponse.success(appointments);
    }
}
