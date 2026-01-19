package com.crm.callservice.service;

import com.crm.callservice.dto.request.RingCentralWebhookRequest;
import com.crm.callservice.entity.Call;
import com.crm.callservice.repository.CallRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WebhookService {

    private final CallRepository callRepository;

    /**
     * Handle RingCentral webhook
     */
    public void handleRingCentralWebhook(RingCentralWebhookRequest request, UUID tenantId) {
        log.info("Handling RingCentral webhook: event={}, uuid={}", request.getEvent(), request.getUuid());

        try {
            Map<String, Object> body = request.getBody();

            if (body == null) {
                log.warn("Webhook body is null");
                return;
            }

            String sessionId = (String) body.get("sessionId");
            String direction = (String) body.get("direction");
            String status = (String) body.get("status");
            Integer duration = body.get("duration") != null ? ((Number) body.get("duration")).intValue() : 0;
            String fromNumber = (String) body.get("from");
            String toNumber = (String) body.get("to");

            // Check if call already exists
            Call call = callRepository.findByTenantIdAndExternalCallId(tenantId, sessionId).orElse(null);

            if ("Outbound".equalsIgnoreCase(direction)) {
                if (call == null) {
                    // Create new outbound call
                    call = new Call();
                    call.setTenantId(tenantId);
                    call.setExternalCallId(sessionId);
                    call.setDirection(Call.CallDirection.OUTBOUND);
                    call.setPhoneNumber(toNumber);
                    call.setCallStartTime(LocalDateTime.ofInstant(
                            Instant.ofEpochMilli(request.getTimestamp()),
                            ZoneId.systemDefault()
                    ));
                } else {
                    // Update existing call
                    call.setDuration(duration);
                    if ("Completed".equalsIgnoreCase(status)) {
                        call.setStatus(Call.CallStatus.COMPLETED);
                        call.setCallEndTime(LocalDateTime.now());
                    }
                }
                callRepository.save(call);
            } else if ("Inbound".equalsIgnoreCase(direction)) {
                if (call == null) {
                    // Create new inbound call
                    call = new Call();
                    call.setTenantId(tenantId);
                    call.setExternalCallId(sessionId);
                    call.setDirection(Call.CallDirection.INBOUND);
                    call.setPhoneNumber(fromNumber);
                    call.setCallStartTime(LocalDateTime.ofInstant(
                            Instant.ofEpochMilli(request.getTimestamp()),
                            ZoneId.systemDefault()
                    ));

                    if ("Missed".equalsIgnoreCase(status)) {
                        call.setStatus(Call.CallStatus.MISSED);
                    } else if ("Rejected".equalsIgnoreCase(status)) {
                        call.setStatus(Call.CallStatus.REJECTED);
                    } else {
                        call.setStatus(Call.CallStatus.COMPLETED);
                    }
                } else {
                    // Update existing call
                    call.setDuration(duration);
                    if ("Completed".equalsIgnoreCase(status)) {
                        call.setStatus(Call.CallStatus.COMPLETED);
                        call.setCallEndTime(LocalDateTime.now());
                    }
                }
                callRepository.save(call);
            }

            log.info("RingCentral webhook processed successfully");

        } catch (Exception e) {
            log.error("Error processing RingCentral webhook: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process RingCentral webhook", e);
        }
    }
}
