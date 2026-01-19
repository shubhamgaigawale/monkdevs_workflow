package com.crm.userservice.service;

import com.crm.userservice.dto.ModuleDTO;
import com.crm.userservice.entity.Module;
import com.crm.userservice.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing modules
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ModuleService {

    private final ModuleRepository moduleRepository;

    /**
     * Get all available modules
     */
    public List<ModuleDTO> getAllModules() {
        log.debug("Fetching all modules");

        return moduleRepository.findAllByOrderByDisplayOrderAsc().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get all core modules
     */
    public List<ModuleDTO> getCoreModules() {
        log.debug("Fetching core modules");

        return moduleRepository.findByIsCoreModuleTrue().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get all non-core modules (can be subscribed to)
     */
    public List<ModuleDTO> getSubscribableModules() {
        log.debug("Fetching subscribable modules");

        return moduleRepository.findByIsCoreModuleFalse().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Convert Module entity to DTO
     */
    private ModuleDTO convertToDTO(Module module) {
        ModuleDTO dto = new ModuleDTO();
        dto.setId(module.getId());
        dto.setCode(module.getCode());
        dto.setName(module.getName());
        dto.setDescription(module.getDescription());
        dto.setIcon(module.getIcon());
        dto.setDisplayOrder(module.getDisplayOrder());
        dto.setIsCoreModule(module.getIsCoreModule());
        dto.setBasePrice(module.getBasePrice());
        dto.setRequiredPermissions(module.getRequiredPermissions());
        dto.setIsEnabled(null); // This will be set by LicenseService when needed
        return dto;
    }
}
