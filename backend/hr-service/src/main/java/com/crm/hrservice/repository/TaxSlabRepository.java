package com.crm.hrservice.repository;

import com.crm.hrservice.entity.TaxSlab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for TaxSlab entity
 */
@Repository
public interface TaxSlabRepository extends JpaRepository<TaxSlab, UUID> {

    @Query("SELECT ts FROM TaxSlab ts WHERE ts.taxRegime.id = :regimeId ORDER BY ts.slabOrder")
    List<TaxSlab> findByTaxRegimeIdOrderBySlabOrder(UUID regimeId);
}
