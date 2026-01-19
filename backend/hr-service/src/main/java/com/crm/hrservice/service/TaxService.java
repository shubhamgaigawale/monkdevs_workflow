package com.crm.hrservice.service;

import com.crm.hrservice.dto.tax.*;
import com.crm.hrservice.entity.*;
import com.crm.hrservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for Tax Declaration and Calculation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TaxService {

    private final EmployeeTaxDeclarationRepository declarationRepository;
    private final TaxDeclarationItemRepository itemRepository;
    private final HraDeclarationRepository hraRepository;
    private final TaxCalculationRepository calculationRepository;
    private final TaxRegimeRepository regimeRepository;
    private final TaxSlabRepository slabRepository;

    // Tax calculation constants
    private static final BigDecimal SECTION_80C_MAX = new BigDecimal("150000"); // 1.5 lakh max
    private static final BigDecimal STANDARD_DEDUCTION = new BigDecimal("50000"); // Standard deduction
    private static final BigDecimal CESS_RATE = new BigDecimal("0.04"); // 4% cess
    private static final BigDecimal HRA_METRO_RATE = new BigDecimal("0.50"); // 50% for metro
    private static final BigDecimal HRA_NON_METRO_RATE = new BigDecimal("0.40"); // 40% for non-metro

    /**
     * Create a new tax declaration for an employee
     */
    @Transactional
    public TaxDeclarationDTO createDeclaration(UUID tenantId, UUID userId, CreateDeclarationRequest request) {
        log.info("Creating tax declaration for user: {} in FY: {}", userId, request.getFinancialYear());

        // Check if declaration already exists
        var existing = declarationRepository.findByTenantIdAndUserIdAndFinancialYear(
                tenantId, userId, request.getFinancialYear());

        if (existing.isPresent()) {
            throw new RuntimeException("Tax declaration already exists for this financial year");
        }

        EmployeeTaxDeclaration declaration = EmployeeTaxDeclaration.builder()
                .userId(userId)
                .financialYear(request.getFinancialYear())
                .regimeType(request.getRegimeType())
                .totalDeclaredAmount(BigDecimal.ZERO)
                .status(EmployeeTaxDeclaration.Status.DRAFT)
                .build();

        declaration.setTenantId(tenantId);
        declaration = declarationRepository.save(declaration);
        return mapToDTO(declaration);
    }

    /**
     * Get current financial year declaration for user
     */
    public TaxDeclarationDTO getCurrentDeclaration(UUID tenantId, UUID userId, String financialYear) {
        EmployeeTaxDeclaration declaration = declarationRepository
                .findByTenantIdAndUserIdAndFinancialYear(tenantId, userId, financialYear)
                .orElseThrow(() -> new RuntimeException("Tax declaration not found"));

        return mapToDTO(declaration);
    }

    /**
     * Add a declaration item (investment/deduction)
     */
    @Transactional
    public TaxDeclarationItemDTO addDeclarationItem(UUID tenantId, UUID declarationId, AddDeclarationItemRequest request) {
        log.info("Adding declaration item to declaration: {}", declarationId);

        EmployeeTaxDeclaration declaration = declarationRepository.findById(declarationId)
                .orElseThrow(() -> new RuntimeException("Declaration not found"));

        if (!declaration.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied");
        }

        if (declaration.getStatus() != EmployeeTaxDeclaration.Status.DRAFT) {
            throw new RuntimeException("Cannot modify submitted declaration");
        }

        TaxDeclarationItem item = TaxDeclarationItem.builder()
                .declaration(declaration)
                .section(request.getSection())
                .subSection(request.getSubSection())
                .description(request.getDescription())
                .declaredAmount(request.getDeclaredAmount())
                .proofFilePath(request.getProofFilePath())
                .verificationStatus(TaxDeclarationItem.VerificationStatus.PENDING)
                .build();

        item = itemRepository.save(item);

        // Update total declared amount
        updateTotalDeclaredAmount(declaration);

        return mapToItemDTO(item);
    }

    /**
     * Update HRA declaration
     */
    @Transactional
    public HraDeclarationDTO updateHraDeclaration(UUID tenantId, UUID declarationId, UpdateHraRequest request) {
        log.info("Updating HRA declaration for declaration: {}", declarationId);

        EmployeeTaxDeclaration declaration = declarationRepository.findById(declarationId)
                .orElseThrow(() -> new RuntimeException("Declaration not found"));

        if (!declaration.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied");
        }

        // Calculate HRA exemption
        BigDecimal hraExemption = calculateHraExemption(
                request.getRentPaidMonthly(),
                request.getMetroCity(),
                declaration.getUserId(),
                declaration.getFinancialYear()
        );

        HraDeclaration hraDeclaration = hraRepository
                .findByTenantIdAndDeclarationId(tenantId, declarationId)
                .orElseGet(() -> {
                    HraDeclaration newHra = HraDeclaration.builder()
                            .declaration(declaration)
                            .build();
                    newHra.setTenantId(tenantId);
                    return newHra;
                });

        hraDeclaration.setRentPaidMonthly(request.getRentPaidMonthly());
        hraDeclaration.setLandlordName(request.getLandlordName());
        hraDeclaration.setLandlordPan(request.getLandlordPan());
        hraDeclaration.setLandlordAddress(request.getLandlordAddress());
        hraDeclaration.setMetroCity(request.getMetroCity());
        hraDeclaration.setRentReceiptsPath(request.getRentReceiptsPath());
        hraDeclaration.setCalculatedExemption(hraExemption);

        hraDeclaration = hraRepository.save(hraDeclaration);

        return mapToHraDTO(hraDeclaration);
    }

    /**
     * Calculate HRA exemption
     * HRA exemption = Minimum of:
     * 1. Actual HRA received
     * 2. Rent paid - 10% of basic salary
     * 3. 50% of basic (metro) or 40% of basic (non-metro)
     */
    private BigDecimal calculateHraExemption(BigDecimal rentMonthly, Boolean isMetro,
                                            UUID userId, String financialYear) {
        // TODO: Fetch actual HRA and basic salary from employee salary
        // For now, using placeholder values
        BigDecimal basicSalary = new BigDecimal("50000"); // Monthly basic
        BigDecimal hraReceived = new BigDecimal("25000"); // Monthly HRA

        BigDecimal annualRent = rentMonthly.multiply(new BigDecimal("12"));
        BigDecimal annualBasic = basicSalary.multiply(new BigDecimal("12"));
        BigDecimal annualHra = hraReceived.multiply(new BigDecimal("12"));

        // Calculate 3 values
        BigDecimal actualHra = annualHra;
        BigDecimal rentMinus10Percent = annualRent.subtract(
                annualBasic.multiply(new BigDecimal("0.10"))
        );
        BigDecimal percentageOfBasic = annualBasic.multiply(
                isMetro ? HRA_METRO_RATE : HRA_NON_METRO_RATE
        );

        // Return minimum of the three
        BigDecimal exemption = actualHra.min(rentMinus10Percent).min(percentageOfBasic);
        return exemption.max(BigDecimal.ZERO);
    }

    /**
     * Calculate tax for a specific regime
     */
    public TaxCalculationDTO calculateTax(UUID tenantId, UUID userId, String financialYear,
                                         TaxRegime.RegimeType regimeType) {
        log.info("Calculating tax for user: {} in FY: {} with regime: {}", userId, financialYear, regimeType);

        // Get gross salary (TODO: fetch from employee salary)
        BigDecimal grossSalary = new BigDecimal("1200000"); // Annual CTC

        // Get declaration
        EmployeeTaxDeclaration declaration = declarationRepository
                .findByTenantIdAndUserIdAndFinancialYear(tenantId, userId, financialYear)
                .orElse(null);

        BigDecimal totalDeductions = BigDecimal.ZERO;

        if (regimeType == TaxRegime.RegimeType.OLD && declaration != null) {
            // Calculate deductions for OLD regime
            totalDeductions = calculateDeductions(declaration);
        }

        // Apply standard deduction
        totalDeductions = totalDeductions.add(STANDARD_DEDUCTION);

        // Calculate taxable income
        BigDecimal taxableIncome = grossSalary.subtract(totalDeductions);
        if (taxableIncome.compareTo(BigDecimal.ZERO) < 0) {
            taxableIncome = BigDecimal.ZERO;
        }

        // Calculate tax using slabs
        BigDecimal tax = calculateTaxFromSlabs(tenantId, financialYear, regimeType, taxableIncome);

        // Add cess (4%)
        BigDecimal cess = tax.multiply(CESS_RATE);
        BigDecimal totalTax = tax.add(cess);

        // Calculate monthly TDS
        BigDecimal tdsMonthly = totalTax.divide(new BigDecimal("12"), 2, RoundingMode.HALF_UP);

        // Save calculation
        TaxCalculation calculation = calculationRepository
                .findByTenantIdAndUserIdAndFinancialYearAndRegimeType(tenantId, userId, financialYear, regimeType)
                .orElseGet(() -> {
                    TaxCalculation newCalc = TaxCalculation.builder()
                            .userId(userId)
                            .financialYear(financialYear)
                            .regimeType(regimeType)
                            .build();
                    newCalc.setTenantId(tenantId);
                    return newCalc;
                });

        calculation.setGrossSalary(grossSalary);
        calculation.setTotalDeductions(totalDeductions);
        calculation.setTaxableIncome(taxableIncome);
        calculation.setTotalTax(tax);
        calculation.setCess(cess);
        calculation.setTdsMonthly(tdsMonthly);
        calculation.setCalculationDate(LocalDateTime.now());

        calculation = calculationRepository.save(calculation);

        return mapToCalculationDTO(calculation);
    }

    /**
     * Calculate total deductions for OLD regime
     */
    private BigDecimal calculateDeductions(EmployeeTaxDeclaration declaration) {
        BigDecimal totalDeductions = BigDecimal.ZERO;

        // Get all declaration items
        List<TaxDeclarationItem> items = itemRepository.findByDeclarationId(declaration.getId());

        // Section 80C - Max 1.5 lakh
        BigDecimal section80C = items.stream()
                .filter(item -> "80C".equals(item.getSection()))
                .map(TaxDeclarationItem::getDeclaredAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        section80C = section80C.min(SECTION_80C_MAX);
        totalDeductions = totalDeductions.add(section80C);

        // Section 80D - Health insurance (no limit in calculation, actual limits apply)
        BigDecimal section80D = items.stream()
                .filter(item -> "80D".equals(item.getSection()))
                .map(TaxDeclarationItem::getDeclaredAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        totalDeductions = totalDeductions.add(section80D);

        // Other sections
        BigDecimal otherSections = items.stream()
                .filter(item -> !item.getSection().equals("80C") && !item.getSection().equals("80D"))
                .map(TaxDeclarationItem::getDeclaredAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        totalDeductions = totalDeductions.add(otherSections);

        // Add HRA exemption
        HraDeclaration hraDeclaration = hraRepository
                .findByDeclarationId(declaration.getId())
                .orElse(null);
        if (hraDeclaration != null && hraDeclaration.getCalculatedExemption() != null) {
            totalDeductions = totalDeductions.add(hraDeclaration.getCalculatedExemption());
        }

        return totalDeductions;
    }

    /**
     * Calculate tax using progressive tax slabs
     */
    private BigDecimal calculateTaxFromSlabs(UUID tenantId, String financialYear,
                                            TaxRegime.RegimeType regimeType, BigDecimal taxableIncome) {
        // Get tax regime
        TaxRegime regime = regimeRepository
                .findByTenantIdAndFinancialYearAndRegimeType(tenantId, financialYear, regimeType)
                .orElseThrow(() -> new RuntimeException("Tax regime not found for " + financialYear + " - " + regimeType));

        // Get tax slabs ordered by slab_order
        List<TaxSlab> slabs = slabRepository.findByTaxRegimeIdOrderBySlabOrder(regime.getId());

        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal remainingIncome = taxableIncome;

        for (TaxSlab slab : slabs) {
            if (remainingIncome.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal slabIncome;
            if (slab.getMaxIncome() == null) {
                // Highest slab - no upper limit
                slabIncome = remainingIncome;
            } else {
                BigDecimal slabRange = slab.getMaxIncome().subtract(slab.getMinIncome());
                slabIncome = remainingIncome.min(slabRange);
            }

            BigDecimal slabTax = slabIncome.multiply(slab.getTaxRate().divide(new BigDecimal("100")));
            totalTax = totalTax.add(slabTax);

            remainingIncome = remainingIncome.subtract(slabIncome);
        }

        return totalTax.setScale(0, RoundingMode.HALF_UP);
    }

    /**
     * Compare both tax regimes and provide recommendation
     */
    public TaxComparisonResponse compareRegimes(UUID tenantId, UUID userId, String financialYear) {
        log.info("Comparing tax regimes for user: {} in FY: {}", userId, financialYear);

        // Calculate for OLD regime
        TaxCalculationDTO oldCalc = calculateTax(tenantId, userId, financialYear, TaxRegime.RegimeType.OLD);

        // Calculate for NEW regime
        TaxCalculationDTO newCalc = calculateTax(tenantId, userId, financialYear, TaxRegime.RegimeType.NEW);

        // Compare
        BigDecimal oldTotalTax = oldCalc.getTotalTax().add(oldCalc.getCess());
        BigDecimal newTotalTax = newCalc.getTotalTax().add(newCalc.getCess());

        BigDecimal savingsAmount = oldTotalTax.subtract(newTotalTax);
        TaxRegime.RegimeType recommendedRegime = savingsAmount.compareTo(BigDecimal.ZERO) > 0
                ? TaxRegime.RegimeType.NEW : TaxRegime.RegimeType.OLD;

        TaxComparisonResponse.RegimeCalculation oldRegimeCalc = TaxComparisonResponse.RegimeCalculation.builder()
                .regimeType(TaxRegime.RegimeType.OLD)
                .grossSalary(oldCalc.getGrossSalary())
                .totalDeductions(oldCalc.getTotalDeductions())
                .taxableIncome(oldCalc.getTaxableIncome())
                .totalTax(oldCalc.getTotalTax())
                .cess(oldCalc.getCess())
                .netIncome(oldCalc.getGrossSalary().subtract(oldTotalTax))
                .build();

        TaxComparisonResponse.RegimeCalculation newRegimeCalc = TaxComparisonResponse.RegimeCalculation.builder()
                .regimeType(TaxRegime.RegimeType.NEW)
                .grossSalary(newCalc.getGrossSalary())
                .totalDeductions(newCalc.getTotalDeductions())
                .taxableIncome(newCalc.getTaxableIncome())
                .totalTax(newCalc.getTotalTax())
                .cess(newCalc.getCess())
                .netIncome(newCalc.getGrossSalary().subtract(newTotalTax))
                .build();

        return TaxComparisonResponse.builder()
                .financialYear(financialYear)
                .oldRegime(oldRegimeCalc)
                .newRegime(newRegimeCalc)
                .savingsAmount(savingsAmount.abs())
                .recommendedRegime(recommendedRegime)
                .build();
    }

    /**
     * Submit declaration for verification
     */
    @Transactional
    public TaxDeclarationDTO submitDeclaration(UUID tenantId, UUID declarationId) {
        log.info("Submitting declaration: {}", declarationId);

        EmployeeTaxDeclaration declaration = declarationRepository.findById(declarationId)
                .orElseThrow(() -> new RuntimeException("Declaration not found"));

        if (!declaration.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied");
        }

        if (declaration.getStatus() != EmployeeTaxDeclaration.Status.DRAFT) {
            throw new RuntimeException("Declaration already submitted");
        }

        declaration.setStatus(EmployeeTaxDeclaration.Status.SUBMITTED);
        declaration.setSubmittedDate(LocalDateTime.now());

        declaration = declarationRepository.save(declaration);

        return mapToDTO(declaration);
    }

    /**
     * Verify proof document (HR action)
     */
    @Transactional
    public TaxDeclarationItemDTO verifyProof(UUID tenantId, UUID itemId, UUID verifiedBy, VerifyProofRequest request) {
        log.info("Verifying proof for item: {}", itemId);

        TaxDeclarationItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Declaration item not found"));

        item.setVerificationStatus(request.getApproved()
                ? TaxDeclarationItem.VerificationStatus.VERIFIED
                : TaxDeclarationItem.VerificationStatus.REJECTED);
        item.setVerifiedBy(verifiedBy);
        item.setVerifiedDate(LocalDateTime.now());
        item.setVerificationNotes(request.getVerificationNotes());

        item = itemRepository.save(item);

        return mapToItemDTO(item);
    }

    /**
     * Update total declared amount
     */
    private void updateTotalDeclaredAmount(EmployeeTaxDeclaration declaration) {
        List<TaxDeclarationItem> items = itemRepository.findByDeclarationId(declaration.getId());
        BigDecimal total = items.stream()
                .map(TaxDeclarationItem::getDeclaredAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        declaration.setTotalDeclaredAmount(total);
        declarationRepository.save(declaration);
    }

    // Mapping methods
    private TaxDeclarationDTO mapToDTO(EmployeeTaxDeclaration declaration) {
        List<TaxDeclarationItemDTO> items = itemRepository.findByDeclarationId(declaration.getId())
                .stream()
                .map(this::mapToItemDTO)
                .collect(Collectors.toList());

        HraDeclarationDTO hraDTO = hraRepository.findByDeclarationId(declaration.getId())
                .map(this::mapToHraDTO)
                .orElse(null);

        return TaxDeclarationDTO.builder()
                .id(declaration.getId())
                .userId(declaration.getUserId())
                .financialYear(declaration.getFinancialYear())
                .regimeType(declaration.getRegimeType())
                .totalDeclaredAmount(declaration.getTotalDeclaredAmount())
                .status(declaration.getStatus())
                .submittedDate(declaration.getSubmittedDate())
                .approvedDate(declaration.getApprovedDate())
                .approvedBy(declaration.getApprovedBy())
                .rejectionReason(declaration.getRejectionReason())
                .items(items)
                .hraDeclaration(hraDTO)
                .createdAt(declaration.getCreatedAt())
                .updatedAt(declaration.getUpdatedAt())
                .build();
    }

    private TaxDeclarationItemDTO mapToItemDTO(TaxDeclarationItem item) {
        return TaxDeclarationItemDTO.builder()
                .id(item.getId())
                .declarationId(item.getDeclaration().getId())
                .section(item.getSection())
                .subSection(item.getSubSection())
                .description(item.getDescription())
                .declaredAmount(item.getDeclaredAmount())
                .proofFilePath(item.getProofFilePath())
                .verificationStatus(item.getVerificationStatus())
                .verifiedBy(item.getVerifiedBy())
                .verifiedDate(item.getVerifiedDate())
                .verificationNotes(item.getVerificationNotes())
                .createdAt(item.getCreatedAt())
                .build();
    }

    private HraDeclarationDTO mapToHraDTO(HraDeclaration hra) {
        return HraDeclarationDTO.builder()
                .id(hra.getId())
                .tenantId(hra.getTenantId())
                .declarationId(hra.getDeclaration().getId())
                .rentPaidMonthly(hra.getRentPaidMonthly())
                .landlordName(hra.getLandlordName())
                .landlordPan(hra.getLandlordPan())
                .landlordAddress(hra.getLandlordAddress())
                .metroCity(hra.getMetroCity())
                .rentReceiptsPath(hra.getRentReceiptsPath())
                .calculatedExemption(hra.getCalculatedExemption())
                .createdAt(hra.getCreatedAt())
                .build();
    }

    private TaxCalculationDTO mapToCalculationDTO(TaxCalculation calc) {
        return TaxCalculationDTO.builder()
                .id(calc.getId())
                .userId(calc.getUserId())
                .financialYear(calc.getFinancialYear())
                .regimeType(calc.getRegimeType())
                .grossSalary(calc.getGrossSalary())
                .totalDeductions(calc.getTotalDeductions())
                .taxableIncome(calc.getTaxableIncome())
                .totalTax(calc.getTotalTax())
                .cess(calc.getCess())
                .tdsMonthly(calc.getTdsMonthly())
                .calculationDate(calc.getCalculationDate())
                .build();
    }
}
