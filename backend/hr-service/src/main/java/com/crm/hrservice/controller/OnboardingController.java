package com.crm.hrservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.hrservice.dto.request.*;
import com.crm.hrservice.dto.response.*;
import com.crm.hrservice.entity.EmployeeDocument;
import com.crm.hrservice.service.OnboardingService;
import com.crm.hrservice.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Onboarding controller
 * Handles employee onboarding workflow, tasks, documents, and equipment
 */
@Slf4j
@RestController
@RequestMapping("/onboarding")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Onboarding", description = "Employee onboarding operations - workflow, tasks, documents, equipment")
public class OnboardingController {

    private final OnboardingService onboardingService;
    private final FileStorageService fileStorageService;

    // ==================== Onboarding Lifecycle Endpoints ====================

    @PostMapping("/start")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Start onboarding", description = "Start onboarding process for a new employee (HR only)")
    public ResponseEntity<ApiResponse<EmployeeOnboardingDTO>> startOnboarding(
            @Valid @RequestBody StartOnboardingRequest request,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Start onboarding request for user: {}", request.getUserId());

        EmployeeOnboardingDTO onboarding = onboardingService.startOnboarding(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Onboarding started successfully", onboarding));
    }

    @GetMapping("/my-progress")
    @Operation(summary = "Get my onboarding progress", description = "Get onboarding progress and tasks for current user")
    public ResponseEntity<ApiResponse<EmployeeOnboardingDTO>> getMyOnboarding(HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get onboarding for user: {}", userId);

        EmployeeOnboardingDTO onboarding = onboardingService.getMyOnboarding(userId, tenantId);
        return ResponseEntity.ok(ApiResponse.success(onboarding));
    }

    @GetMapping("/team")
    @PreAuthorize("hasAuthority('team:manage')")
    @Operation(summary = "Get team onboardings", description = "Get onboarding progress for team members (Manager only)")
    public ResponseEntity<ApiResponse<List<EmployeeOnboardingDTO>>> getTeamOnboardings(HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get team onboardings for manager: {}", userId);

        List<EmployeeOnboardingDTO> onboardings = onboardingService.getTeamOnboardings(userId, tenantId);
        return ResponseEntity.ok(ApiResponse.success(onboardings));
    }

    // ==================== Task Endpoints ====================

    @GetMapping("/tasks")
    @Operation(summary = "Get my onboarding tasks", description = "Get all onboarding tasks for current user")
    public ResponseEntity<ApiResponse<List<EmployeeOnboardingTaskDTO>>> getMyTasks(HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get tasks for user: {}", userId);

        List<EmployeeOnboardingTaskDTO> tasks = onboardingService.getMyTasks(userId, tenantId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @PostMapping("/tasks/{taskId}/complete")
    @Operation(summary = "Complete task", description = "Mark an onboarding task as completed")
    public ResponseEntity<ApiResponse<EmployeeOnboardingTaskDTO>> completeTask(
            @PathVariable UUID taskId,
            @RequestBody CompleteTaskRequest request,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Complete task: {} by user: {}", taskId, userId);

        EmployeeOnboardingTaskDTO task = onboardingService.completeTask(taskId, userId, tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Task completed successfully", task));
    }

    // ==================== Document Endpoints ====================

    @PostMapping("/documents/upload-file")
    @Operation(summary = "Upload document file", description = "Upload a document file with multipart/form-data")
    public ResponseEntity<ApiResponse<EmployeeDocumentDTO>> uploadDocumentFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "isMandatory", defaultValue = "false") boolean isMandatory,
            @RequestParam(value = "expiryDate", required = false) String expiryDate,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.info("Upload document file for user: {}, type: {}, filename: {}",
                userId, documentType, file.getOriginalFilename());

        // Store file
        String filePath = fileStorageService.storeFile(file, userId, "documents");

        // Create document record
        DocumentUploadRequest request = new DocumentUploadRequest();
        request.setDocumentType(documentType);
        request.setDocumentName(file.getOriginalFilename());
        request.setFilePath(filePath);
        request.setFileSize(file.getSize());
        request.setMimeType(file.getContentType());
        request.setIsMandatory(isMandatory);
        if (expiryDate != null && !expiryDate.isEmpty()) {
            request.setExpiryDate(LocalDate.parse(expiryDate));
        }

        EmployeeDocumentDTO document = onboardingService.uploadDocument(userId, tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Document file uploaded successfully", document));
    }

    @PostMapping("/documents/upload")
    @Operation(summary = "Upload document", description = "Upload a document for onboarding")
    public ResponseEntity<ApiResponse<EmployeeDocumentDTO>> uploadDocument(
            @Valid @RequestBody DocumentUploadRequest request,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Upload document for user: {}, type: {}", userId, request.getDocumentType());

        EmployeeDocumentDTO document = onboardingService.uploadDocument(userId, tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully", document));
    }

    @GetMapping("/documents")
    @Operation(summary = "Get documents", description = "Get documents - employee gets own, HR/Admin gets all with optional status filter")
    public ResponseEntity<ApiResponse<List<EmployeeDocumentDTO>>> getDocuments(
            @RequestParam(required = false) String status,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        // Check if user has hr:manage permission
        boolean isHRAdmin = httpRequest.isUserInRole("hr:manage");

        if (isHRAdmin && status != null) {
            // HR Admin with status filter - get all documents with status
            log.info("Get all documents for tenant: {} with status: {}", tenantId, status);
            EmployeeDocument.DocumentStatus documentStatus;
            try {
                documentStatus = EmployeeDocument.DocumentStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                documentStatus = null;
            }
            List<EmployeeDocumentDTO> documents = onboardingService.getAllDocuments(tenantId, documentStatus);
            return ResponseEntity.ok(ApiResponse.success(documents));
        } else if (isHRAdmin) {
            // HR Admin without filter - get all documents
            log.info("Get all documents for tenant: {}", tenantId);
            List<EmployeeDocumentDTO> documents = onboardingService.getAllDocuments(tenantId, null);
            return ResponseEntity.ok(ApiResponse.success(documents));
        } else {
            // Regular employee - get own documents
            log.info("Get documents for user: {}", userId);
            List<EmployeeDocumentDTO> documents = onboardingService.getMyDocuments(userId, tenantId);
            return ResponseEntity.ok(ApiResponse.success(documents));
        }
    }

    @PostMapping("/documents/{documentId}/verify")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Verify document", description = "Verify or reject an uploaded document (HR only)")
    public ResponseEntity<ApiResponse<EmployeeDocumentDTO>> verifyDocument(
            @PathVariable UUID documentId,
            @Valid @RequestBody DocumentVerificationRequest request,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Verify document: {} by HR: {}", documentId, userId);

        EmployeeDocumentDTO document = onboardingService.verifyDocument(documentId, userId, tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Document verification completed", document));
    }

    // ==================== Equipment Endpoints ====================

    @PostMapping("/equipment/assign")
    @PreAuthorize("hasAuthority('hr:manage') or hasAuthority('it:manage')")
    @Operation(summary = "Assign equipment", description = "Assign equipment to an employee (HR/IT only)")
    public ResponseEntity<ApiResponse<EquipmentAssignmentDTO>> assignEquipment(
            @Valid @RequestBody EquipmentAssignmentRequest request,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Assign equipment to user: {} by: {}", request.getUserId(), userId);

        EquipmentAssignmentDTO equipment = onboardingService.assignEquipment(tenantId, userId, request);
        return ResponseEntity.ok(ApiResponse.success("Equipment assigned successfully", equipment));
    }

    @GetMapping("/equipment")
    @Operation(summary = "Get my equipment", description = "Get all equipment assigned to current user")
    public ResponseEntity<ApiResponse<List<EquipmentAssignmentDTO>>> getMyEquipment(HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get equipment for user: {}", userId);

        List<EquipmentAssignmentDTO> equipment = onboardingService.getMyEquipment(userId, tenantId);
        return ResponseEntity.ok(ApiResponse.success(equipment));
    }
}
