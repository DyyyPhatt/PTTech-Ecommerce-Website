package com.hcmute.pttechecommercewebsite.dto;

import com.hcmute.pttechecommercewebsite.model.ReportBug;
import lombok.*;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportBugDTO {

    private String id;

    private String bugType;

    private String description;

    private String email;

    private List<String> imageUrls;

    private List<String> videoUrls;

    private ReportBug.BugStatus status;     // Trạng thái xử lý: PENDING, IN_PROGRESS, RESOLVED, REJECTED

    private String adminNote;     // Ghi chú từ admin (nếu có)

    private boolean isDeleted;

    private Date createdAt;

    private Date updatedAt;
}