package com.crm.hrservice.service;

import com.crm.common.exception.BadRequestException;
import com.crm.common.exception.ResourceNotFoundException;
import com.crm.hrservice.dto.request.*;
import com.crm.hrservice.dto.response.*;
import com.crm.hrservice.entity.*;
import com.crm.hrservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Onboarding service - handles employee onboarding workflow
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final OnboardingTemplateRepository templateRepository;
    private final OnboardingTaskRepository taskRepository;
    private final EmployeeOnboardingRepository onboardingRepository;
    private final EmployeeOnboardingTaskRepository onboardingTaskRepository;
    private final EmployeeDocumentRepository documentRepository;
    private final EquipmentAssignmentRepository equipmentRepository;

    // ==================== Onboarding Lifecycle ====================

    /**
     * Start onboarding for a new employee
     */
    @Transactional
    public EmployeeOnboardingDTO startOnboarding(UUID tenantId, StartOnboardingRequest request) {
        log.info("Starting onboarding for user: {} in tenant: {}", request.getUserId(), tenantId);

        // Check if onboarding already exists
        if (onboardingRepository.existsByTenantIdAndUserId(tenantId, request.getUserId())) {
            throw new BadRequestException("Onboarding already exists for this user");
        }

        // Get template (use default if not specified)
        OnboardingTemplate template;
        if (request.getTemplateId() != null) {
            template = templateRepository.findByTenantIdAndId(tenantId, request.getTemplateId())
                    .orElseThrow(() -> new ResourceNotFoundException("Onboarding template not found"));
        } else {
            template = templateRepository.findByTenantIdAndIsDefaultTrue(tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("No default onboarding template found"));
        }

        // Calculate expected completion date
        LocalDate expectedCompletionDate = request.getStartDate().plusDays(template.getDurationDays());

        // Calculate probation end date if not provided
        LocalDate probationEndDate = request.getProbationEndDate() != null
                ? request.getProbationEndDate()
                : request.getStartDate().plusDays(90); // Default 90 days

        // Create onboarding record
        EmployeeOnboarding onboarding = EmployeeOnboarding.builder()
                .userId(request.getUserId())
                .template(template)
                .startDate(request.getStartDate())
                .expectedCompletionDate(expectedCompletionDate)
                .status(EmployeeOnboarding.OnboardingStatus.IN_PROGRESS)
                .completionPercentage(BigDecimal.ZERO)
                .managerId(request.getManagerId())
                .buddyId(request.getBuddyId())
                .probationEndDate(probationEndDate)
                .notes(request.getNotes())
                .build();
        onboarding.setTenantId(tenantId);

        onboarding = onboardingRepository.save(onboarding);
        log.info("Onboarding created with ID: {}", onboarding.getId());

        // Create tasks from template
        createOnboardingTasks(onboarding, template);

        // Send welcome email
        // TODO: Implement email notification

        return toEmployeeOnboardingDTO(onboarding, true);
    }

    /**
     * Create onboarding tasks from template
     */
    private void createOnboardingTasks(EmployeeOnboarding onboarding, OnboardingTemplate template) {
        List<OnboardingTask> templateTasks = taskRepository.findByTemplateIdOrderByTaskOrderAsc(template.getId());

        for (OnboardingTask templateTask : templateTasks) {
            LocalDate dueDate = onboarding.getStartDate().plusDays(templateTask.getDueDaysFromStart());

            EmployeeOnboardingTask task = EmployeeOnboardingTask.builder()
                    .onboarding(onboarding)
                    .task(templateTask)
                    .title(templateTask.getTitle())
                    .description(templateTask.getDescription())
                    .dueDate(dueDate)
                    .assignedToRole(templateTask.getAssignedToRole())
                    .status(EmployeeOnboardingTask.TaskStatus.PENDING)
                    .taskOrder(templateTask.getTaskOrder())
                    .build();
            task.setTenantId(onboarding.getTenantId());

            onboardingTaskRepository.save(task);
        }

        log.info("Created {} onboarding tasks for user: {}", templateTasks.size(), onboarding.getUserId());
    }

    /**
     * Get onboarding progress for a user
     */
    public EmployeeOnboardingDTO getMyOnboarding(UUID userId, UUID tenantId) {
        log.info("Fetching onboarding for user: {}", userId);
        EmployeeOnboarding onboarding = onboardingRepository.findByTenantIdAndUserIdWithTemplate(tenantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("No onboarding found for this user"));
        return toEmployeeOnboardingDTO(onboarding, true);
    }

    /**
     * Get team onboardings (for managers)
     */
    public List<EmployeeOnboardingDTO> getTeamOnboardings(UUID managerId, UUID tenantId) {
        log.info("Fetching team onboardings for manager: {}", managerId);
        List<EmployeeOnboarding> onboardings = onboardingRepository.findByTenantIdAndManagerId(tenantId, managerId);
        return onboardings.stream()
                .map(o -> toEmployeeOnboardingDTO(o, false))
                .collect(Collectors.toList());
    }

    // ==================== Task Management ====================

    /**
     * Get onboarding tasks for a user
     */
    public List<EmployeeOnboardingTaskDTO> getMyTasks(UUID userId, UUID tenantId) {
        log.info("Fetching onboarding tasks for user: {}", userId);
        EmployeeOnboarding onboarding = onboardingRepository.findByTenantIdAndUserId(tenantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("No onboarding found for this user"));

        List<EmployeeOnboardingTask> tasks = onboardingTaskRepository
                .findByOnboardingIdOrderByTaskOrderAsc(onboarding.getId());

        return tasks.stream()
                .map(this::toEmployeeOnboardingTaskDTO)
                .collect(Collectors.toList());
    }

    /**
     * Complete a task
     */
    @Transactional
    public EmployeeOnboardingTaskDTO completeTask(UUID taskId, UUID completedBy, UUID tenantId,
                                                   CompleteTaskRequest request) {
        log.info("Completing task: {} by user: {}", taskId, completedBy);

        EmployeeOnboardingTask task = onboardingTaskRepository.findByTenantIdAndId(tenantId, taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (task.getStatus() == EmployeeOnboardingTask.TaskStatus.COMPLETED) {
            throw new BadRequestException("Task is already completed");
        }

        // Mark task as completed
        task.setStatus(EmployeeOnboardingTask.TaskStatus.COMPLETED);
        task.setCompletedDate(LocalDateTime.now());
        task.setCompletedBy(completedBy);
        task.setNotes(request.getNotes());
        onboardingTaskRepository.save(task);

        // Update onboarding completion percentage
        updateCompletionPercentage(task.getOnboarding().getId());

        log.info("Task completed successfully: {}", taskId);
        return toEmployeeOnboardingTaskDTO(task);
    }

    /**
     * Update completion percentage
     */
    private void updateCompletionPercentage(UUID onboardingId) {
        long totalTasks = onboardingTaskRepository.countTotalTasksByOnboardingId(onboardingId);
        long completedTasks = onboardingTaskRepository.countCompletedTasksByOnboardingId(onboardingId);

        if (totalTasks == 0) {
            return;
        }

        BigDecimal percentage = BigDecimal.valueOf(completedTasks)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalTasks), 2, RoundingMode.HALF_UP);

        EmployeeOnboarding onboarding = onboardingRepository.findById(onboardingId)
                .orElseThrow(() -> new ResourceNotFoundException("Onboarding not found"));

        onboarding.setCompletionPercentage(percentage);

        // If 100% complete, mark as completed
        if (percentage.compareTo(BigDecimal.valueOf(100)) == 0) {
            onboarding.setStatus(EmployeeOnboarding.OnboardingStatus.COMPLETED);
            onboarding.setActualCompletionDate(LocalDate.now());
        }

        onboardingRepository.save(onboarding);
        log.info("Onboarding completion updated to {}%", percentage);
    }

    // ==================== Document Management ====================

    /**
     * Upload document
     */
    @Transactional
    public EmployeeDocumentDTO uploadDocument(UUID userId, UUID tenantId, DocumentUploadRequest request) {
        log.info("Uploading document for user: {}, type: {}", userId, request.getDocumentType());

        // Get onboarding
        EmployeeOnboarding onboarding = onboardingRepository.findByTenantIdAndUserId(tenantId, userId)
                .orElse(null);

        EmployeeDocument document = EmployeeDocument.builder()
                .userId(userId)
                .onboarding(onboarding)
                .documentType(request.getDocumentType())
                .documentName(request.getDocumentName())
                .filePath(request.getFilePath())
                .fileSize(request.getFileSize())
                .mimeType(request.getMimeType())
                .status(EmployeeDocument.DocumentStatus.PENDING_VERIFICATION)
                .isMandatory(request.getIsMandatory())
                .expiryDate(request.getExpiryDate())
                .uploadedBy(userId)
                .build();
        document.setTenantId(tenantId);

        document = documentRepository.save(document);
        log.info("Document uploaded successfully: {}", document.getId());

        return toEmployeeDocumentDTO(document);
    }

    /**
     * Get user documents
     */
    public List<EmployeeDocumentDTO> getMyDocuments(UUID userId, UUID tenantId) {
        log.info("Fetching documents for user: {}", userId);
        List<EmployeeDocument> documents = documentRepository.findByTenantIdAndUserId(tenantId, userId);
        return documents.stream()
                .map(this::toEmployeeDocumentDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all documents (HR/Admin) with optional status filter
     */
    public List<EmployeeDocumentDTO> getAllDocuments(UUID tenantId, EmployeeDocument.DocumentStatus status) {
        log.info("Fetching all documents for tenant: {} with status filter: {}", tenantId, status);
        List<EmployeeDocument> documents;

        if (status != null) {
            documents = documentRepository.findByTenantIdAndStatus(tenantId, status);
        } else {
            documents = documentRepository.findAll().stream()
                    .filter(doc -> doc.getTenantId().equals(tenantId))
                    .collect(Collectors.toList());
        }

        return documents.stream()
                .map(this::toEmployeeDocumentDTO)
                .collect(Collectors.toList());
    }

    /**
     * Verify document (HR)
     */
    @Transactional
    public EmployeeDocumentDTO verifyDocument(UUID documentId, UUID verifiedBy, UUID tenantId,
                                              DocumentVerificationRequest request) {
        log.info("Verifying document: {} by user: {}", documentId, verifiedBy);

        EmployeeDocument document = documentRepository.findByTenantIdAndId(tenantId, documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        document.setStatus(request.getApproved()
                ? EmployeeDocument.DocumentStatus.VERIFIED
                : EmployeeDocument.DocumentStatus.REJECTED);
        document.setVerifiedBy(verifiedBy);
        document.setVerifiedDate(LocalDateTime.now());
        document.setVerificationNotes(request.getVerificationNotes());

        document = documentRepository.save(document);
        log.info("Document verification completed: {}", documentId);

        return toEmployeeDocumentDTO(document);
    }

    // ==================== Equipment Management ====================

    /**
     * Assign equipment
     */
    @Transactional
    public EquipmentAssignmentDTO assignEquipment(UUID tenantId, UUID assignedBy,
                                                  EquipmentAssignmentRequest request) {
        log.info("Assigning equipment to user: {}", request.getUserId());

        // Get onboarding
        EmployeeOnboarding onboarding = onboardingRepository.findByTenantIdAndUserId(tenantId, request.getUserId())
                .orElse(null);

        EquipmentAssignment equipment = EquipmentAssignment.builder()
                .userId(request.getUserId())
                .onboarding(onboarding)
                .equipmentType(request.getEquipmentType())
                .equipmentName(request.getEquipmentName())
                .serialNumber(request.getSerialNumber())
                .assetTag(request.getAssetTag())
                .assignedDate(request.getAssignedDate())
                .expectedReturnDate(request.getExpectedReturnDate())
                .status(EquipmentAssignment.EquipmentStatus.ASSIGNED)
                .conditionAtAssignment(request.getConditionAtAssignment())
                .notes(request.getNotes())
                .assignedBy(assignedBy)
                .build();
        equipment.setTenantId(tenantId);

        equipment = equipmentRepository.save(equipment);
        log.info("Equipment assigned successfully: {}", equipment.getId());

        return toEquipmentAssignmentDTO(equipment);
    }

    /**
     * Get user equipment
     */
    public List<EquipmentAssignmentDTO> getMyEquipment(UUID userId, UUID tenantId) {
        log.info("Fetching equipment for user: {}", userId);
        List<EquipmentAssignment> equipment = equipmentRepository
                .findByTenantIdAndUserIdAndStatus(tenantId, userId, EquipmentAssignment.EquipmentStatus.ASSIGNED);
        return equipment.stream()
                .map(this::toEquipmentAssignmentDTO)
                .collect(Collectors.toList());
    }

    // ==================== DTO Converters ====================

    private EmployeeOnboardingDTO toEmployeeOnboardingDTO(EmployeeOnboarding onboarding, boolean includeTasks) {
        EmployeeOnboardingDTO dto = EmployeeOnboardingDTO.builder()
                .id(onboarding.getId())
                .tenantId(onboarding.getTenantId())
                .userId(onboarding.getUserId())
                .template(toOnboardingTemplateDTO(onboarding.getTemplate()))
                .startDate(onboarding.getStartDate())
                .expectedCompletionDate(onboarding.getExpectedCompletionDate())
                .actualCompletionDate(onboarding.getActualCompletionDate())
                .status(onboarding.getStatus())
                .completionPercentage(onboarding.getCompletionPercentage())
                .managerId(onboarding.getManagerId())
                .buddyId(onboarding.getBuddyId())
                .probationEndDate(onboarding.getProbationEndDate())
                .confirmationDate(onboarding.getConfirmationDate())
                .notes(onboarding.getNotes())
                .build();

        if (includeTasks) {
            List<EmployeeOnboardingTask> tasks = onboardingTaskRepository
                    .findByOnboardingIdOrderByTaskOrderAsc(onboarding.getId());
            dto.setTasks(tasks.stream()
                    .map(this::toEmployeeOnboardingTaskDTO)
                    .collect(Collectors.toList()));
        } else {
            dto.setTasks(new ArrayList<>());
        }

        return dto;
    }

    private OnboardingTemplateDTO toOnboardingTemplateDTO(OnboardingTemplate template) {
        return OnboardingTemplateDTO.builder()
                .id(template.getId())
                .tenantId(template.getTenantId())
                .name(template.getName())
                .description(template.getDescription())
                .durationDays(template.getDurationDays())
                .isDefault(template.getIsDefault())
                .status(template.getStatus())
                .build();
    }

    private EmployeeOnboardingTaskDTO toEmployeeOnboardingTaskDTO(EmployeeOnboardingTask task) {
        return EmployeeOnboardingTaskDTO.builder()
                .id(task.getId())
                .tenantId(task.getTenantId())
                .onboardingId(task.getOnboarding().getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .dueDate(task.getDueDate())
                .assignedToRole(task.getAssignedToRole())
                .assignedToUserId(task.getAssignedToUserId())
                .status(task.getStatus())
                .completedDate(task.getCompletedDate())
                .completedBy(task.getCompletedBy())
                .notes(task.getNotes())
                .taskOrder(task.getTaskOrder())
                .build();
    }

    private EmployeeDocumentDTO toEmployeeDocumentDTO(EmployeeDocument document) {
        return EmployeeDocumentDTO.builder()
                .id(document.getId())
                .tenantId(document.getTenantId())
                .userId(document.getUserId())
                .onboardingId(document.getOnboarding() != null ? document.getOnboarding().getId() : null)
                .documentType(document.getDocumentType())
                .documentName(document.getDocumentName())
                .filePath(document.getFilePath())
                .fileSize(document.getFileSize())
                .mimeType(document.getMimeType())
                .status(document.getStatus())
                .verifiedBy(document.getVerifiedBy())
                .verifiedDate(document.getVerifiedDate())
                .verificationNotes(document.getVerificationNotes())
                .isMandatory(document.getIsMandatory())
                .expiryDate(document.getExpiryDate())
                .uploadedBy(document.getUploadedBy())
                .createdAt(document.getCreatedAt())
                .build();
    }

    private EquipmentAssignmentDTO toEquipmentAssignmentDTO(EquipmentAssignment equipment) {
        return EquipmentAssignmentDTO.builder()
                .id(equipment.getId())
                .tenantId(equipment.getTenantId())
                .userId(equipment.getUserId())
                .onboardingId(equipment.getOnboarding() != null ? equipment.getOnboarding().getId() : null)
                .equipmentType(equipment.getEquipmentType())
                .equipmentName(equipment.getEquipmentName())
                .serialNumber(equipment.getSerialNumber())
                .assetTag(equipment.getAssetTag())
                .assignedDate(equipment.getAssignedDate())
                .returnDate(equipment.getReturnDate())
                .expectedReturnDate(equipment.getExpectedReturnDate())
                .status(equipment.getStatus())
                .conditionAtAssignment(equipment.getConditionAtAssignment())
                .conditionAtReturn(equipment.getConditionAtReturn())
                .notes(equipment.getNotes())
                .assignedBy(equipment.getAssignedBy())
                .build();
    }
}
