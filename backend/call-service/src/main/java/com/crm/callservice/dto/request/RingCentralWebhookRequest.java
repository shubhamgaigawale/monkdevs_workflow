package com.crm.callservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RingCentralWebhookRequest {

    private String uuid;
    private String event;
    private Long timestamp;
    private String subscriptionId;
    private Map<String, Object> body;
}
