package com.crm.hrservice.service;

import com.crm.common.exception.BadRequestException;
import com.crm.common.exception.ResourceNotFoundException;
import com.crm.hrservice.dto.salary.request.EmployeeSalaryRequest;
import com.crm.hrservice.dto.salary.request.SalaryStructureRequest;
import com.crm.hrservice.dto.salary.response.SalaryComponentDTO;
import com.crm.hrservice.dto.salary.response.SalarySlipDTO;
import com.crm.hrservice.entity.*;
import com.crm.hrservice.repository.salary.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Salary management service
 * Handles salary structures, employee salaries, salary calculations, and salary slip generation
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SalaryService {

    private final SalaryComponentRepository salaryComponentRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final EmployeeSalaryRepository employeeSalaryRepository;
    private final SalarySlipRepository salarySlipRepository;
    private final EmployeeBankDetailsRepository employeeBankDetailsRepository;

    // ==================== Salary Component Management ====================

    /**
     * Get all salary components for tenant
     */
    public List<SalaryComponentDTO> getAllSalaryComponents(UUID tenantId) {
        log.info("Fetching all salary components for tenant: {}", tenantId);
        List<SalaryComponent> components = salaryComponentRepository.findByTenantIdOrderByDisplayOrder(tenantId);
        return components.stream()
                .map(this::toSalaryComponentDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a new salary component
     */
    @Transactional
    public SalaryComponentDTO createSalaryComponent(UUID tenantId, com.crm.hrservice.dto.salary.request.SalaryComponentRequest request) {
        log.info("Creating salary component: {} for tenant: {}", request.getCode(), tenantId);

        // Check if code already exists
        if (salaryComponentRepository.existsByTenantIdAndCode(tenantId, request.getCode())) {
            throw new BadRequestException("Salary component with code '" + request.getCode() + "' already exists");
        }

        SalaryComponent component = SalaryComponent.builder()
                .name(request.getName())
                .code(request.getCode())
                .componentType(request.getComponentType())
                .calculationType(request.getCalculationType())
                .percentage(request.getPercentage())
                .isTaxable(request.getIsTaxable())
                .isFixed(request.getIsFixed())
                .displayOrder(request.getDisplayOrder())
                .status(SalaryComponent.Status.ACTIVE)
                .build();
        component.setTenantId(tenantId);

        component = salaryComponentRepository.save(component);
        log.info("Salary component created successfully: {}", component.getId());

        return toSalaryComponentDTO(component);
    }

    /**
     * Update an existing salary component
     */
    @Transactional
    public SalaryComponentDTO updateSalaryComponent(UUID tenantId, UUID componentId, com.crm.hrservice.dto.salary.request.SalaryComponentRequest request) {
        log.info("Updating salary component: {}", componentId);

        SalaryComponent component = salaryComponentRepository.findById(componentId)
                .orElseThrow(() -> new ResourceNotFoundException("Salary component not found"));

        if (!component.getTenantId().equals(tenantId)) {
            throw new BadRequestException("Salary component not found for this tenant");
        }

        // Check if code changed and if new code already exists
        if (!component.getCode().equals(request.getCode())) {
            if (salaryComponentRepository.existsByTenantIdAndCode(tenantId, request.getCode())) {
                throw new BadRequestException("Salary component with code '" + request.getCode() + "' already exists");
            }
        }

        component.setName(request.getName());
        component.setCode(request.getCode());
        component.setComponentType(request.getComponentType());
        component.setCalculationType(request.getCalculationType());
        component.setPercentage(request.getPercentage());
        component.setIsTaxable(request.getIsTaxable());
        component.setIsFixed(request.getIsFixed());
        component.setDisplayOrder(request.getDisplayOrder());

        component = salaryComponentRepository.save(component);
        log.info("Salary component updated successfully: {}", component.getId());

        return toSalaryComponentDTO(component);
    }

    /**
     * Delete a salary component
     */
    @Transactional
    public void deleteSalaryComponent(UUID tenantId, UUID componentId) {
        log.info("Deleting salary component: {}", componentId);

        SalaryComponent component = salaryComponentRepository.findById(componentId)
                .orElseThrow(() -> new ResourceNotFoundException("Salary component not found"));

        if (!component.getTenantId().equals(tenantId)) {
            throw new BadRequestException("Salary component not found for this tenant");
        }

        // Check if component is used in any structure
        // TODO: Add validation to prevent deletion if component is in use

        salaryComponentRepository.delete(component);
        log.info("Salary component deleted successfully: {}", componentId);
    }

    private SalaryComponentDTO toSalaryComponentDTO(SalaryComponent component) {
        return SalaryComponentDTO.builder()
                .id(component.getId())
                .tenantId(component.getTenantId())
                .name(component.getName())
                .code(component.getCode())
                .componentType(SalaryComponent.ComponentType.valueOf(component.getComponentType().name()))
                .calculationType(component.getCalculationType() != null ? SalaryComponent.CalculationType.valueOf(component.getCalculationType().name()) : null)
                .percentage(component.getPercentage())
                .isTaxable(component.getIsTaxable())
                .isFixed(component.getIsFixed())
                .displayOrder(component.getDisplayOrder())
                .status(SalaryComponent.Status.valueOf(component.getStatus().name()))
                .build();
    }

    // ==================== Salary Structure Management ====================

    /**
     * Create a new salary structure with components
     * @param tenantId The tenant ID
     * @param request The salary structure request containing name, description, and components
     * @return DTO containing created salary structure details
     */
    @Transactional
    public SalaryStructureDTO createSalaryStructure(UUID tenantId, SalaryStructureRequest request) {
        log.info("Creating salary structure: {} for tenant: {}", request.getName(), tenantId);

        // Validate that all component IDs exist
        List<UUID> componentIds = request.getComponents().stream()
                .map(c -> UUID.fromString(c.getComponentId()))
                .collect(Collectors.toList());

        List<SalaryComponent> components = salaryComponentRepository.findAllById(componentIds);
        if (components.size() != componentIds.size()) {
            throw new BadRequestException("One or more salary components not found");
        }

        // Validate percentages sum to 100 for percentage-based components
        BigDecimal totalPercentage = request.getComponents().stream()
                .filter(c -> c.getPercentage() != null)
                .map(SalaryStructureRequest.StructureComponentRequest::getPercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPercentage.compareTo(BigDecimal.ZERO) > 0 &&
            totalPercentage.compareTo(new BigDecimal("100")) != 0) {
            log.warn("Total percentage is {} (expected 100% for percentage-based components)", totalPercentage);
        }

        // Create salary structure
        SalaryStructure salaryStructure = SalaryStructure.builder()
                .name(request.getName())
                .description(request.getDescription())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .status(SalaryStructure.Status.ACTIVE)
                .build();
        salaryStructure.setTenantId(tenantId);

        // Create structure components
        List<SalaryStructureComponent> structureComponents = new ArrayList<>();
        Map<UUID, SalaryComponent> componentMap = components.stream()
                .collect(Collectors.toMap(c -> c.getId(), c -> c));

        for (SalaryStructureRequest.StructureComponentRequest compReq : request.getComponents()) {
            UUID componentId = UUID.fromString(compReq.getComponentId());
            SalaryComponent component = componentMap.get(componentId);

            SalaryStructureComponent structureComponent = SalaryStructureComponent.builder()
                    .salaryStructure(salaryStructure)
                    .component(component)
                    .percentage(compReq.getPercentage())
                    .fixedAmount(compReq.getFixedAmount())
                    .build();
            structureComponents.add(structureComponent);
        }

        salaryStructure.setComponents(structureComponents);
        salaryStructure = salaryStructureRepository.save(salaryStructure);

        log.info("Salary structure created successfully: {}", salaryStructure.getId());
        return toSalaryStructureDTO(salaryStructure);
    }

    /**
     * Get all active salary structures for tenant
     */
    public List<SalaryStructureDTO> getAllSalaryStructures(UUID tenantId) {
        log.info("Fetching all active salary structures for tenant: {}", tenantId);
        List<SalaryStructure> structures = salaryStructureRepository.findByTenantIdAndStatus(
                tenantId, SalaryStructure.Status.ACTIVE);
        return structures.stream()
                .map(this::toSalaryStructureDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get salary structure by ID
     */
    public SalaryStructureDTO getSalaryStructureById(UUID tenantId, UUID structureId) {
        log.info("Fetching salary structure: {} for tenant: {}", structureId, tenantId);
        SalaryStructure structure = salaryStructureRepository.findByTenantIdAndId(tenantId, structureId)
                .orElseThrow(() -> new ResourceNotFoundException("Salary structure not found"));
        return toSalaryStructureDTO(structure);
    }

    // ==================== Employee Salary Management ====================

    /**
     * Assign salary structure to employee and calculate components
     * @param tenantId The tenant ID
     * @param request The employee salary request containing userId, structureId, and CTC
     * @return DTO containing assigned salary details with calculated components
     */
    @Transactional
    public EmployeeSalaryDTO assignSalaryToEmployee(UUID tenantId, EmployeeSalaryRequest request) {
        log.info("Assigning salary to employee: {} with CTC: {}", request.getUserId(), request.getCtc());

        // Validate salary structure exists
        SalaryStructure salaryStructure = salaryStructureRepository.findByTenantIdAndId(
                tenantId, request.getSalaryStructureId())
                .orElseThrow(() -> new ResourceNotFoundException("Salary structure not found"));

        // Check if employee already has an active salary
        Optional<EmployeeSalary> existingSalary = employeeSalaryRepository
                .findByTenantIdAndUserIdAndStatus(tenantId, request.getUserId(), EmployeeSalary.Status.ACTIVE);

        if (existingSalary.isPresent()) {
            // Mark existing salary as inactive
            EmployeeSalary existing = existingSalary.get();
            existing.setStatus(EmployeeSalary.Status.INACTIVE);
            existing.setEffectiveTo(request.getEffectiveFrom().minusDays(1));
            employeeSalaryRepository.save(existing);
            log.info("Marked previous salary as inactive for employee: {}", request.getUserId());
        }

        // Create new employee salary
        EmployeeSalary employeeSalary = EmployeeSalary.builder()
                .userId(request.getUserId())
                .salaryStructure(salaryStructure)
                .ctc(request.getCtc())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .status(EmployeeSalary.Status.ACTIVE)
                .build();
        employeeSalary.setTenantId(tenantId);

        // Calculate and create employee salary components
        List<EmployeeSalaryComponent> employeeComponents = calculateSalaryBreakdown(
                employeeSalary, salaryStructure, request.getCtc());
        employeeSalary.setComponents(employeeComponents);

        employeeSalary = employeeSalaryRepository.save(employeeSalary);
        log.info("Salary assigned successfully to employee: {}", request.getUserId());

        return toEmployeeSalaryDTO(employeeSalary);
    }

    /**
     * Calculate salary component breakdown based on CTC and structure
     * @param employeeSalary The employee salary entity
     * @param salaryStructure The salary structure with component definitions
     * @param ctc The total CTC amount
     * @return List of calculated employee salary components
     */
    @Transactional
    public List<EmployeeSalaryComponent> calculateSalaryBreakdown(
            EmployeeSalary employeeSalary,
            SalaryStructure salaryStructure,
            BigDecimal ctc) {

        log.info("Calculating salary breakdown for CTC: {}", ctc);
        List<EmployeeSalaryComponent> components = new ArrayList<>();

        // Monthly CTC
        BigDecimal monthlyCTC = ctc.divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);

        for (SalaryStructureComponent structureComponent : salaryStructure.getComponents()) {
            BigDecimal componentAmount;

            // Calculate based on type
            if (structureComponent.getFixedAmount() != null) {
                // Fixed amount
                componentAmount = structureComponent.getFixedAmount();
            } else if (structureComponent.getPercentage() != null) {
                // Percentage of CTC (annual)
                BigDecimal yearlyAmount = ctc
                        .multiply(structureComponent.getPercentage())
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

                // Convert to monthly
                componentAmount = yearlyAmount.divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);
            } else {
                log.warn("Component {} has no fixed amount or percentage, setting to 0",
                        structureComponent.getComponent().getName());
                componentAmount = BigDecimal.ZERO;
            }

            EmployeeSalaryComponent empComponent = EmployeeSalaryComponent.builder()
                    .employeeSalary(employeeSalary)
                    .component(structureComponent.getComponent())
                    .amount(componentAmount)
                    .build();

            components.add(empComponent);
            log.debug("Component {} calculated: {}",
                    structureComponent.getComponent().getName(), componentAmount);
        }

        return components;
    }

    /**
     * Get current employee salary details
     * @param tenantId The tenant ID
     * @param userId The user ID
     * @return DTO containing current salary details with component breakdown
     */
    public EmployeeSalaryDTO getMySalaryDetails(UUID tenantId, UUID userId) {
        log.info("Fetching salary details for user: {}", userId);

        // Get active salary as of today
        EmployeeSalary employeeSalary = employeeSalaryRepository
                .findActiveByUserIdAndDate(tenantId, userId, LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No active salary found for user: " + userId));

        return toEmployeeSalaryDTO(employeeSalary);
    }

    // ==================== Salary Slip Management ====================

    /**
     * Generate monthly salary slip for an employee
     * @param tenantId The tenant ID
     * @param userId The user ID
     * @param month The month (1-12)
     * @param year The year
     * @return DTO containing generated salary slip with earnings and deductions
     */
    @Transactional
    public SalarySlipDTO generateSalarySlip(UUID tenantId, UUID userId, Integer month, Integer year) {
        log.info("Generating salary slip for user: {} for month: {}/{}", userId, month, year);

        // Validate month and year
        if (month < 1 || month > 12) {
            throw new BadRequestException("Invalid month. Must be between 1 and 12");
        }
        if (year < 2000 || year > 2100) {
            throw new BadRequestException("Invalid year");
        }

        // Check if salary slip already exists
        if (salarySlipRepository.existsByTenantIdAndUserIdAndMonthAndYear(tenantId, userId, month, year)) {
            throw new BadRequestException(
                    String.format("Salary slip already exists for %d/%d", month, year));
        }

        // Get employee salary for the month
        LocalDate salaryDate = LocalDate.of(year, month, 1);
        EmployeeSalary employeeSalary = employeeSalaryRepository
                .findActiveByUserIdAndDate(tenantId, userId, salaryDate)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No active salary found for user: " + userId + " for date: " + salaryDate));

        // Calculate working days (for now, assuming full month)
        int daysInMonth = salaryDate.lengthOfMonth();
        BigDecimal paidDays = new BigDecimal(daysInMonth);
        BigDecimal lopDays = BigDecimal.ZERO;

        // Calculate gross salary and deductions
        BigDecimal grossSalary = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;

        List<SalarySlipComponent> slipComponents = new ArrayList<>();

        for (EmployeeSalaryComponent empComponent : employeeSalary.getComponents()) {
            SalaryComponent component = empComponent.getComponent();
            BigDecimal amount = empComponent.getAmount();

            // If there are LOP days, prorate the amount
            if (lopDays.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal proratedAmount = amount
                        .multiply(paidDays)
                        .divide(new BigDecimal(daysInMonth), 2, RoundingMode.HALF_UP);
                amount = proratedAmount;
            }

            if (component.getComponentType() == SalaryComponent.ComponentType.EARNING) {
                grossSalary = grossSalary.add(amount);
            } else if (component.getComponentType() == SalaryComponent.ComponentType.DEDUCTION) {
                totalDeductions = totalDeductions.add(amount);
            }

            slipComponents.add(SalarySlipComponent.builder()
                    .component(component)
                    .componentName(component.getName())
                    .componentType(component.getComponentType().name())
                    .amount(amount)
                    .build());
        }

        BigDecimal netSalary = grossSalary.subtract(totalDeductions);

        // Create salary slip
        SalarySlip salarySlip = SalarySlip.builder()
                .userId(userId)
                .month(month)
                .year(year)
                .employeeSalary(employeeSalary)
                .grossSalary(grossSalary)
                .totalDeductions(totalDeductions)
                .netSalary(netSalary)
                .paidDays(paidDays)
                .lopDays(lopDays)
                .status(SalarySlip.Status.GENERATED)
                .generatedDate(LocalDateTime.now())
                .build();
        salarySlip.setTenantId(tenantId);
        salarySlip.setComponents(slipComponents);

        // Set slip reference in components (must be before save)
        final SalarySlip finalSlip = salarySlip;
        slipComponents.forEach(sc -> sc.setSalarySlip(finalSlip));

        salarySlip = salarySlipRepository.save(salarySlip);
        log.info("Salary slip generated successfully: {}", salarySlip.getId());

        return toSalarySlipDTO(salarySlip);
    }

    /**
     * Get employee's salary slips
     * @param tenantId The tenant ID
     * @param userId The user ID
     * @param pageable Pagination parameters
     * @return Page of salary slip DTOs
     */
    public Page<SalarySlipDTO> getMySalarySlips(UUID tenantId, UUID userId, Pageable pageable) {
        log.info("Fetching salary slips for user: {}", userId);
        Page<SalarySlip> slips = salarySlipRepository.findByTenantIdAndUserId(tenantId, userId, pageable);
        return slips.map(this::toSalarySlipDTO);
    }

    /**
     * Get all salary slips for an employee
     */
    public List<SalarySlipDTO> getAllMySalarySlips(UUID tenantId, UUID userId) {
        log.info("Fetching all salary slips for user: {}", userId);
        List<SalarySlip> slips = salarySlipRepository
                .findByTenantIdAndUserIdOrderByYearDescMonthDesc(tenantId, userId);
        return slips.stream()
                .map(this::toSalarySlipDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get salary slip by ID
     */
    public SalarySlipDTO getSalarySlipById(UUID tenantId, UUID slipId) {
        log.info("Fetching salary slip: {}", slipId);
        SalarySlip slip = salarySlipRepository.findById(slipId)
                .orElseThrow(() -> new ResourceNotFoundException("Salary slip not found"));

        if (!slip.getTenantId().equals(tenantId)) {
            throw new BadRequestException("Salary slip does not belong to this tenant");
        }

        return toSalarySlipDTO(slip);
    }

    /**
     * Get salary slip entity for PDF generation
     */
    public SalarySlip getSalarySlipEntity(UUID tenantId, UUID slipId) {
        log.info("Fetching salary slip entity for PDF: {}", slipId);
        SalarySlip slip = salarySlipRepository.findById(slipId)
                .orElseThrow(() -> new ResourceNotFoundException("Salary slip not found"));

        if (!slip.getTenantId().equals(tenantId)) {
            throw new BadRequestException("Salary slip does not belong to this tenant");
        }

        // Force load components to avoid lazy loading issues
        slip.getComponents().size();

        return slip;
    }

    /**
     * Mark salary slip as paid
     */
    @Transactional
    public SalarySlipDTO markSalarySlipAsPaid(UUID tenantId, UUID slipId, LocalDate paidDate) {
        log.info("Marking salary slip {} as paid", slipId);

        SalarySlip slip = salarySlipRepository.findById(slipId)
                .orElseThrow(() -> new ResourceNotFoundException("Salary slip not found"));

        if (!slip.getTenantId().equals(tenantId)) {
            throw new BadRequestException("Salary slip does not belong to this tenant");
        }

        if (slip.getStatus() == SalarySlip.Status.PAID) {
            throw new BadRequestException("Salary slip is already marked as paid");
        }

        if (slip.getStatus() == SalarySlip.Status.CANCELLED) {
            throw new BadRequestException("Cannot mark cancelled salary slip as paid");
        }

        slip.setStatus(SalarySlip.Status.PAID);
        slip.setPaidDate(paidDate != null ? paidDate : LocalDate.now());
        slip = salarySlipRepository.save(slip);

        log.info("Salary slip marked as paid: {}", slipId);
        return toSalarySlipDTO(slip);
    }

    // ==================== DTO Converters ====================

    /**
     * Convert SalaryStructure entity to DTO
     */
    private SalaryStructureDTO toSalaryStructureDTO(SalaryStructure structure) {
        List<SalaryStructureDTO.ComponentDetail> componentDetails = structure.getComponents().stream()
                .map(sc -> SalaryStructureDTO.ComponentDetail.builder()
                        .componentId(sc.getComponent().getId())
                        .componentName(sc.getComponent().getName())
                        .componentCode(sc.getComponent().getCode())
                        .componentType(sc.getComponent().getComponentType())
                        .percentage(sc.getPercentage())
                        .fixedAmount(sc.getFixedAmount())
                        .build())
                .collect(Collectors.toList());

        return SalaryStructureDTO.builder()
                .id(structure.getId())
                .tenantId(structure.getTenantId())
                .name(structure.getName())
                .description(structure.getDescription())
                .effectiveFrom(structure.getEffectiveFrom())
                .effectiveTo(structure.getEffectiveTo())
                .status(structure.getStatus())
                .components(componentDetails)
                .build();
    }

    /**
     * Convert EmployeeSalary entity to DTO
     */
    private EmployeeSalaryDTO toEmployeeSalaryDTO(EmployeeSalary employeeSalary) {
        List<EmployeeSalaryDTO.ComponentAmount> componentAmounts = employeeSalary.getComponents().stream()
                .map(c -> EmployeeSalaryDTO.ComponentAmount.builder()
                        .componentId(c.getComponent().getId())
                        .componentName(c.getComponent().getName())
                        .componentCode(c.getComponent().getCode())
                        .componentType(c.getComponent().getComponentType())
                        .amount(c.getAmount())
                        .build())
                .collect(Collectors.toList());

        // Calculate totals
        BigDecimal totalEarnings = employeeSalary.getComponents().stream()
                .filter(c -> c.getComponent().getComponentType() == SalaryComponent.ComponentType.EARNING)
                .map(EmployeeSalaryComponent::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDeductions = employeeSalary.getComponents().stream()
                .filter(c -> c.getComponent().getComponentType() == SalaryComponent.ComponentType.DEDUCTION)
                .map(EmployeeSalaryComponent::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return EmployeeSalaryDTO.builder()
                .id(employeeSalary.getId())
                .tenantId(employeeSalary.getTenantId())
                .userId(employeeSalary.getUserId())
                .salaryStructureId(employeeSalary.getSalaryStructure().getId())
                .salaryStructureName(employeeSalary.getSalaryStructure().getName())
                .ctc(employeeSalary.getCtc())
                .monthlyGross(totalEarnings)
                .monthlyDeductions(totalDeductions)
                .monthlyNetSalary(totalEarnings.subtract(totalDeductions))
                .effectiveFrom(employeeSalary.getEffectiveFrom())
                .effectiveTo(employeeSalary.getEffectiveTo())
                .status(employeeSalary.getStatus())
                .components(componentAmounts)
                .build();
    }

    /**
     * Convert SalarySlip entity to DTO
     */
    private SalarySlipDTO toSalarySlipDTO(SalarySlip slip) {
        // Separate earnings and deductions
        List<SalarySlipDTO.ComponentBreakdown> earnings = slip.getComponents().stream()
                .filter(c -> c.getComponentType().equals("EARNING"))
                .map(c -> SalarySlipDTO.ComponentBreakdown.builder()
                        .name(c.getComponentName())
                        .amount(c.getAmount())
                        .build())
                .collect(Collectors.toList());

        List<SalarySlipDTO.ComponentBreakdown> deductions = slip.getComponents().stream()
                .filter(c -> c.getComponentType().equals("DEDUCTION"))
                .map(c -> SalarySlipDTO.ComponentBreakdown.builder()
                        .name(c.getComponentName())
                        .amount(c.getAmount())
                        .build())
                .collect(Collectors.toList());

        return SalarySlipDTO.builder()
                .id(slip.getId())
                .tenantId(slip.getTenantId())
                .userId(slip.getUserId())
                .month(slip.getMonth())
                .year(slip.getYear())
                .grossSalary(slip.getGrossSalary())
                .totalDeductions(slip.getTotalDeductions())
                .netSalary(slip.getNetSalary())
                .paidDays(slip.getPaidDays())
                .lopDays(slip.getLopDays())
                .status(slip.getStatus())
                .generatedDate(slip.getGeneratedDate())
                .paidDate(slip.getPaidDate())
                .filePath(slip.getFilePath())
                .notes(slip.getNotes())
                .earnings(earnings)
                .deductions(deductions)
                .build();
    }

    // ==================== Additional DTOs ====================

    /**
     * DTO for Salary Structure response
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SalaryStructureDTO {
        private UUID id;
        private UUID tenantId;
        private String name;
        private String description;
        private LocalDate effectiveFrom;
        private LocalDate effectiveTo;
        private SalaryStructure.Status status;
        private List<ComponentDetail> components;

        @lombok.Data
        @lombok.Builder
        @lombok.NoArgsConstructor
        @lombok.AllArgsConstructor
        public static class ComponentDetail {
            private UUID componentId;
            private String componentName;
            private String componentCode;
            private SalaryComponent.ComponentType componentType;
            private BigDecimal percentage;
            private BigDecimal fixedAmount;
        }
    }

    /**
     * DTO for Employee Salary response
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class EmployeeSalaryDTO {
        private UUID id;
        private UUID tenantId;
        private UUID userId;
        private UUID salaryStructureId;
        private String salaryStructureName;
        private BigDecimal ctc;
        private BigDecimal monthlyGross;
        private BigDecimal monthlyDeductions;
        private BigDecimal monthlyNetSalary;
        private LocalDate effectiveFrom;
        private LocalDate effectiveTo;
        private EmployeeSalary.Status status;
        private List<ComponentAmount> components;

        @lombok.Data
        @lombok.Builder
        @lombok.NoArgsConstructor
        @lombok.AllArgsConstructor
        public static class ComponentAmount {
            private UUID componentId;
            private String componentName;
            private String componentCode;
            private SalaryComponent.ComponentType componentType;
            private BigDecimal amount;
        }
    }
}
