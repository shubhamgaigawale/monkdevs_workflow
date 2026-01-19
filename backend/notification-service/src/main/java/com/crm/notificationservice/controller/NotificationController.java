package com.crm.notificationservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.notificationservice.dto.EmailRequest;
import com.crm.notificationservice.dto.SmsRequest;
import com.crm.notificationservice.entity.Notification;
import com.crm.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Email and SMS notification management")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/email")
    @Operation(summary = "Send email notification")
    public ResponseEntity<ApiResponse<Notification>> sendEmail(@RequestBody EmailRequest request) {
        Notification notification = notificationService.sendEmail(
                request.getRecipient(),
                request.getSubject(),
                request.getContent()
        );
        return ResponseEntity.ok(ApiResponse.success(notification));
    }

    @PostMapping("/sms")
    @Operation(summary = "Send SMS notification")
    public ResponseEntity<ApiResponse<Notification>> sendSMS(@RequestBody SmsRequest request) {
        Notification notification = notificationService.sendSMS(
                request.getPhoneNumber(),
                request.getContent()
        );
        return ResponseEntity.ok(ApiResponse.success(notification));
    }

    @GetMapping
    @Operation(summary = "Get all notifications")
    public ResponseEntity<ApiResponse<List<Notification>>> getAll() {
        List<Notification> notifications = notificationService.getAll();
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending notifications")
    public ResponseEntity<ApiResponse<List<Notification>>> getPending() {
        List<Notification> notifications = notificationService.getPending();
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }
}
