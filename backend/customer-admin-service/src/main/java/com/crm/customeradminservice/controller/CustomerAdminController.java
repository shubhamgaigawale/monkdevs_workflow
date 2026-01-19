package com.crm.customeradminservice.controller;

import com.crm.common.dto.ApiResponse;
import com.crm.customeradminservice.entity.CustomerProfile;
import com.crm.customeradminservice.service.CustomerAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
@Tag(name = "Customer Admin", description = "Customer portal and admin management")
public class CustomerAdminController {

    private final CustomerAdminService customerAdminService;

    @GetMapping("/profile")
    @Operation(summary = "Get customer profile")
    public ResponseEntity<ApiResponse<CustomerProfile>> getProfile() {
        return ResponseEntity.ok(ApiResponse.success(customerAdminService.getProfile()));
    }

    @PostMapping("/profile")
    @Operation(summary = "Create customer profile")
    public ResponseEntity<ApiResponse<CustomerProfile>> createProfile(@RequestBody CustomerProfile profile) {
        return ResponseEntity.ok(ApiResponse.success(customerAdminService.createProfile(profile)));
    }

    @PutMapping("/profile/{id}")
    @Operation(summary = "Update customer profile")
    public ResponseEntity<ApiResponse<CustomerProfile>> updateProfile(
            @PathVariable UUID id, @RequestBody CustomerProfile profile) {
        return ResponseEntity.ok(ApiResponse.success(customerAdminService.updateProfile(id, profile)));
    }

    @PutMapping("/profile/{id}/status")
    @Operation(summary = "Update account status")
    public ResponseEntity<ApiResponse<Void>> updateAccountStatus(
            @PathVariable UUID id, @RequestParam CustomerProfile.AccountStatus status) {
        customerAdminService.updateAccountStatus(id, status);
        return ResponseEntity.ok(ApiResponse.<Void>success("Account status updated"));
    }
}
