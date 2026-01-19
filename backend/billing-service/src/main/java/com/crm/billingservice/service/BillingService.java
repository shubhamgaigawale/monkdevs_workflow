package com.crm.billingservice.service;

import com.crm.billingservice.entity.Payment;
import com.crm.billingservice.entity.Subscription;
import com.crm.billingservice.repository.PaymentRepository;
import com.crm.billingservice.repository.SubscriptionRepository;
import com.crm.common.security.util.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;

    public Subscription getCurrentSubscription() {
        UUID tenantId = SecurityContextUtil.getTenantId();
        return subscriptionRepository.findByTenantIdAndStatus(tenantId, Subscription.SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active subscription found"));
    }

    @Transactional
    public Subscription createSubscription(Subscription subscription) {
        subscription.setTenantId(SecurityContextUtil.getTenantId());
        subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public Subscription updateSubscription(UUID id, Subscription subscription) {
        Subscription existing = subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        existing.setPlanType(subscription.getPlanType());
        existing.setBillingCycle(subscription.getBillingCycle());
        existing.setAmount(subscription.getAmount());
        existing.setUserLimit(subscription.getUserLimit());
        return subscriptionRepository.save(existing);
    }

    @Transactional
    public void cancelSubscription(UUID id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        subscription.setStatus(Subscription.SubscriptionStatus.CANCELLED);
        subscriptionRepository.save(subscription);
    }

    public List<Payment> getPaymentHistory() {
        UUID tenantId = SecurityContextUtil.getTenantId();
        return paymentRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    @Transactional
    public Payment createPayment(Payment payment) {
        payment.setTenantId(SecurityContextUtil.getTenantId());
        return paymentRepository.save(payment);
    }
}
