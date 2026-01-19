package com.crm.userservice.repository;

import com.crm.userservice.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Module entity operations
 */
@Repository
public interface ModuleRepository extends JpaRepository<Module, UUID> {

    /**
     * Find module by code
     */
    Optional<Module> findByCode(String code);

    /**
     * Find all modules ordered by display order
     */
    List<Module> findAllByOrderByDisplayOrderAsc();

    /**
     * Find core modules (always enabled)
     */
    List<Module> findByIsCoreModuleTrue();

    /**
     * Find non-core modules (can be enabled/disabled per tenant)
     */
    List<Module> findByIsCoreModuleFalse();

    /**
     * Check if module exists by code
     */
    boolean existsByCode(String code);

    /**
     * Find modules with price greater than given amount
     */
    @Query("SELECT m FROM Module m WHERE m.basePrice > :price ORDER BY m.basePrice ASC")
    List<Module> findModulesWithPriceGreaterThan(java.math.BigDecimal price);

    /**
     * Find modules by codes (useful for bulk operations)
     */
    List<Module> findByCodeIn(List<String> codes);
}
