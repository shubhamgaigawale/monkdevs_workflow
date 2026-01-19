package com.crm.leadservice.service;

import com.crm.common.exception.BadRequestException;
import com.crm.common.exception.ResourceNotFoundException;
import com.crm.leadservice.dto.request.AssignLeadRequest;
import com.crm.leadservice.dto.request.BulkAssignRequest;
import com.crm.leadservice.dto.response.LeadAssignmentDTO;
import com.crm.leadservice.entity.Lead;
import com.crm.leadservice.entity.LeadAssignment;
import com.crm.leadservice.entity.LeadHistory;
import com.crm.leadservice.repository.LeadAssignmentRepository;
import com.crm.leadservice.repository.LeadHistoryRepository;
import com.crm.leadservice.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LeadAssignmentService {

    private final LeadRepository leadRepository;
    private final LeadAssignmentRepository assignmentRepository;
    private final LeadHistoryRepository historyRepository;

    /**
     * Assign a lead to a user
     */
    public LeadAssignmentDTO assignLead(UUID leadId, AssignLeadRequest request, UUID tenantId, UUID assignedBy) {
        log.info("Assigning lead {} to user {}", leadId, request.getAssignedTo());

        // Verify lead exists
        Lead lead = leadRepository.findById(leadId)
                .filter(l -> l.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        // Check if already assigned
        Optional<LeadAssignment> existingAssignment = assignmentRepository.findByLeadIdAndIsCurrentTrue(leadId);
        if (existingAssignment.isPresent() && existingAssignment.get().getAssignedTo().equals(request.getAssignedTo())) {
            throw new BadRequestException("Lead is already assigned to this user");
        }

        // Deactivate existing assignment if exists
        existingAssignment.ifPresent(assignment -> {
            assignment.setIsCurrent(false);
            assignmentRepository.save(assignment);
        });

        // Create new assignment
        LeadAssignment assignment = new LeadAssignment();
        assignment.setTenantId(tenantId);
        assignment.setLeadId(leadId);
        assignment.setAssignedTo(request.getAssignedTo());
        assignment.setAssignedBy(assignedBy);
        assignment.setAssignmentType(request.getAssignmentType() != null ?
                request.getAssignmentType() : LeadAssignment.AssignmentType.MANUAL);
        assignment.setAssignedAt(LocalDateTime.now());
        assignment.setIsCurrent(true);

        assignment = assignmentRepository.save(assignment);

        // Record history
        recordAssignmentHistory(leadId, "ASSIGNED", assignedBy,
                existingAssignment.map(LeadAssignment::getAssignedTo).orElse(null),
                request.getAssignedTo(), tenantId);

        log.info("Lead assigned successfully");
        return convertToDTO(assignment);
    }

    /**
     * Reassign a lead to a different user
     */
    public LeadAssignmentDTO reassignLead(UUID leadId, AssignLeadRequest request, UUID tenantId, UUID reassignedBy) {
        log.info("Reassigning lead {} to user {}", leadId, request.getAssignedTo());

        // This is essentially the same as assign, but with different logging
        return assignLead(leadId, request, tenantId, reassignedBy);
    }

    /**
     * Unassign a lead
     */
    public void unassignLead(UUID leadId, UUID tenantId, UUID unassignedBy) {
        log.info("Unassigning lead {}", leadId);

        LeadAssignment assignment = assignmentRepository.findByLeadIdAndIsCurrentTrue(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("No current assignment found for this lead"));

        if (!assignment.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("Lead not found");
        }

        UUID previousAssignee = assignment.getAssignedTo();

        assignment.setIsCurrent(false);
        assignmentRepository.save(assignment);

        // Record history
        recordAssignmentHistory(leadId, "UNASSIGNED", unassignedBy, previousAssignee, null, tenantId);

        log.info("Lead unassigned successfully");
    }

    /**
     * Bulk assign leads (auto or manual)
     */
    public List<LeadAssignmentDTO> bulkAssignLeads(BulkAssignRequest request, UUID tenantId, UUID assignedBy, List<UUID> availableAgentIds) {
        log.info("Bulk assigning {} leads", request.getLeadIds().size());

        List<LeadAssignmentDTO> assignments = new ArrayList<>();

        if (request.getAssignedTo() != null) {
            // Manual assignment to specific user
            for (UUID leadId : request.getLeadIds()) {
                AssignLeadRequest assignRequest = new AssignLeadRequest();
                assignRequest.setAssignedTo(request.getAssignedTo());
                assignRequest.setAssignmentType(LeadAssignment.AssignmentType.MANUAL);

                try {
                    LeadAssignmentDTO assignment = assignLead(leadId, assignRequest, tenantId, assignedBy);
                    assignments.add(assignment);
                } catch (Exception e) {
                    log.error("Failed to assign lead {}: {}", leadId, e.getMessage());
                }
            }
        } else {
            // Auto assignment using round-robin
            assignments = autoAssignLeads(request.getLeadIds(), tenantId, assignedBy, availableAgentIds);
        }

        log.info("Bulk assignment completed: {} leads assigned", assignments.size());
        return assignments;
    }

    /**
     * Auto-assign leads using round-robin algorithm
     */
    private List<LeadAssignmentDTO> autoAssignLeads(List<UUID> leadIds, UUID tenantId, UUID assignedBy, List<UUID> agentIds) {
        log.info("Auto-assigning {} leads to {} agents", leadIds.size(), agentIds.size());

        if (agentIds == null || agentIds.isEmpty()) {
            throw new BadRequestException("No agents available for auto-assignment");
        }

        List<LeadAssignmentDTO> assignments = new ArrayList<>();

        // Get current assignment counts for load balancing
        Map<UUID, Long> assignmentCounts = new HashMap<>();
        List<Object[]> counts = assignmentRepository.countAssignmentsByUser(tenantId);
        for (Object[] row : counts) {
            UUID userId = (UUID) row[0];
            Long count = ((Number) row[1]).longValue();
            if (agentIds.contains(userId)) {
                assignmentCounts.put(userId, count);
            }
        }

        // Initialize counts for agents with no assignments
        for (UUID agentId : agentIds) {
            assignmentCounts.putIfAbsent(agentId, 0L);
        }

        // Sort agents by assignment count (ascending)
        List<UUID> sortedAgents = new ArrayList<>(assignmentCounts.keySet());
        sortedAgents.sort(Comparator.comparing(assignmentCounts::get));

        // Round-robin assignment
        int agentIndex = 0;
        for (UUID leadId : leadIds) {
            try {
                UUID assignedTo = sortedAgents.get(agentIndex % sortedAgents.size());

                AssignLeadRequest assignRequest = new AssignLeadRequest();
                assignRequest.setAssignedTo(assignedTo);
                assignRequest.setAssignmentType(LeadAssignment.AssignmentType.AUTO);

                LeadAssignmentDTO assignment = assignLead(leadId, assignRequest, tenantId, assignedBy);
                assignments.add(assignment);

                // Update count for load balancing
                assignmentCounts.put(assignedTo, assignmentCounts.get(assignedTo) + 1);
                sortedAgents.sort(Comparator.comparing(assignmentCounts::get));

                agentIndex++;
            } catch (Exception e) {
                log.error("Failed to auto-assign lead {}: {}", leadId, e.getMessage());
            }
        }

        return assignments;
    }

    /**
     * Get assignment history for a lead
     */
    @Transactional(readOnly = true)
    public List<LeadAssignmentDTO> getLeadAssignmentHistory(UUID leadId, UUID tenantId) {
        log.info("Fetching assignment history for lead: {}", leadId);

        List<LeadAssignment> assignments = assignmentRepository.findByLeadIdOrderByAssignedAtDesc(leadId);

        return assignments.stream()
                .map(this::convertToDTO)
                .toList();
    }

    /**
     * Get current assignment for a lead
     */
    @Transactional(readOnly = true)
    public Optional<LeadAssignmentDTO> getCurrentAssignment(UUID leadId) {
        return assignmentRepository.findByLeadIdAndIsCurrentTrue(leadId)
                .map(this::convertToDTO);
    }

    /**
     * Get all leads assigned to a user
     */
    @Transactional(readOnly = true)
    public List<LeadAssignmentDTO> getUserAssignments(UUID userId, UUID tenantId) {
        log.info("Fetching assignments for user: {}", userId);

        List<LeadAssignment> assignments = assignmentRepository.findByTenantIdAndAssignedToAndIsCurrentTrue(tenantId, userId);

        return assignments.stream()
                .map(this::convertToDTO)
                .toList();
    }

    /**
     * Record assignment history
     */
    private void recordAssignmentHistory(UUID leadId, String action, UUID performedBy,
                                         UUID oldAssignee, UUID newAssignee, UUID tenantId) {
        Map<String, Object> oldValue = oldAssignee != null ? Map.of("assignedTo", oldAssignee.toString()) : null;
        Map<String, Object> newValue = newAssignee != null ? Map.of("assignedTo", newAssignee.toString()) : null;

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
     * Convert LeadAssignment to DTO
     */
    private LeadAssignmentDTO convertToDTO(LeadAssignment assignment) {
        return LeadAssignmentDTO.builder()
                .id(assignment.getId())
                .leadId(assignment.getLeadId())
                .assignedTo(assignment.getAssignedTo())
                .assignedBy(assignment.getAssignedBy())
                .assignmentType(assignment.getAssignmentType())
                .assignedAt(assignment.getAssignedAt())
                .isCurrent(assignment.getIsCurrent())
                .build();
    }
}
