package com.crm.leadservice.service;

import com.crm.common.exception.BadRequestException;
import com.crm.leadservice.dto.response.ImportResultDTO;
import com.crm.leadservice.entity.ExcelImport;
import com.crm.leadservice.entity.Lead;
import com.crm.leadservice.repository.ExcelImportRepository;
import com.crm.leadservice.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ExcelImportService {

    private final LeadRepository leadRepository;
    private final ExcelImportRepository importRepository;

    // Expected column headers
    private static final String[] EXPECTED_HEADERS = {
            "First Name", "Last Name", "Email", "Phone", "Company", "Source", "Status", "Priority", "Notes"
    };

    /**
     * Import leads from Excel file
     */
    public ImportResultDTO importLeadsFromExcel(MultipartFile file, UUID tenantId, UUID uploadedBy) {
        log.info("Starting Excel import for tenant: {}, file: {}", tenantId, file.getOriginalFilename());

        // Validate file
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        if (!isValidExcelFile(file)) {
            throw new BadRequestException("Invalid file format. Only .xlsx and .xls files are supported");
        }

        // Create import record
        ExcelImport importRecord = new ExcelImport();
        importRecord.setTenantId(tenantId);
        importRecord.setUploadedBy(uploadedBy);
        importRecord.setFileName(file.getOriginalFilename());
        importRecord.setStatus(ExcelImport.ImportStatus.PROCESSING);
        importRecord = importRepository.save(importRecord);

        List<ImportResultDTO.ImportError> errors = new ArrayList<>();
        int successfulRows = 0;
        int failedRows = 0;
        int totalRows = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            // Validate headers
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new BadRequestException("Excel file has no headers");
            }

            Map<String, Integer> columnIndexMap = validateAndMapHeaders(headerRow, errors);
            if (!errors.isEmpty()) {
                updateImportRecord(importRecord, totalRows, successfulRows, failedRows, errors, ExcelImport.ImportStatus.FAILED);
                return buildImportResult(importRecord, errors);
            }

            // Process data rows
            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null || isRowEmpty(row)) {
                    continue;
                }

                totalRows++;

                try {
                    Lead lead = parseRowToLead(row, columnIndexMap, tenantId, rowIndex + 1, errors);
                    if (lead != null) {
                        // Check for duplicates
                        if (lead.getEmail() != null && !lead.getEmail().isBlank()) {
                            Optional<Lead> existingLead = leadRepository.findByTenantIdAndEmail(tenantId, lead.getEmail());
                            if (existingLead.isPresent()) {
                                errors.add(ImportResultDTO.ImportError.builder()
                                        .rowNumber(rowIndex + 1)
                                        .field("Email")
                                        .error("Duplicate email already exists")
                                        .value(lead.getEmail())
                                        .build());
                                failedRows++;
                                continue;
                            }
                        }

                        leadRepository.save(lead);
                        successfulRows++;
                    } else {
                        failedRows++;
                    }
                } catch (Exception e) {
                    log.error("Error processing row {}: {}", rowIndex + 1, e.getMessage());
                    errors.add(ImportResultDTO.ImportError.builder()
                            .rowNumber(rowIndex + 1)
                            .field("General")
                            .error("Failed to process row: " + e.getMessage())
                            .build());
                    failedRows++;
                }
            }

            ExcelImport.ImportStatus finalStatus = failedRows == 0 ?
                    ExcelImport.ImportStatus.COMPLETED :
                    (successfulRows > 0 ? ExcelImport.ImportStatus.COMPLETED : ExcelImport.ImportStatus.FAILED);

            updateImportRecord(importRecord, totalRows, successfulRows, failedRows, errors, finalStatus);

            log.info("Excel import completed. Total: {}, Success: {}, Failed: {}", totalRows, successfulRows, failedRows);

        } catch (IOException e) {
            log.error("Error reading Excel file: {}", e.getMessage());
            updateImportRecord(importRecord, totalRows, successfulRows, failedRows, errors, ExcelImport.ImportStatus.FAILED);
            throw new BadRequestException("Failed to read Excel file: " + e.getMessage());
        }

        return buildImportResult(importRecord, errors);
    }

    /**
     * Validate file type
     */
    private boolean isValidExcelFile(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if (fileName == null) return false;

        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        return "xlsx".equals(extension) || "xls".equals(extension);
    }

    /**
     * Validate and map column headers
     */
    private Map<String, Integer> validateAndMapHeaders(Row headerRow, List<ImportResultDTO.ImportError> errors) {
        Map<String, Integer> columnIndexMap = new HashMap<>();

        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            if (cell != null) {
                String headerValue = cell.getStringCellValue().trim();
                columnIndexMap.put(headerValue, i);
            }
        }

        // Check for required headers
        if (!columnIndexMap.containsKey("First Name")) {
            errors.add(ImportResultDTO.ImportError.builder()
                    .rowNumber(1)
                    .field("Headers")
                    .error("Required header 'First Name' is missing")
                    .build());
        }

        return columnIndexMap;
    }

    /**
     * Parse Excel row to Lead entity
     */
    private Lead parseRowToLead(Row row, Map<String, Integer> columnIndexMap, UUID tenantId,
                                 int rowNumber, List<ImportResultDTO.ImportError> errors) {
        Lead lead = new Lead();
        lead.setTenantId(tenantId);

        try {
            // First Name (required)
            String firstName = getCellValueAsString(row, columnIndexMap.get("First Name"));
            if (firstName == null || firstName.isBlank()) {
                errors.add(ImportResultDTO.ImportError.builder()
                        .rowNumber(rowNumber)
                        .field("First Name")
                        .error("First Name is required")
                        .build());
                return null;
            }
            lead.setFirstName(firstName);

            // Last Name
            lead.setLastName(getCellValueAsString(row, columnIndexMap.get("Last Name")));

            // Email
            String email = getCellValueAsString(row, columnIndexMap.get("Email"));
            if (email != null && !email.isBlank()) {
                if (!isValidEmail(email)) {
                    errors.add(ImportResultDTO.ImportError.builder()
                            .rowNumber(rowNumber)
                            .field("Email")
                            .error("Invalid email format")
                            .value(email)
                            .build());
                }
                lead.setEmail(email);
            }

            // Phone
            lead.setPhone(getCellValueAsString(row, columnIndexMap.get("Phone")));

            // Company
            lead.setCompany(getCellValueAsString(row, columnIndexMap.get("Company")));

            // Source
            lead.setSource(getCellValueAsString(row, columnIndexMap.get("Source")));

            // Status
            String status = getCellValueAsString(row, columnIndexMap.get("Status"));
            if (status != null && !status.isBlank()) {
                try {
                    lead.setStatus(Lead.LeadStatus.valueOf(status.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    lead.setStatus(Lead.LeadStatus.NEW);
                    errors.add(ImportResultDTO.ImportError.builder()
                            .rowNumber(rowNumber)
                            .field("Status")
                            .error("Invalid status value, defaulted to NEW")
                            .value(status)
                            .build());
                }
            } else {
                lead.setStatus(Lead.LeadStatus.NEW);
            }

            // Priority
            String priority = getCellValueAsString(row, columnIndexMap.get("Priority"));
            if (priority != null && !priority.isBlank()) {
                try {
                    lead.setPriority(Lead.LeadPriority.valueOf(priority.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    lead.setPriority(Lead.LeadPriority.MEDIUM);
                    errors.add(ImportResultDTO.ImportError.builder()
                            .rowNumber(rowNumber)
                            .field("Priority")
                            .error("Invalid priority value, defaulted to MEDIUM")
                            .value(priority)
                            .build());
                }
            } else {
                lead.setPriority(Lead.LeadPriority.MEDIUM);
            }

            // Notes
            lead.setNotes(getCellValueAsString(row, columnIndexMap.get("Notes")));

            return lead;

        } catch (Exception e) {
            log.error("Error parsing row {}: {}", rowNumber, e.getMessage());
            errors.add(ImportResultDTO.ImportError.builder()
                    .rowNumber(rowNumber)
                    .field("General")
                    .error("Failed to parse row: " + e.getMessage())
                    .build());
            return null;
        }
    }

    /**
     * Get cell value as string
     */
    private String getCellValueAsString(Row row, Integer columnIndex) {
        if (columnIndex == null) return null;

        Cell cell = row.getCell(columnIndex);
        if (cell == null) return null;

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getDateCellValue().toString();
                } else {
                    // Format as integer if whole number, otherwise as decimal
                    double numericValue = cell.getNumericCellValue();
                    if (numericValue == Math.floor(numericValue)) {
                        yield String.valueOf((long) numericValue);
                    } else {
                        yield String.valueOf(numericValue);
                    }
                }
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> null;
        };
    }

    /**
     * Check if row is empty
     */
    private boolean isRowEmpty(Row row) {
        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }

    /**
     * Validate email format
     */
    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email.matches(emailRegex);
    }

    /**
     * Update import record with results
     */
    private void updateImportRecord(ExcelImport importRecord, int totalRows, int successfulRows,
                                     int failedRows, List<ImportResultDTO.ImportError> errors,
                                     ExcelImport.ImportStatus status) {
        importRecord.setTotalRows(totalRows);
        importRecord.setSuccessfulRows(successfulRows);
        importRecord.setFailedRows(failedRows);
        importRecord.setStatus(status);

        if (!errors.isEmpty()) {
            StringBuilder errorLog = new StringBuilder();
            for (ImportResultDTO.ImportError error : errors) {
                errorLog.append(String.format("Row %d, Field '%s': %s\n",
                        error.getRowNumber(), error.getField(), error.getError()));
            }
            importRecord.setErrorLog(errorLog.toString());
        }

        importRepository.save(importRecord);
    }

    /**
     * Build import result DTO
     */
    private ImportResultDTO buildImportResult(ExcelImport importRecord, List<ImportResultDTO.ImportError> errors) {
        return ImportResultDTO.builder()
                .importId(importRecord.getId())
                .fileName(importRecord.getFileName())
                .totalRows(importRecord.getTotalRows())
                .successfulRows(importRecord.getSuccessfulRows())
                .failedRows(importRecord.getFailedRows())
                .status(importRecord.getStatus())
                .errors(errors.isEmpty() ? null : errors)
                .createdAt(importRecord.getCreatedAt())
                .build();
    }

    /**
     * Get import history
     */
    @Transactional(readOnly = true)
    public List<ImportResultDTO> getImportHistory(UUID tenantId, int page, int size) {
        log.info("Fetching import history for tenant: {}", tenantId);

        List<ExcelImport> imports = importRepository.findByTenantIdOrderByCreatedAtDesc(tenantId,
                org.springframework.data.domain.PageRequest.of(page, size)).getContent();

        return imports.stream()
                .map(importRecord -> ImportResultDTO.builder()
                        .importId(importRecord.getId())
                        .fileName(importRecord.getFileName())
                        .totalRows(importRecord.getTotalRows())
                        .successfulRows(importRecord.getSuccessfulRows())
                        .failedRows(importRecord.getFailedRows())
                        .status(importRecord.getStatus())
                        .createdAt(importRecord.getCreatedAt())
                        .build())
                .toList();
    }
}
