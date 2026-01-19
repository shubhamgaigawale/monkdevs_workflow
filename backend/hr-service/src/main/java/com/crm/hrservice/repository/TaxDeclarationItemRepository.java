package com.crm.hrservice.repository;

import com.crm.hrservice.entity.TaxDeclarationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for TaxDeclarationItem entity
 */
@Repository
public interface TaxDeclarationItemRepository extends JpaRepository<TaxDeclarationItem, UUID> {

    @Query("SELECT tdi FROM TaxDeclarationItem tdi WHERE tdi.declaration.id = :declarationId")
    List<TaxDeclarationItem> findByDeclarationId(UUID declarationId);

    @Query("SELECT tdi FROM TaxDeclarationItem tdi WHERE tdi.declaration.id = :declarationId AND tdi.section = :section")
    List<TaxDeclarationItem> findByDeclarationIdAndSection(UUID declarationId, String section);
}
