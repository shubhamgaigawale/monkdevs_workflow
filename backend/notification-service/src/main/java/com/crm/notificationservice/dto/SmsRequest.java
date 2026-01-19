package com.crm.notificationservice.dto;

import lombok.Data;

@Data
public class SmsRequest {
    private String phoneNumber;
    private String content;
}
