package com.crm.userservice.mapper;

import com.crm.userservice.dto.response.UserDTO;
import com.crm.userservice.entity.Role;
import com.crm.userservice.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * Mapper for User entity to UserDTO
 */
@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .tenantId(user.getTenantId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .isActive(user.getIsActive())
                .lastLogin(user.getLastLogin())
                .roles(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toList()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
