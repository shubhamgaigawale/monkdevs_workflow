package com.crm.billingservice.controller;

import com.crm.billingservice.entity.Payment;
import com.crm.billingservice.entity.Subscription;
import com.crm.billingservice.service.BillingService;
import com.crm.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Subscription and payment management")
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/subscriptions/current")
    @Operation(summary = "Get current subscription")
    public ResponseEntity<ApiResponse<Subscription>> getCurrentSubscription() {
        return ResponseEntity.ok(ApiResponse.success(billingService.getCurrentSubscription()));
    }

    @PostMapping("/subscriptions")
    @Operation(summary = "Create subscription")
    public ResponseEntity<ApiResponse<Subscription>> createSubscription(@RequestBody Subscription subscription) {
        return ResponseEntity.ok(ApiResponse.success(billingService.createSubscription(subscription)));
    }

    @PutMapping("/subscriptions/{id}")
    @Operation(summary = "Update subscription")
    public ResponseEntity<ApiResponse<Subscription>> updateSubscription(
            @PathVariable UUID id, @RequestBody Subscription subscription) {
        return ResponseEntity.ok(ApiResponse.success(billingService.updateSubscription(id, subscription)));
    }

    @DeleteMapping("/subscriptions/{id}")
    @Operation(summary = "Cancel subscription")
    public ResponseEntity<ApiResponse<Void>> cancelSubscription(@PathVariable UUID id) {
        billingService.cancelSubscription(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Subscription cancelled successfully"));
    }

    @GetMapping("/payments")
    @Operation(summary = "Get payment history")
    public ResponseEntity<ApiResponse<List<Payment>>> getPaymentHistory() {
        return ResponseEntity.ok(ApiResponse.success(billingService.getPaymentHistory()));
    }

    @PostMapping("/payments")
    @Operation(summary = "Process payment")
    public ResponseEntity<ApiResponse<Payment>> processPayment(@RequestBody Payment payment) {
        return ResponseEntity.ok(ApiResponse.success(billingService.createPayment(payment)));
    }
}
