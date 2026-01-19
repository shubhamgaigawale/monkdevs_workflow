package com.crm.leadservice.service;

import com.crm.leadservice.dto.request.CreateLeadRequest;
import com.crm.leadservice.entity.Lead;
import com.crm.leadservice.entity.Lead.LeadStatus;
import com.crm.leadservice.entity.Lead.LeadPriority;
import com.crm.leadservice.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeadImportService {

    private final LeadRepository leadRepository;

    public Map<String, Integer> importFromFile(MultipartFile file, UUID tenantId, UUID userId) {
        Map<String, Integer> result = new HashMap<>();
        result.put("successCount", 0);
        result.put("errorCount", 0);

        String filename = file.getOriginalFilename();
        if (filename == null) {
            log.error("No filename provided");
            result.put("errorCount", 1);
            return result;
        }

        try {
            if (filename.endsWith(".csv")) {
                return importFromCsv(file, tenantId, userId);
            } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
                return importFromExcel(file, tenantId, userId);
            } else {
                log.error("Unsupported file format: {}", filename);
                result.put("errorCount", 1);
                return result;
            }
        } catch (Exception e) {
            log.error("Error importing file: {}", filename, e);
            result.put("errorCount", 1);
            return result;
        }
    }

    private Map<String, Integer> importFromCsv(MultipartFile file, UUID tenantId, UUID userId) {
        Map<String, Integer> result = new HashMap<>();
        int successCount = 0;
        int errorCount = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                log.error("CSV file is empty");
                result.put("successCount", 0);
                result.put("errorCount", 1);
                return result;
            }

            String[] headers = headerLine.split(",");
            Map<String, Integer> columnIndexMap = buildColumnIndexMap(headers);

            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                try {
                    String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1); // Handle quoted fields
                    Lead lead = createLeadFromRow(values, columnIndexMap, tenantId, userId);
                    if (lead != null) {
                        leadRepository.save(lead);
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (Exception e) {
                    log.error("Error processing CSV line {}: {}", lineNumber, e.getMessage());
                    errorCount++;
                }
            }
        } catch (Exception e) {
            log.error("Error reading CSV file", e);
            errorCount++;
        }

        result.put("successCount", successCount);
        result.put("errorCount", errorCount);
        return result;
    }

    private Map<String, Integer> importFromExcel(MultipartFile file, UUID tenantId, UUID userId) {
        Map<String, Integer> result = new HashMap<>();
        int successCount = 0;
        int errorCount = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            if (sheet.getPhysicalNumberOfRows() == 0) {
                log.error("Excel file is empty");
                result.put("successCount", 0);
                result.put("errorCount", 1);
                return result;
            }

            Row headerRow = sheet.getRow(0);
            Map<String, Integer> columnIndexMap = buildColumnIndexMapFromExcel(headerRow);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    Lead lead = createLeadFromExcelRow(row, columnIndexMap, tenantId, userId);
                    if (lead != null) {
                        leadRepository.save(lead);
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (Exception e) {
                    log.error("Error processing Excel row {}: {}", i + 1, e.getMessage());
                    errorCount++;
                }
            }
        } catch (Exception e) {
            log.error("Error reading Excel file", e);
            errorCount++;
        }

        result.put("successCount", successCount);
        result.put("errorCount", errorCount);
        return result;
    }

    private Map<String, Integer> buildColumnIndexMap(String[] headers) {
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < headers.length; i++) {
            String header = headers[i].trim().toLowerCase().replace("\"", "");
            map.put(header, i);
        }
        return map;
    }

    private Map<String, Integer> buildColumnIndexMapFromExcel(Row headerRow) {
        Map<String, Integer> map = new HashMap<>();
        if (headerRow == null) return map;

        for (Cell cell : headerRow) {
            String header = getCellValueAsString(cell).trim().toLowerCase();
            map.put(header, cell.getColumnIndex());
        }
        return map;
    }

    private Lead createLeadFromRow(String[] values, Map<String, Integer> columnIndexMap, UUID tenantId, UUID userId) {
        try {
            String firstName = getColumnValue(values, columnIndexMap, "firstname");
            String lastName = getColumnValue(values, columnIndexMap, "lastname");
            String email = getColumnValue(values, columnIndexMap, "email");

            if (firstName == null || firstName.isEmpty() ||
                lastName == null || lastName.isEmpty() ||
                email == null || email.isEmpty()) {
                log.warn("Skipping row with missing required fields");
                return null;
            }

            Lead lead = new Lead();
            lead.setTenantId(tenantId);
            lead.setFirstName(firstName);
            lead.setLastName(lastName);
            lead.setEmail(email);
            lead.setPhone(getColumnValue(values, columnIndexMap, "phone"));
            lead.setCompany(getColumnValue(values, columnIndexMap, "company"));
            lead.setSource(getColumnValue(values, columnIndexMap, "source"));
            lead.setNotes(getColumnValue(values, columnIndexMap, "notes"));

            String status = getColumnValue(values, columnIndexMap, "status");
            lead.setStatus(parseStatus(status));

            String priority = getColumnValue(values, columnIndexMap, "priority");
            lead.setPriority(parsePriority(priority));

            return lead;
        } catch (Exception e) {
            log.error("Error creating lead from row", e);
            return null;
        }
    }

    private Lead createLeadFromExcelRow(Row row, Map<String, Integer> columnIndexMap, UUID tenantId, UUID userId) {
        try {
            String firstName = getExcelColumnValue(row, columnIndexMap, "firstname");
            String lastName = getExcelColumnValue(row, columnIndexMap, "lastname");
            String email = getExcelColumnValue(row, columnIndexMap, "email");

            if (firstName == null || firstName.isEmpty() ||
                lastName == null || lastName.isEmpty() ||
                email == null || email.isEmpty()) {
                log.warn("Skipping row with missing required fields");
                return null;
            }

            Lead lead = new Lead();
            lead.setTenantId(tenantId);
            lead.setFirstName(firstName);
            lead.setLastName(lastName);
            lead.setEmail(email);
            lead.setPhone(getExcelColumnValue(row, columnIndexMap, "phone"));
            lead.setCompany(getExcelColumnValue(row, columnIndexMap, "company"));
            lead.setSource(getExcelColumnValue(row, columnIndexMap, "source"));
            lead.setNotes(getExcelColumnValue(row, columnIndexMap, "notes"));

            String status = getExcelColumnValue(row, columnIndexMap, "status");
            lead.setStatus(parseStatus(status));

            String priority = getExcelColumnValue(row, columnIndexMap, "priority");
            lead.setPriority(parsePriority(priority));

            return lead;
        } catch (Exception e) {
            log.error("Error creating lead from Excel row", e);
            return null;
        }
    }

    private String getColumnValue(String[] values, Map<String, Integer> columnIndexMap, String columnName) {
        Integer index = columnIndexMap.get(columnName.toLowerCase());
        if (index != null && index < values.length) {
            String value = values[index].trim().replace("\"", "");
            return value.isEmpty() ? null : value;
        }
        return null;
    }

    private String getExcelColumnValue(Row row, Map<String, Integer> columnIndexMap, String columnName) {
        Integer index = columnIndexMap.get(columnName.toLowerCase());
        if (index != null) {
            Cell cell = row.getCell(index);
            if (cell != null) {
                String value = getCellValueAsString(cell).trim();
                return value.isEmpty() ? null : value;
            }
        }
        return null;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toString();
                } else {
                    return String.valueOf((long) cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }

    private LeadStatus parseStatus(String status) {
        if (status == null || status.isEmpty()) {
            return LeadStatus.NEW;
        }
        try {
            return LeadStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return LeadStatus.NEW;
        }
    }

    private LeadPriority parsePriority(String priority) {
        if (priority == null || priority.isEmpty()) {
            return LeadPriority.MEDIUM;
        }
        try {
            return LeadPriority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            return LeadPriority.MEDIUM;
        }
    }
}
