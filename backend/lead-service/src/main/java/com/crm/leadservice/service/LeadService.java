package com.crm.leadservice.service;

import com.crm.common.exception.ResourceNotFoundException;
import com.crm.leadservice.dto.request.CreateLeadRequest;
import com.crm.leadservice.dto.request.SearchLeadRequest;
import com.crm.leadservice.dto.request.UpdateLeadRequest;
import com.crm.leadservice.dto.response.LeadDTO;
import com.crm.leadservice.dto.response.LeadHistoryDTO;
import com.crm.leadservice.dto.response.LeadStatsDTO;
import com.crm.leadservice.entity.Lead;
import com.crm.leadservice.entity.LeadAssignment;
import com.crm.leadservice.entity.LeadHistory;
import com.crm.leadservice.repository.LeadAssignmentRepository;
import com.crm.leadservice.repository.LeadHistoryRepository;
import com.crm.leadservice.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LeadService {

    private final LeadRepository leadRepository;
    private final LeadAssignmentRepository assignmentRepository;
    private final LeadHistoryRepository historyRepository;

    /**
     * Create a new lead
     */
    public LeadDTO createLead(CreateLeadRequest request, UUID tenantId, UUID userId) {
        log.info("Creating new lead for tenant: {}", tenantId);

        Lead lead = new Lead();
        lead.setTenantId(tenantId);
        lead.setFirstName(request.getFirstName());
        lead.setLastName(request.getLastName());
        lead.setEmail(request.getEmail());
        lead.setPhone(request.getPhone());
        lead.setCompany(request.getCompany());
        lead.setSource(request.getSource());
        lead.setStatus(request.getStatus() != null ? request.getStatus() : Lead.LeadStatus.NEW);
        lead.setPriority(request.getPriority() != null ? request.getPriority() : Lead.LeadPriority.MEDIUM);
        lead.setCustomFields(request.getCustomFields());
        lead.setNotes(request.getNotes());

        lead = leadRepository.save(lead);

        // Record history
        recordHistory(lead.getId(), "CREATED", userId, null, convertToMap(lead), tenantId);

        log.info("Lead created successfully: {}", lead.getId());
        return convertToDTO(lead);
    }

    /**
     * Get lead by ID with role-based access control
     */
    @Transactional(readOnly = true)
    public LeadDTO getLeadById(UUID leadId, UUID tenantId, UUID userId, List<String> roles) {
        log.info("Fetching lead: {} for user: {}", leadId, userId);

        Lead lead = leadRepository.findById(leadId)
                .filter(l -> l.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        // Check access based on role
        if (roles.contains("AGENT")) {
            // Agents can only see their assigned leads
            LeadAssignment assignment = assignmentRepository.findByLeadIdAndIsCurrentTrue(leadId)
                    .orElseThrow(() -> new ResourceNotFoundException("Lead not assigned to you"));

            if (!assignment.getAssignedTo().equals(userId)) {
                throw new ResourceNotFoundException("Lead not assigned to you");
            }
        }

        return convertToDTO(lead);
    }

    /**
     * Update lead
     */
    public LeadDTO updateLead(UUID leadId, UpdateLeadRequest request, UUID tenantId, UUID userId) {
        log.info("Updating lead: {}", leadId);

        Lead lead = leadRepository.findById(leadId)
                .filter(l -> l.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        Map<String, Object> oldValue = convertToMap(lead);

        // Update fields
        if (request.getFirstName() != null) lead.setFirstName(request.getFirstName());
        if (request.getLastName() != null) lead.setLastName(request.getLastName());
        if (request.getEmail() != null) lead.setEmail(request.getEmail());
        if (request.getPhone() != null) lead.setPhone(request.getPhone());
        if (request.getCompany() != null) lead.setCompany(request.getCompany());
        if (request.getSource() != null) lead.setSource(request.getSource());
        if (request.getStatus() != null) lead.setStatus(request.getStatus());
        if (request.getPriority() != null) lead.setPriority(request.getPriority());
        if (request.getCustomFields() != null) lead.setCustomFields(request.getCustomFields());
        if (request.getNotes() != null) lead.setNotes(request.getNotes());

        lead = leadRepository.save(lead);

        // Record history
        recordHistory(lead.getId(), "UPDATED", userId, oldValue, convertToMap(lead), tenantId);

        log.info("Lead updated successfully: {}", lead.getId());
        return convertToDTO(lead);
    }

    /**
     * Delete lead
     */
    public void deleteLead(UUID leadId, UUID tenantId, UUID userId) {
        log.info("Deleting lead: {}", leadId);

        Lead lead = leadRepository.findById(leadId)
                .filter(l -> l.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        // Record history before deletion
        recordHistory(lead.getId(), "DELETED", userId, convertToMap(lead), null, tenantId);

        leadRepository.delete(lead);
        log.info("Lead deleted successfully: {}", leadId);
    }

    /**
     * Get all leads with role-based filtering
     */
    @Transactional(readOnly = true)
    public Page<LeadDTO> getAllLeads(UUID tenantId, UUID userId, List<String> roles, int page, int size) {
        log.info("Fetching leads for tenant: {}, user: {}, roles: {}", tenantId, userId, roles);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Lead> leads;

        if (roles.contains("AGENT")) {
            // Agents see only their assigned leads
            leads = leadRepository.findAssignedLeads(tenantId, userId, pageable);
        } else {
            // Supervisors and Admins see all leads
            leads = leadRepository.findByTenantId(tenantId, pageable);
        }

        return leads.map(this::convertToDTO);
    }

    /**
     * Search leads with filters
     */
    @Transactional(readOnly = true)
    public Page<LeadDTO> searchLeads(SearchLeadRequest request, UUID tenantId, UUID userId, List<String> roles) {
        log.info("Searching leads with query: {}", request.getSearchQuery());

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), Sort.by("createdAt").descending());

        // Apply role-based filtering
        Page<Lead> leads;

        if (request.getSearchQuery() != null && !request.getSearchQuery().isBlank()) {
            // Full-text search
            List<Lead> searchResults = leadRepository.searchLeads(tenantId, request.getSearchQuery());

            // Apply additional filters
            searchResults = searchResults.stream()
                    .filter(lead -> request.getStatus() == null || lead.getStatus().equals(request.getStatus()))
                    .filter(lead -> request.getPriority() == null || lead.getPriority().equals(request.getPriority()))
                    .filter(lead -> request.getSource() == null || request.getSource().equals(lead.getSource()))
                    .collect(Collectors.toList());

            // Apply role-based filtering for agents
            if (roles.contains("AGENT")) {
                searchResults = searchResults.stream()
                        .filter(lead -> {
                            Optional<LeadAssignment> assignment = assignmentRepository.findByLeadIdAndIsCurrentTrue(lead.getId());
                            return assignment.isPresent() && assignment.get().getAssignedTo().equals(userId);
                        })
                        .collect(Collectors.toList());
            }

            // Manual pagination
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), searchResults.size());
            List<Lead> pageContent = searchResults.subList(start, end);

            leads = new org.springframework.data.domain.PageImpl<>(pageContent, pageable, searchResults.size());
        } else if (request.getStatus() != null) {
            leads = leadRepository.findByTenantIdAndStatus(tenantId, request.getStatus(), pageable);
        } else if (Boolean.TRUE.equals(request.getAssigned())) {
            if (roles.contains("AGENT")) {
                leads = leadRepository.findAssignedLeads(tenantId, userId, pageable);
            } else {
                // For supervisors/admins, this would need a different query
                leads = leadRepository.findByTenantId(tenantId, pageable);
            }
        } else if (Boolean.FALSE.equals(request.getAssigned())) {
            leads = leadRepository.findUnassignedLeads(tenantId, pageable);
        } else {
            return getAllLeads(tenantId, userId, roles, request.getPage(), request.getSize());
        }

        return leads.map(this::convertToDTO);
    }

    /**
     * Get lead history
     */
    @Transactional(readOnly = true)
    public List<LeadHistoryDTO> getLeadHistory(UUID leadId, UUID tenantId) {
        log.info("Fetching history for lead: {}", leadId);

        List<LeadHistory> history = historyRepository.findByLeadIdOrderByTimestampDesc(leadId);

        return history.stream()
                .map(this::convertHistoryToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get lead statistics
     */
    @Transactional(readOnly = true)
    public LeadStatsDTO getLeadStats(UUID tenantId) {
        log.info("Fetching lead statistics for tenant: {}", tenantId);

        long totalLeads = leadRepository.findByTenantId(tenantId, Pageable.unpaged()).getTotalElements();

        List<Object[]> statusCounts = leadRepository.countLeadsByStatus(tenantId);
        Map<Lead.LeadStatus, Long> leadsByStatus = new HashMap<>();
        for (Object[] row : statusCounts) {
            leadsByStatus.put((Lead.LeadStatus) row[0], ((Number) row[1]).longValue());
        }

        // Count assigned/unassigned
        long assignedLeads = assignmentRepository.findByTenantIdAndAssignedToAndIsCurrentTrue(tenantId, null).size();
        long unassignedLeads = totalLeads - assignedLeads;

        return LeadStatsDTO.builder()
                .totalLeads(totalLeads)
                .assignedLeads(assignedLeads)
                .unassignedLeads(unassignedLeads)
                .leadsByStatus(leadsByStatus)
                .build();
    }

    /**
     * Record lead history
     */
    private void recordHistory(UUID leadId, String action, UUID performedBy,
                                Map<String, Object> oldValue, Map<String, Object> newValue, UUID tenantId) {
        LeadHistory history = new LeadHistory();
        history.setTenantId(tenantId);
        history.setLeadId(leadId);
        history.setAction(action);
        history.setPerformedBy(performedBy);
        history.setOldValue(oldValue);
        history.setNewValue(newValue);
        history.setTimestamp(LocalDateTime.now());

        historyRepository.save(history);
    }

    /**
     * Convert Lead entity to DTO
     */
    private LeadDTO convertToDTO(Lead lead) {
        LeadDTO dto = LeadDTO.builder()
                .id(lead.getId())
                .tenantId(lead.getTenantId())
                .firstName(lead.getFirstName())
                .lastName(lead.getLastName())
                .email(lead.getEmail())
                .phone(lead.getPhone())
                .company(lead.getCompany())
                .source(lead.getSource())
                .status(lead.getStatus())
                .priority(lead.getPriority())
                .customFields(lead.getCustomFields())
                .notes(lead.getNotes())
                .createdAt(lead.getCreatedAt())
                .updatedAt(lead.getUpdatedAt())
                .build();

        // Add assignment info if exists
        assignmentRepository.findByLeadIdAndIsCurrentTrue(lead.getId())
                .ifPresent(assignment -> {
                    dto.setAssignedTo(assignment.getAssignedTo());
                });

        return dto;
    }

    /**
     * Convert Lead entity to Map for history
     */
    private Map<String, Object> convertToMap(Lead lead) {
        Map<String, Object> map = new HashMap<>();
        map.put("firstName", lead.getFirstName());
        map.put("lastName", lead.getLastName());
        map.put("email", lead.getEmail());
        map.put("phone", lead.getPhone());
        map.put("company", lead.getCompany());
        map.put("source", lead.getSource());
        map.put("status", lead.getStatus());
        map.put("priority", lead.getPriority());
        map.put("notes", lead.getNotes());
        return map;
    }

    /**
     * Convert LeadHistory to DTO
     */
    private LeadHistoryDTO convertHistoryToDTO(LeadHistory history) {
        return LeadHistoryDTO.builder()
                .id(history.getId())
                .leadId(history.getLeadId())
                .action(history.getAction())
                .performedBy(history.getPerformedBy())
                .oldValue(history.getOldValue())
                .newValue(history.getNewValue())
                .timestamp(history.getTimestamp())
                .build();
    }
}
