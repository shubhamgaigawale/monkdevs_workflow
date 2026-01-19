package com.crm.hrservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.hrservice.dto.salary.request.*;
import com.crm.hrservice.dto.salary.response.*;
import com.crm.hrservice.service.SalaryService;
import com.crm.hrservice.service.SalarySlipPdfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Salary Controller - handles salary management operations
 */
@Slf4j
@RestController
@RequestMapping("/salary")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Salary Management", description = "Salary structures, employee salaries, and salary slips")
public class SalaryController {

    private final SalaryService salaryService;
    private final SalarySlipPdfService salarySlipPdfService;

    // ==================== Salary Components ====================

    @GetMapping("/components")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Get all salary components", description = "Get all salary components (HR only)")
    public ResponseEntity<ApiResponse<List<SalaryComponentDTO>>> getAllComponents(
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get all salary components for tenant: {}", tenantId);

        List<SalaryComponentDTO> components = salaryService.getAllSalaryComponents(tenantId);
        return ResponseEntity.ok(ApiResponse.success(components));
    }

    @PostMapping("/components")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Create salary component", description = "Create a new salary component (HR only)")
    public ResponseEntity<ApiResponse<SalaryComponentDTO>> createComponent(
            @Valid @RequestBody SalaryComponentRequest request,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Create salary component: {}", request.getCode());

        SalaryComponentDTO component = salaryService.createSalaryComponent(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Component created successfully", component));
    }

    @PutMapping("/components/{id}")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Update salary component", description = "Update an existing salary component (HR only)")
    public ResponseEntity<ApiResponse<SalaryComponentDTO>> updateComponent(
            @PathVariable UUID id,
            @Valid @RequestBody SalaryComponentRequest request,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Update salary component: {}", id);

        SalaryComponentDTO component = salaryService.updateSalaryComponent(tenantId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Component updated successfully", component));
    }

    @DeleteMapping("/components/{id}")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Delete salary component", description = "Delete a salary component (HR only)")
    public ResponseEntity<ApiResponse<Void>> deleteComponent(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Delete salary component: {}", id);

        salaryService.deleteSalaryComponent(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success("Component deleted successfully", null));
    }

    // ==================== Salary Structures ====================

    @GetMapping("/structures")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Get all salary structures", description = "Get all salary structures (HR only)")
    public ResponseEntity<ApiResponse<List<SalaryService.SalaryStructureDTO>>> getAllStructures(
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get all salary structures for tenant: {}", tenantId);

        List<SalaryService.SalaryStructureDTO> structures = salaryService.getAllSalaryStructures(tenantId);
        return ResponseEntity.ok(ApiResponse.success(structures));
    }

    @GetMapping("/structures/{id}")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Get salary structure", description = "Get salary structure by ID (HR only)")
    public ResponseEntity<ApiResponse<SalaryService.SalaryStructureDTO>> getStructureById(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get salary structure: {}", id);

        SalaryService.SalaryStructureDTO structure = salaryService.getSalaryStructureById(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success(structure));
    }

    @PostMapping("/structures")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Create salary structure", description = "Create a new salary structure (HR only)")
    public ResponseEntity<ApiResponse<SalaryService.SalaryStructureDTO>> createStructure(
            @Valid @RequestBody SalaryStructureRequest request,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Create salary structure: {}", request.getName());

        SalaryService.SalaryStructureDTO structure = salaryService.createSalaryStructure(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Structure created successfully", structure));
    }

    // ==================== Employee Salaries ====================

    @GetMapping("/my-salary")
    @Operation(summary = "Get my salary details", description = "Get current employee's salary details")
    public ResponseEntity<ApiResponse<SalaryService.EmployeeSalaryDTO>> getMySalary(
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get salary details for user: {}", userId);

        SalaryService.EmployeeSalaryDTO salary = salaryService.getMySalaryDetails(tenantId, userId);
        return ResponseEntity.ok(ApiResponse.success(salary));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Assign salary to employee", description = "Assign salary structure to an employee (HR only)")
    public ResponseEntity<ApiResponse<SalaryService.EmployeeSalaryDTO>> assignSalary(
            @Valid @RequestBody EmployeeSalaryRequest request,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Assign salary to user: {}", request.getUserId());

        SalaryService.EmployeeSalaryDTO salary = salaryService.assignSalaryToEmployee(tenantId, request);
        return ResponseEntity.ok(ApiResponse.success("Salary assigned successfully", salary));
    }

    // ==================== Salary Slips ====================

    @GetMapping("/slips")
    @Operation(summary = "Get my salary slips", description = "Get all my salary slips")
    public ResponseEntity<ApiResponse<List<SalarySlipDTO>>> getMySalarySlips(
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get salary slips for user: {}", userId);

        List<SalarySlipDTO> slips = salaryService.getAllMySalarySlips(tenantId, userId);
        return ResponseEntity.ok(ApiResponse.success(slips));
    }

    @GetMapping("/slips/paginated")
    @Operation(summary = "Get my salary slips (paginated)", description = "Get my salary slips with pagination")
    public ResponseEntity<ApiResponse<Page<SalarySlipDTO>>> getMySalarySlipsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get salary slips (paginated) for user: {}, page: {}", userId, page);

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        Page<SalarySlipDTO> slips = salaryService.getMySalarySlips(tenantId, userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(slips));
    }

    @GetMapping("/slips/{id}")
    @Operation(summary = "Get salary slip details", description = "Get salary slip by ID")
    public ResponseEntity<ApiResponse<SalarySlipDTO>> getSalarySlipById(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get salary slip: {}", id);

        SalarySlipDTO slip = salaryService.getSalarySlipById(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success(slip));
    }

    @PostMapping("/slips/generate")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Generate salary slip", description = "Generate salary slip for an employee (HR only)")
    public ResponseEntity<ApiResponse<SalarySlipDTO>> generateSalarySlip(
            @RequestParam UUID userId,
            @RequestParam Integer month,
            @RequestParam Integer year,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Generate salary slip for user: {}, month: {}, year: {}", userId, month, year);

        SalarySlipDTO slip = salaryService.generateSalarySlip(tenantId, userId, month, year);
        return ResponseEntity.ok(ApiResponse.success("Salary slip generated successfully", slip));
    }

    @PostMapping("/slips/{id}/mark-paid")
    @PreAuthorize("hasAuthority('hr:manage')")
    @Operation(summary = "Mark salary slip as paid", description = "Mark salary slip as paid (HR only)")
    public ResponseEntity<ApiResponse<SalarySlipDTO>> markAsPaid(
            @PathVariable UUID id,
            @RequestParam(required = false) String paidDate,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Mark salary slip as paid: {}", id);

        java.time.LocalDate date = paidDate != null ? java.time.LocalDate.parse(paidDate) : java.time.LocalDate.now();
        SalarySlipDTO slip = salaryService.markSalarySlipAsPaid(tenantId, id, date);
        return ResponseEntity.ok(ApiResponse.success("Salary slip marked as paid", slip));
    }

    @GetMapping("/slips/{id}/download")
    @Operation(summary = "Download salary slip", description = "Download salary slip as PDF")
    public ResponseEntity<byte[]> downloadSalarySlip(
            @PathVariable UUID id,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Download salary slip: {}", id);

        // Get salary slip with full details
        SalarySlipDTO slipDTO = salaryService.getSalarySlipById(tenantId, id);

        // Convert DTO to entity for PDF generation
        com.crm.hrservice.entity.SalarySlip salarySlip = salaryService.getSalarySlipEntity(tenantId, id);

        // Generate PDF
        byte[] pdfBytes = salarySlipPdfService.generateSalarySlipPdf(salarySlip);

        String filename = String.format("salary-slip-%s-%d.pdf",
                getMonthName(slipDTO.getMonth()), slipDTO.getYear());

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=" + filename)
                .body(pdfBytes);
    }

    private String getMonthName(Integer month) {
        String[] months = {"", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        return months[month];
    }

    // ==================== Bank Details ====================

    @GetMapping("/bank-details")
    @Operation(summary = "Get my bank details", description = "Get my bank account details")
    public ResponseEntity<ApiResponse<Object>> getMyBankDetails(
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Get bank details for user: {}", userId);

        // TODO: Implement when EmployeeBankDetailsDTO is created
        return ResponseEntity.ok(ApiResponse.success("Bank details retrieved", null));
    }

    @PostMapping("/bank-details")
    @Operation(summary = "Add/Update bank details", description = "Add or update my bank account details")
    public ResponseEntity<ApiResponse<Object>> saveBankDetails(
            @RequestBody Object request, // TODO: Create BankDetailsRequest DTO
            HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        log.info("Save bank details for user: {}", userId);

        // TODO: Implement when service method is created
        return ResponseEntity.ok(ApiResponse.success("Bank details saved successfully", null));
    }
}
