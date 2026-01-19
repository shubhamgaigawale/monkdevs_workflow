package com.crm.hrservice.controller;

import com.crm.hrservice.dto.tax.*;
import com.crm.hrservice.entity.TaxRegime;
import com.crm.hrservice.service.TaxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.UUID;

/**
 * Controller for Tax Declaration APIs
 */
@RestController
@RequestMapping("/tax")
@RequiredArgsConstructor
@Slf4j
public class TaxController {

    private final TaxService taxService;

    /**
     * Create a new tax declaration
     */
    @PostMapping("/declaration/create")
    public ResponseEntity<TaxDeclarationDTO> createDeclaration(
            @Valid @RequestBody CreateDeclarationRequest request,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        log.info("Creating tax declaration for user: {}", userId);
        TaxDeclarationDTO declaration = taxService.createDeclaration(tenantId, userId, request);
        return ResponseEntity.ok(declaration);
    }

    /**
     * Get current financial year declaration
     */
    @GetMapping("/declaration/current")
    public ResponseEntity<TaxDeclarationDTO> getCurrentDeclaration(
            @RequestParam String financialYear,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        log.info("Fetching current declaration for user: {} in FY: {}", userId, financialYear);
        TaxDeclarationDTO declaration = taxService.getCurrentDeclaration(tenantId, userId, financialYear);
        return ResponseEntity.ok(declaration);
    }

    /**
     * Add a declaration item
     */
    @PostMapping("/declaration/{declarationId}/items")
    public ResponseEntity<TaxDeclarationItemDTO> addDeclarationItem(
            @PathVariable UUID declarationId,
            @Valid @RequestBody AddDeclarationItemRequest request,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.info("Adding declaration item to declaration: {}", declarationId);
        TaxDeclarationItemDTO item = taxService.addDeclarationItem(tenantId, declarationId, request);
        return ResponseEntity.ok(item);
    }

    /**
     * Update HRA declaration
     */
    @PostMapping("/declaration/{declarationId}/hra")
    public ResponseEntity<HraDeclarationDTO> updateHraDeclaration(
            @PathVariable UUID declarationId,
            @Valid @RequestBody UpdateHraRequest request,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.info("Updating HRA declaration for declaration: {}", declarationId);
        HraDeclarationDTO hra = taxService.updateHraDeclaration(tenantId, declarationId, request);
        return ResponseEntity.ok(hra);
    }

    /**
     * Calculate tax for a specific regime
     */
    @GetMapping("/calculation")
    public ResponseEntity<TaxCalculationDTO> calculateTax(
            @RequestParam String financialYear,
            @RequestParam TaxRegime.RegimeType regimeType,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        log.info("Calculating tax for user: {} with regime: {}", userId, regimeType);
        TaxCalculationDTO calculation = taxService.calculateTax(tenantId, userId, financialYear, regimeType);
        return ResponseEntity.ok(calculation);
    }

    /**
     * Compare both tax regimes
     */
    @GetMapping("/compare-regimes")
    public ResponseEntity<TaxComparisonResponse> compareRegimes(
            @RequestParam String financialYear,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        log.info("Comparing tax regimes for user: {} in FY: {}", userId, financialYear);
        TaxComparisonResponse comparison = taxService.compareRegimes(tenantId, userId, financialYear);
        return ResponseEntity.ok(comparison);
    }

    /**
     * Submit declaration for verification
     */
    @PostMapping("/declaration/{declarationId}/submit")
    public ResponseEntity<TaxDeclarationDTO> submitDeclaration(
            @PathVariable UUID declarationId,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        log.info("Submitting declaration: {}", declarationId);
        TaxDeclarationDTO declaration = taxService.submitDeclaration(tenantId, declarationId);
        return ResponseEntity.ok(declaration);
    }

    /**
     * Verify proof document (HR only)
     */
    @PostMapping("/declaration/items/{itemId}/verify")
    public ResponseEntity<TaxDeclarationItemDTO> verifyProof(
            @PathVariable UUID itemId,
            @Valid @RequestBody VerifyProofRequest request,
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        log.info("Verifying proof for item: {} by user: {}", itemId, userId);
        TaxDeclarationItemDTO item = taxService.verifyProof(tenantId, itemId, userId, request);
        return ResponseEntity.ok(item);
    }

    /**
     * Get tax projection for current FY
     */
    @GetMapping("/projection")
    public ResponseEntity<TaxCalculationDTO> getTaxProjection(
            HttpServletRequest httpRequest) {
        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        // Use current financial year (simplified - in production, calculate based on current date)
        String currentFY = "2025-26";

        log.info("Fetching tax projection for user: {}", userId);
        TaxCalculationDTO calculation = taxService.calculateTax(
                tenantId, userId, currentFY, TaxRegime.RegimeType.OLD);
        return ResponseEntity.ok(calculation);
    }
}
