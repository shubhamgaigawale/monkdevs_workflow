package com.crm.leadservice.repository;

import com.crm.leadservice.entity.ExcelImport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExcelImportRepository extends JpaRepository<ExcelImport, UUID> {

    // Find imports by tenant
    Page<ExcelImport> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);

    // Find imports by uploader
    List<ExcelImport> findByTenantIdAndUploadedByOrderByCreatedAtDesc(UUID tenantId, UUID uploadedBy);

    // Find imports by status
    List<ExcelImport> findByTenantIdAndStatusOrderByCreatedAtDesc(UUID tenantId, ExcelImport.ImportStatus status);
}
