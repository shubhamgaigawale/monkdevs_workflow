package com.crm.callservice.controller;

import com.crm.callservice.dto.request.RingCentralWebhookRequest;
import com.crm.callservice.service.WebhookService;
import com.crm.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/calls/webhooks")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Webhooks", description = "Webhook endpoints for third-party integrations")
public class WebhookController {

    private final WebhookService webhookService;

    @PostMapping("/ringcentral")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "RingCentral webhook", description = "Handle incoming webhooks from RingCentral")
    public ApiResponse<String> handleRingCentralWebhook(
            @RequestBody RingCentralWebhookRequest request,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantIdHeader) {

        log.info("Received RingCentral webhook: {}", request);

        // In production, you'd validate the webhook signature here
        // For now, we'll use tenant ID from header or a default

        UUID tenantId = tenantIdHeader != null ?
                UUID.fromString(tenantIdHeader) :
                UUID.randomUUID(); // Placeholder

        webhookService.handleRingCentralWebhook(request, tenantId);

        return ApiResponse.success("Webhook processed successfully");
    }

    @GetMapping("/ringcentral/validate")
    @Operation(summary = "Validate RingCentral webhook", description = "Endpoint for RingCentral webhook validation")
    public ApiResponse<String> validateRingCentralWebhook(
            @RequestParam(value = "validationToken", required = false) String validationToken) {

        log.info("RingCentral webhook validation request");

        // Return the validation token as required by RingCentral
        if (validationToken != null) {
            return ApiResponse.success(validationToken);
        }

        return ApiResponse.success("OK");
    }
}
