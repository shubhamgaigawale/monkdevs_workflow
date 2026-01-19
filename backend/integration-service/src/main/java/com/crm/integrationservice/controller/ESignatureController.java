package com.crm.integrationservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.integrationservice.dto.request.SendDocumentRequest;
import com.crm.integrationservice.dto.response.ESignatureDTO;
import com.crm.integrationservice.service.ESignatureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/integrations/signatures")
@RequiredArgsConstructor
@Tag(name = "E-Signatures", description = "PandaDoc/DocuSign e-signature management")
@SecurityRequirement(name = "bearerAuth")
public class ESignatureController {

    private final ESignatureService signatureService;

    @PostMapping("/send")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('integrations:write')")
    @Operation(summary = "Send document for signature", description = "Send a document for e-signature")
    public ApiResponse<ESignatureDTO> sendDocument(
            @Valid @RequestBody SendDocumentRequest request,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");

        ESignatureDTO signature = signatureService.sendDocument(request, tenantId, userId);
        return ApiResponse.success(signature);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('integrations:read')")
    @Operation(summary = "Get all signatures", description = "Get paginated list of e-signatures")
    public ApiResponse<Page<ESignatureDTO>> getAllSignatures(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest httpRequest) {

        UUID tenantId = (UUID) httpRequest.getAttribute("tenantId");
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) httpRequest.getAttribute("roles");

        Page<ESignatureDTO> signatures = signatureService.getAllSignatures(tenantId, userId, roles, page, size);
        return ApiResponse.success(signatures);
    }
}
