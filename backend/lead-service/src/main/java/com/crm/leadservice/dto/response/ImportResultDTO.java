package com.crm.leadservice.dto.response;

import com.crm.leadservice.entity.ExcelImport;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportResultDTO {

    private UUID importId;

    private String fileName;

    private Integer totalRows;

    private Integer successfulRows;

    private Integer failedRows;

    private ExcelImport.ImportStatus status;

    private List<ImportError> errors;

    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportError {
        private Integer rowNumber;
        private String field;
        private String error;
        private String value;
    }
}
