package com.crm.hrservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Employee Bank Details - employee banking information for salary payment
 */
@Entity
@Table(name = "employee_bank_details", schema = "hr_workflow")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeBankDetails extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "bank_name", nullable = false, length = 200)
    private String bankName;

    @Column(name = "account_number", nullable = false, length = 50)
    private String accountNumber;

    @Column(name = "ifsc_code", nullable = false, length = 20)
    private String ifscCode;

    @Column(name = "branch_name", length = 200)
    private String branchName;

    @Column(name = "account_holder_name", nullable = false, length = 200)
    private String accountHolderName;

    @Column(name = "account_type", length = 20)
    private String accountType = "SAVINGS";

    @Column(name = "is_primary")
    private Boolean isPrimary = true;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.ACTIVE;

    public enum Status {
        ACTIVE,
        INACTIVE
    }
}
