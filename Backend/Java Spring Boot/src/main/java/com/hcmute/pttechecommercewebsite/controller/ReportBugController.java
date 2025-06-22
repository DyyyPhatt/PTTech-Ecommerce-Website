package com.hcmute.pttechecommercewebsite.controller;

import com.hcmute.pttechecommercewebsite.dto.ReportBugDTO;
import com.hcmute.pttechecommercewebsite.model.ReportBug;
import com.hcmute.pttechecommercewebsite.service.ReportBugService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/bug-reports")
@RequiredArgsConstructor
@Tag(name = "Bug Report Controller", description = "API quản lý báo lỗi bug")
public class ReportBugController {

    private final ReportBugService reportBugService;

    @Operation(summary = "Lấy danh sách báo lỗi bug", description = "Có thể lọc theo trạng thái, loại bug và sắp xếp")
    @GetMapping
    public ResponseEntity<List<ReportBugDTO>> getAllReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String bugType,
            @RequestParam(defaultValue = "desc") String sort
    ) {
        List<ReportBugDTO> reports = reportBugService.getAllReports(status, bugType, sort);
        return ResponseEntity.ok(reports);
    }

    @Operation(summary = "Lấy báo lỗi bug theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<ReportBugDTO> getReportById(@PathVariable String id) {
        return reportBugService.getReportById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Tạo báo lỗi bug mới", description = "Có thể upload kèm ảnh và video")
    @PostMapping
    public ResponseEntity<?> createReport(
            @RequestParam String bugType,
            @RequestParam String description,
            @RequestParam String email,
            @RequestParam(required = false) List<MultipartFile> imageFiles,
            @RequestParam(required = false) List<MultipartFile> videoFiles
    ) {
        try {
            ReportBugDTO created = reportBugService.createReport(bugType, description, email, imageFiles, videoFiles);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lưu file: " + e.getMessage());
        }
    }

    @Operation(summary = "Cập nhật báo lỗi bug theo ID")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateReport(@PathVariable String id, @RequestBody ReportBug updatedReport) {
        try {
            ReportBugDTO updated = reportBugService.updateReport(id, updatedReport);
            return ResponseEntity.ok(updated);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @Operation(summary = "Xóa mềm báo lỗi bug (soft delete)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteReport(@PathVariable String id) {
        reportBugService.softDeleteReport(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Upload ảnh cho báo lỗi bug")
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<?> uploadBugImage(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = reportBugService.uploadBugImage(id, file);
            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tải ảnh lên: " + e.getMessage());
        }
    }

    @Operation(summary = "Upload video cho báo lỗi bug")
    @PostMapping("/{id}/upload-video")
    public ResponseEntity<?> uploadBugVideo(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            String videoUrl = reportBugService.uploadBugVideo(id, file);
            return ResponseEntity.ok(videoUrl);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tải video lên: " + e.getMessage());
        }
    }

    @Operation(summary = "Xóa ảnh khỏi báo lỗi bug")
    @DeleteMapping("/{id}/delete-image")
    public ResponseEntity<?> deleteBugImage(@PathVariable String id, @RequestParam("url") String url) {
        try {
            reportBugService.deleteBugImage(id, url);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xóa ảnh: " + e.getMessage());
        }
    }

    @Operation(summary = "Xóa video khỏi báo lỗi bug")
    @DeleteMapping("/{id}/delete-video")
    public ResponseEntity<?> deleteBugVideo(@PathVariable String id, @RequestParam("url") String url) {
        try {
            reportBugService.deleteBugVideo(id, url);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xóa video: " + e.getMessage());
        }
    }
}