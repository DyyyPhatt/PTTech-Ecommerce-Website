package com.hcmute.pttechecommercewebsite.service;

import com.hcmute.pttechecommercewebsite.dto.ReportBugDTO;
import com.hcmute.pttechecommercewebsite.model.ReportBug;
import com.hcmute.pttechecommercewebsite.repository.ReportBugRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportBugService {

    private final ReportBugRepository reportBugRepository;
    private final EmailService emailService;

    private final String bugImageDir = "upload-images/bugs";
    private final String bugImageUrl = "http://localhost:8081/images/bugs";

    private final String bugVideoDir = "upload-videos/bugs";
    private final String bugVideoUrl = "http://localhost:8081/videos/bugs";

    public List<ReportBugDTO> getAllReports(String statusStr, String bugType, String sort) {
        List<ReportBug> reports;

        if (statusStr != null && bugType != null) {
            try {
                ReportBug.BugStatus status = ReportBug.BugStatus.valueOf(statusStr.toUpperCase());
                reports = reportBugRepository.findByStatusAndBugTypeAndIsDeletedFalse(status, bugType);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + statusStr);
            }
        } else if (statusStr != null) {
            try {
                ReportBug.BugStatus status = ReportBug.BugStatus.valueOf(statusStr.toUpperCase());
                reports = reportBugRepository.findByStatusAndIsDeletedFalse(status);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + statusStr);
            }
        } else if (bugType != null) {
            reports = reportBugRepository.findByBugTypeAndIsDeletedFalse(bugType);
        } else {
            reports = reportBugRepository.findByIsDeletedFalse();
        }

        // Sort by createdAt
        reports.sort((r1, r2) -> {
            if ("asc".equalsIgnoreCase(sort)) {
                return r1.getCreatedAt().compareTo(r2.getCreatedAt());
            } else {
                return r2.getCreatedAt().compareTo(r1.getCreatedAt());
            }
        });

        // Chuyển sang DTO rồi trả về
        return reports.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ReportBugDTO> getReportById(String id) {
        return reportBugRepository.findById(id)
                .filter(report -> !report.isDeleted())
                .map(this::toDTO);
    }

    public ReportBugDTO createReport(String bugType, String description, String email,
                                              List<MultipartFile> imageFiles,
                                              List<MultipartFile> videoFiles) throws IOException {
        ReportBug newReport = ReportBug.builder()
                .bugType(bugType)
                .description(description)
                .email(email)
                .status(ReportBug.BugStatus.PENDING)
                .isDeleted(false)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        // Lưu trước để có id
        newReport = reportBugRepository.save(newReport);
        String reportId = newReport.getId();

        List<String> imageUrls = new ArrayList<>();
        if (imageFiles != null) {
            for (MultipartFile file : imageFiles) {
                imageUrls.add(uploadBugImage(reportId, file));
            }
        }

        List<String> videoUrls = new ArrayList<>();
        if (videoFiles != null) {
            for (MultipartFile file : videoFiles) {
                videoUrls.add(uploadBugVideo(reportId, file));
            }
        }

        newReport.setImageUrls(imageUrls);
        newReport.setVideoUrls(videoUrls);

        newReport = reportBugRepository.save(newReport);

        if (email != null && !email.isBlank()) {
            emailService.sendThankYouEmailForBugReport(email, bugType, description);
        }

        return toDTO(newReport);
    }

    public ReportBugDTO updateReport(String id, ReportBug updatedReport) {
        return reportBugRepository.findById(id)
                .filter(report -> !report.isDeleted())
                .map(existing -> {
                    if (updatedReport.getStatus() != null) {
                        existing.setStatus(updatedReport.getStatus());
                    }
                    existing.setAdminNote(updatedReport.getAdminNote());
                    existing = reportBugRepository.save(existing);
                    return toDTO(existing);
                })
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy báo lỗi với ID: " + id));
    }

    public void softDeleteReport(String id) {
        reportBugRepository.findById(id)
                .ifPresent(report -> {
                    try {
                        // Xóa ảnh
                        deleteDirectoryRecursively(Paths.get(bugImageDir, report.getId()));
                        // Xóa video
                        deleteDirectoryRecursively(Paths.get(bugVideoDir, report.getId()));
                    } catch (IOException e) {
                        throw new RuntimeException("Không thể xóa file media của báo lỗi id: " + id, e);
                    }
                    // Soft delete DB record
                    report.setDeleted(true);
                    reportBugRepository.save(report);
                });
    }

    private void deleteDirectoryRecursively(Path dir) throws IOException {
        if (Files.exists(dir)) {
            try (DirectoryStream<Path> entries = Files.newDirectoryStream(dir)) {
                for (Path entry : entries) {
                    if (Files.isDirectory(entry)) {
                        deleteDirectoryRecursively(entry);
                    } else {
                        Files.delete(entry);
                    }
                }
            }
            Files.delete(dir); // xóa thư mục
        }
    }

    public String uploadBugImage(String reportId, MultipartFile file) throws IOException {
        Path imageDir = Paths.get(bugImageDir + File.separator + reportId);
        Files.createDirectories(imageDir);

        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        Path filePath = imageDir.resolve(fileName);
        file.transferTo(filePath);

        return bugImageUrl + "/" + reportId + "/" + fileName;
    }

    public String uploadBugVideo(String reportId, MultipartFile file) throws IOException {
        Path videoDir = Paths.get(bugVideoDir + File.separator + reportId);
        Files.createDirectories(videoDir);

        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        Path filePath = videoDir.resolve(fileName);
        file.transferTo(filePath);

        return bugVideoUrl + "/" + reportId + "/" + fileName;
    }

    public void deleteBugImage(String reportId, String imageUrl) throws IOException {
        String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
        Path filePath = Paths.get(bugImageDir + File.separator + reportId + File.separator + fileName);
        File file = filePath.toFile();

        if (file.exists() && !file.delete()) {
            throw new IOException("Không thể xóa ảnh báo lỗi: " + imageUrl);
        }
    }

    public void deleteBugVideo(String reportId, String videoUrl) throws IOException {
        String fileName = videoUrl.substring(videoUrl.lastIndexOf("/") + 1);
        Path filePath = Paths.get(bugVideoDir + File.separator + reportId + File.separator + fileName);
        File file = filePath.toFile();

        if (file.exists() && !file.delete()) {
            throw new IOException("Không thể xóa video báo lỗi: " + videoUrl);
        }
    }

    // Private method chuyển entity sang DTO trực tiếp trong service
    private ReportBugDTO toDTO(ReportBug entity) {
        return ReportBugDTO.builder()
                .id(entity.getId())
                .bugType(entity.getBugType())
                .description(entity.getDescription())
                .imageUrls(entity.getImageUrls())
                .videoUrls(entity.getVideoUrls())
                .status(entity.getStatus())
                .adminNote(entity.getAdminNote())
                .isDeleted(entity.isDeleted())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
