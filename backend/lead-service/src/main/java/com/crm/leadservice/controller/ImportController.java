package com.crm.leadservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.leadservice.dto.response.ImportResultDTO;
import com.crm.leadservice.service.ExcelImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/leads/import")
@RequiredArgsConstructor
@Tag(name = "Lead Import", description = "Excel import operations for leads")
@SecurityRequirement(name = "bearerAuth")
public class ImportController {

    private final ExcelImportService excelImportService;

    @PostMapping("/excel")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('leads:import')")
    @Operation(summary = "Import leads from Excel", description = "Upload and import leads from Excel file (.xlsx)")
    public ApiResponse<ImportResultDTO> importLeadsFromExcel(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID uploadedBy = (UUID) httpRequest.getAttribute("userId");

        ImportResultDTO result = excelImportService.importLeadsFromExcel(file, tenantId, uploadedBy);
        return ApiResponse.success(result);
    }

    @GetMapping("/history")
    @PreAuthorize("hasAuthority('leads:read')")
    @Operation(summary = "Get import history", description = "Get history of all Excel imports")
    public ApiResponse<List<ImportResultDTO>> getImportHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");

        List<ImportResultDTO> history = excelImportService.getImportHistory(tenantId, page, size);
        return ApiResponse.success(history);
    }

    @GetMapping("/template")
    @Operation(summary = "Download Excel template", description = "Download Excel template for lead import")
    public ApiResponse<String> downloadTemplate() {
        String templateInfo = """
            Excel Template Format:

            Required columns:
            - First Name (required)
            - Last Name
            - Email
            - Phone
            - Company
            - Source
            - Status (NEW, CONTACTED, QUALIFIED, CONVERTED, LOST)
            - Priority (HIGH, MEDIUM, LOW)
            - Notes

            Example row:
            John | Doe | john@example.com | +1234567890 | Acme Corp | Website | NEW | HIGH | Interested in product demo
            """;

        return ApiResponse.success(templateInfo);
    }
}
