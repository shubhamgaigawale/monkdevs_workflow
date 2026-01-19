package com.crm.callservice.dto.request;

import com.crm.callservice.entity.Call;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogCallRequest {

    private UUID leadId;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotNull(message = "Direction is required")
    private Call.CallDirection direction;

    private Call.CallStatus status;

    private Integer duration;

    private LocalDateTime callStartTime;

    private LocalDateTime callEndTime;

    private String notes;

    private String outcome;

    private Boolean followUpRequired;

    private LocalDateTime followUpDate;

    private String externalCallId;

    private Map<String, Object> callMetadata;
}
