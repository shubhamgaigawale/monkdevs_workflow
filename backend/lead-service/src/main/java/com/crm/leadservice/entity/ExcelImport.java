package com.crm.leadservice.entity;

import com.crm.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "excel_imports", schema = "lead_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ExcelImport extends BaseEntity {

    @Column(name = "uploaded_by", nullable = false)
    private UUID uploadedBy;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "s3_key", length = 500)
    private String s3Key;

    @Column(name = "total_rows")
    private Integer totalRows;

    @Column(name = "successful_rows")
    private Integer successfulRows;

    @Column(name = "failed_rows")
    private Integer failedRows;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private ImportStatus status = ImportStatus.PROCESSING;

    @Column(name = "error_log", columnDefinition = "TEXT")
    private String errorLog;

    public enum ImportStatus {
        PROCESSING,
        COMPLETED,
        FAILED
    }
}
