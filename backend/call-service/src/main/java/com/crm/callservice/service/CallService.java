package com.crm.callservice.service;

import com.crm.callservice.dto.request.LogCallRequest;
import com.crm.callservice.dto.request.UpdateCallRequest;
import com.crm.callservice.dto.response.CallDTO;
import com.crm.callservice.dto.response.CallStatsDTO;
import com.crm.callservice.entity.Call;
import com.crm.callservice.entity.CallLog;
import com.crm.callservice.repository.CallLogRepository;
import com.crm.callservice.repository.CallRepository;
import com.crm.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CallService {

    private final CallRepository callRepository;
    private final CallLogRepository callLogRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Log a new call
     */
    public CallDTO logCall(LogCallRequest request, UUID tenantId, UUID userId) {
        log.info("Logging new call for tenant: {}, user: {}", tenantId, userId);

        Call call = new Call();
        call.setTenantId(tenantId);
        call.setUserId(userId);
        call.setPhoneNumber(request.getPhoneNumber());
        call.setDirection(request.getDirection());
        call.setStatus(request.getStatus() != null ? request.getStatus() : Call.CallStatus.COMPLETED);
        call.setDuration(request.getDuration() != null ? request.getDuration() : 0);
        call.setCallStartTime(request.getCallStartTime() != null ? request.getCallStartTime() : LocalDateTime.now());
        call.setCallEndTime(request.getCallEndTime());
        call.setNotes(request.getNotes());
        call.setOutcome(request.getOutcome());
        call.setFollowUpRequired(request.getFollowUpRequired() != null ? request.getFollowUpRequired() : false);
        call.setFollowUpDate(request.getFollowUpDate());
        call.setExternalCallId(request.getExternalCallId());
        call.setCallMetadata(request.getCallMetadata());

        // Try to associate with existing lead by phone number
        if (request.getLeadId() != null) {
            call.setLeadId(request.getLeadId());
        } else {
            UUID associatedLeadId = findLeadByPhone(tenantId, request.getPhoneNumber());
            call.setLeadId(associatedLeadId);
        }

        call = callRepository.save(call);

        // Create call log
        createCallLog(call.getId(), "CALL_LOGGED", Map.of(
                "direction", call.getDirection().toString(),
                "status", call.getStatus().toString(),
                "phone", call.getPhoneNumber()
        ), tenantId);

        log.info("Call logged successfully: {}", call.getId());
        return convertToDTO(call);
    }

    /**
     * Get call by ID
     */
    @Transactional(readOnly = true)
    public CallDTO getCallById(UUID callId, UUID tenantId) {
        log.info("Fetching call: {}", callId);

        Call call = callRepository.findById(callId)
                .filter(c -> c.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Call not found"));

        return convertToDTO(call);
    }

    /**
     * Update call
     */
    public CallDTO updateCall(UUID callId, UpdateCallRequest request, UUID tenantId) {
        log.info("Updating call: {}", callId);

        Call call = callRepository.findById(callId)
                .filter(c -> c.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Call not found"));

        if (request.getLeadId() != null) call.setLeadId(request.getLeadId());
        if (request.getStatus() != null) call.setStatus(request.getStatus());
        if (request.getDuration() != null) call.setDuration(request.getDuration());
        if (request.getCallEndTime() != null) call.setCallEndTime(request.getCallEndTime());
        if (request.getNotes() != null) call.setNotes(request.getNotes());
        if (request.getOutcome() != null) call.setOutcome(request.getOutcome());
        if (request.getFollowUpRequired() != null) call.setFollowUpRequired(request.getFollowUpRequired());
        if (request.getFollowUpDate() != null) call.setFollowUpDate(request.getFollowUpDate());
        if (request.getRecordingUrl() != null) call.setRecordingUrl(request.getRecordingUrl());
        if (request.getCallMetadata() != null) call.setCallMetadata(request.getCallMetadata());

        call = callRepository.save(call);

        // Create call log
        createCallLog(call.getId(), "CALL_UPDATED", Map.of(
                "status", call.getStatus().toString()
        ), tenantId);

        log.info("Call updated successfully: {}", call.getId());
        return convertToDTO(call);
    }

    /**
     * Delete call
     */
    public void deleteCall(UUID callId, UUID tenantId) {
        log.info("Deleting call: {}", callId);

        Call call = callRepository.findById(callId)
                .filter(c -> c.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Call not found"));

        callRepository.delete(call);
        log.info("Call deleted successfully: {}", callId);
    }

    /**
     * Get all calls with pagination
     */
    @Transactional(readOnly = true)
    public Page<CallDTO> getAllCalls(UUID tenantId, UUID userId, List<String> roles, int page, int size) {
        log.info("Fetching calls for tenant: {}, user: {}", tenantId, userId);

        Pageable pageable = PageRequest.of(page, size, Sort.by("callStartTime").descending());

        Page<Call> calls;

        if (roles.contains("AGENT")) {
            // Agents see only their calls
            calls = callRepository.findByTenantIdAndUserIdOrderByCallStartTimeDesc(tenantId, userId, pageable);
        } else {
            // Supervisors and Admins see all calls
            calls = callRepository.findByTenantIdOrderByCallStartTimeDesc(tenantId, pageable);
        }

        return calls.map(this::convertToDTO);
    }

    /**
     * Get calls by lead
     */
    @Transactional(readOnly = true)
    public List<CallDTO> getCallsByLead(UUID leadId, UUID tenantId) {
        log.info("Fetching calls for lead: {}", leadId);

        List<Call> calls = callRepository.findByTenantIdAndLeadIdOrderByCallStartTimeDesc(tenantId, leadId);

        return calls.stream()
                .map(this::convertToDTO)
                .toList();
    }

    /**
     * Get calls by phone number
     */
    @Transactional(readOnly = true)
    public List<CallDTO> getCallsByPhone(String phoneNumber, UUID tenantId) {
        log.info("Fetching calls for phone: {}", phoneNumber);

        List<Call> calls = callRepository.findByTenantIdAndPhoneNumberOrderByCallStartTimeDesc(tenantId, phoneNumber);

        return calls.stream()
                .map(this::convertToDTO)
                .toList();
    }

    /**
     * Add note to call
     */
    public CallDTO addNote(UUID callId, String note, UUID tenantId) {
        log.info("Adding note to call: {}", callId);

        Call call = callRepository.findById(callId)
                .filter(c -> c.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Call not found"));

        String existingNotes = call.getNotes() != null ? call.getNotes() : "";
        String updatedNotes = existingNotes.isEmpty() ? note : existingNotes + "\n\n" + note;
        call.setNotes(updatedNotes);

        call = callRepository.save(call);

        // Create call log
        createCallLog(call.getId(), "NOTE_ADDED", Map.of("note", note), tenantId);

        log.info("Note added successfully to call: {}", callId);
        return convertToDTO(call);
    }

    /**
     * Get calls requiring follow-up
     */
    @Transactional(readOnly = true)
    public List<CallDTO> getCallsRequiringFollowUp(UUID tenantId) {
        log.info("Fetching calls requiring follow-up for tenant: {}", tenantId);

        List<Call> calls = callRepository.findCallsRequiringFollowUp(tenantId, LocalDateTime.now());

        return calls.stream()
                .map(this::convertToDTO)
                .toList();
    }

    /**
     * Get call statistics
     */
    @Transactional(readOnly = true)
    public CallStatsDTO getCallStats(UUID tenantId) {
        log.info("Fetching call statistics for tenant: {}", tenantId);

        long totalCalls = callRepository.findByTenantIdOrderByCallStartTimeDesc(tenantId, Pageable.unpaged()).getTotalElements();

        List<Object[]> directionCounts = callRepository.countCallsByDirection(tenantId);
        Map<Call.CallDirection, Long> callsByDirection = new HashMap<>();
        long inboundCalls = 0;
        long outboundCalls = 0;
        for (Object[] row : directionCounts) {
            Call.CallDirection direction = (Call.CallDirection) row[0];
            Long count = ((Number) row[1]).longValue();
            callsByDirection.put(direction, count);
            if (direction == Call.CallDirection.INBOUND) inboundCalls = count;
            if (direction == Call.CallDirection.OUTBOUND) outboundCalls = count;
        }

        List<Object[]> statusCounts = callRepository.countCallsByStatus(tenantId);
        Map<Call.CallStatus, Long> callsByStatus = new HashMap<>();
        for (Object[] row : statusCounts) {
            callsByStatus.put((Call.CallStatus) row[0], ((Number) row[1]).longValue());
        }

        List<Object[]> durationData = callRepository.getTotalDurationByUser(tenantId);
        int totalDuration = 0;
        for (Object[] row : durationData) {
            Long duration = ((Number) row[1]).longValue();
            totalDuration += duration;
        }
        int averageDuration = totalCalls > 0 ? (int) (totalDuration / totalCalls) : 0;

        long callsRequiringFollowUp = callRepository.findCallsRequiringFollowUp(tenantId, LocalDateTime.now()).size();

        return CallStatsDTO.builder()
                .totalCalls(totalCalls)
                .inboundCalls(inboundCalls)
                .outboundCalls(outboundCalls)
                .totalDuration(totalDuration)
                .averageDuration(averageDuration)
                .callsByStatus(callsByStatus)
                .callsByDirection(callsByDirection)
                .callsRequiringFollowUp(callsRequiringFollowUp)
                .build();
    }

    /**
     * Find lead by phone number (call to Lead Service)
     */
    private UUID findLeadByPhone(UUID tenantId, String phoneNumber) {
        try {
            String leadServiceUrl = "http://localhost:8083/api/leads/search";

            // In production, this should use service discovery or API Gateway
            // For now, direct call to lead-service
            log.debug("Searching for lead with phone: {}", phoneNumber);

            // This is a placeholder - in real implementation, you'd call the Lead Service API
            // For now, return null (no association)
            return null;
        } catch (Exception e) {
            log.error("Error finding lead by phone: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Create call log
     */
    private void createCallLog(UUID callId, String eventType, Map<String, Object> eventData, UUID tenantId) {
        CallLog callLog = new CallLog();
        callLog.setTenantId(tenantId);
        callLog.setCallId(callId);
        callLog.setEventType(eventType);
        callLog.setEventData(eventData);

        callLogRepository.save(callLog);
    }

    /**
     * Convert Call entity to DTO
     */
    private CallDTO convertToDTO(Call call) {
        return CallDTO.builder()
                .id(call.getId())
                .tenantId(call.getTenantId())
                .leadId(call.getLeadId())
                .userId(call.getUserId())
                .phoneNumber(call.getPhoneNumber())
                .direction(call.getDirection())
                .status(call.getStatus())
                .duration(call.getDuration())
                .callStartTime(call.getCallStartTime())
                .callEndTime(call.getCallEndTime())
                .recordingUrl(call.getRecordingUrl())
                .notes(call.getNotes())
                .outcome(call.getOutcome())
                .followUpRequired(call.getFollowUpRequired())
                .followUpDate(call.getFollowUpDate())
                .externalCallId(call.getExternalCallId())
                .callMetadata(call.getCallMetadata())
                .createdAt(call.getCreatedAt())
                .updatedAt(call.getUpdatedAt())
                .build();
    }
}
