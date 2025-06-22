package com.hcmute.pttechecommercewebsite.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Date;
import java.util.List;

@Document(collection = "BugReports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportBug {

    @Id
    private String id;

    @NotBlank(message = "Loại lỗi không được để trống")
    private String bugType;

    @NotBlank(message = "Mô tả lỗi không được để trống")
    @Size(max = 500, message = "Mô tả lỗi không được vượt quá 500 ký tự")
    private String description;

    private String email;

    private List<String> imageUrls;
    private List<String> videoUrls;

    private BugStatus status;
    private String adminNote;
    private boolean isDeleted;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public enum BugStatus {
        PENDING,
        IN_PROGRESS,
        RESOLVED,
        REJECTED
    }
}