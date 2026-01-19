package com.crm.customeradminservice.service;

import com.crm.common.security.util.SecurityContextUtil;
import com.crm.customeradminservice.entity.CustomerProfile;
import com.crm.customeradminservice.repository.CustomerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerAdminService {

    private final CustomerProfileRepository customerProfileRepository;

    public CustomerProfile getProfile() {
        UUID tenantId = SecurityContextUtil.getTenantId();
        return customerProfileRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));
    }

    @Transactional
    public CustomerProfile createProfile(CustomerProfile profile) {
        profile.setTenantId(SecurityContextUtil.getTenantId());
        profile.setAccountStatus(CustomerProfile.AccountStatus.ACTIVE);
        return customerProfileRepository.save(profile);
    }

    @Transactional
    public CustomerProfile updateProfile(UUID id, CustomerProfile profile) {
        CustomerProfile existing = customerProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));
        
        existing.setCompanyName(profile.getCompanyName());
        existing.setIndustry(profile.getIndustry());
        existing.setContactPerson(profile.getContactPerson());
        existing.setContactEmail(profile.getContactEmail());
        existing.setContactPhone(profile.getContactPhone());
        existing.setAddress(profile.getAddress());
        existing.setNotes(profile.getNotes());
        existing.setCustomSettings(profile.getCustomSettings());
        
        return customerProfileRepository.save(existing);
    }

    @Transactional
    public void updateAccountStatus(UUID id, CustomerProfile.AccountStatus status) {
        CustomerProfile profile = customerProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));
        profile.setAccountStatus(status);
        customerProfileRepository.save(profile);
    }
}
