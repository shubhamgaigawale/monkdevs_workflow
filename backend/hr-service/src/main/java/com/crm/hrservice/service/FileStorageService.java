package com.crm.hrservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service for handling file storage operations
 */
@Slf4j
@Service
public class FileStorageService {

    @Value("${file.upload.dir:./uploads}")
    private String uploadDir;

    /**
     * Store a file and return the file path
     *
     * @param file   The file to store
     * @param userId The user ID
     * @param folder The subfolder (e.g., "documents", "avatars")
     * @return The relative file path
     */
    public String storeFile(MultipartFile file, UUID userId, String folder) {
        try {
            // Get original filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

            // Check for invalid characters
            if (originalFilename.contains("..")) {
                throw new RuntimeException("Invalid file path: " + originalFilename);
            }

            // Generate unique filename
            String fileExtension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0) {
                fileExtension = originalFilename.substring(dotIndex);
            }
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Create directory structure: uploadDir/folder/userId/
            Path targetLocation = Paths.get(uploadDir, folder, userId.toString());
            Files.createDirectories(targetLocation);

            // Full file path
            Path filePath = targetLocation.resolve(uniqueFilename);

            // Copy file to target location
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return relative path: folder/userId/uniqueFilename
            String relativePath = folder + "/" + userId.toString() + "/" + uniqueFilename;
            log.info("File stored successfully: {}", relativePath);

            return relativePath;

        } catch (IOException ex) {
            log.error("Failed to store file", ex);
            throw new RuntimeException("Failed to store file: " + ex.getMessage());
        }
    }

    /**
     * Delete a file
     *
     * @param filePath The relative file path
     * @return true if deleted successfully
     */
    public boolean deleteFile(String filePath) {
        try {
            Path path = Paths.get(uploadDir, filePath);
            Files.deleteIfExists(path);
            log.info("File deleted successfully: {}", filePath);
            return true;
        } catch (IOException ex) {
            log.error("Failed to delete file: {}", filePath, ex);
            return false;
        }
    }

    /**
     * Get the full path to a file
     *
     * @param filePath The relative file path
     * @return The full path
     */
    public Path getFilePath(String filePath) {
        return Paths.get(uploadDir, filePath);
    }

    /**
     * Check if a file exists
     *
     * @param filePath The relative file path
     * @return true if file exists
     */
    public boolean fileExists(String filePath) {
        Path path = Paths.get(uploadDir, filePath);
        return Files.exists(path);
    }
}
