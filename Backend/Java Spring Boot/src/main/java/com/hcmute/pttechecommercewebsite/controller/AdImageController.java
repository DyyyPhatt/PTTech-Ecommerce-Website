package com.hcmute.pttechecommercewebsite.controller;

import com.hcmute.pttechecommercewebsite.dto.AdImageDTO;
import com.hcmute.pttechecommercewebsite.exception.MessageResponse;
import com.hcmute.pttechecommercewebsite.exception.ResourceNotFoundException;
import com.hcmute.pttechecommercewebsite.service.AdImageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;


import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/ad-images")
@Tag(name = "AdImage Controller", description = "API quản lý quảng cáo")
public class AdImageController {

    private final AdImageService adImageService;

    @Autowired
    public AdImageController(AdImageService adImageService) {
        this.adImageService = adImageService;
    }

    @Operation(summary = "Lấy tất cả quảng cáo đang hoạt động", description = "Trả về danh sách các quảng cáo đang hiển thị, sắp xếp theo thời gian tạo (mặc định giảm dần)")
    @ApiResponse(responseCode = "200", description = "Danh sách quảng cáo được trả về thành công")
    @GetMapping
    public ResponseEntity<List<AdImageDTO>> getAllActiveAdImages(@RequestParam(defaultValue = "desc") String sortOrder) {
        List<AdImageDTO> adImages = adImageService.getAllActiveAdImages(sortOrder);
        if (adImages.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(adImages, HttpStatus.OK);
    }

    @Operation(summary = "Lấy tất cả quảng cáo chưa bị xóa mềm", description = "Trả về danh sách quảng cáo không bị xóa")
    @ApiResponse(responseCode = "200", description = "Danh sách quảng cáo được trả về thành công")
    @GetMapping("/no-delete")
    public ResponseEntity<List<AdImageDTO>> getAllAdImages(@RequestParam(defaultValue = "desc") String sortOrder) {
        List<AdImageDTO> adImages = adImageService.getAllAdImages(sortOrder);
        if (adImages.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(adImages, HttpStatus.OK);
    }

    @Operation(summary = "Lấy quảng cáo theo ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tìm thấy quảng cáo"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy quảng cáo", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<AdImageDTO> getAdImageById(@PathVariable String id) {
        return adImageService.getAdImageById(id)
                .map(adImageDTO -> new ResponseEntity<>(adImageDTO, HttpStatus.OK))
                .orElseThrow(() -> new ResourceNotFoundException("Quảng cáo với ID " + id + " không tồn tại"));
    }

    @Operation(summary = "Tìm kiếm quảng cáo theo tiêu đề")
    @GetMapping("/search")
    public ResponseEntity<List<AdImageDTO>> searchAdImages(@RequestParam String title) {
        List<AdImageDTO> adImages = adImageService.searchAdImagesByTitle(title);
        if (adImages.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(adImages);
    }

    @Operation(summary = "Tạo mới quảng cáo")
    @ApiResponse(responseCode = "201", description = "Tạo quảng cáo thành công")
    @PostMapping
    public ResponseEntity<AdImageDTO> createAdImage(@RequestBody AdImageDTO adImageDTO) {
        AdImageDTO createdAdImage = adImageService.createAdImage(adImageDTO);
        return new ResponseEntity<>(createdAdImage, HttpStatus.CREATED);
    }

    @Operation(summary = "Tạo quảng cáo có thời gian lên lịch")
    @ApiResponse(responseCode = "201", description = "Tạo quảng cáo thành công")
    @PostMapping("/schedule-create")
    public ResponseEntity<AdImageDTO> scheduleCreateAdImage(@RequestBody AdImageDTO adImageDTO) {
        AdImageDTO scheduledAdImage = adImageService.scheduleCreateAdImage(adImageDTO);
        return new ResponseEntity<>(scheduledAdImage, HttpStatus.CREATED);
    }

    @Operation(summary = "Tải ảnh quảng cáo lên")
    @PostMapping("/upload-images")
    public ResponseEntity<MessageResponse> uploadAdImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = adImageService.uploadAdImage(file);
            return ResponseEntity.ok(new MessageResponse("Tải ảnh lên thành công", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi tải ảnh lên", e.getMessage()));
        }
    }

    @Operation(summary = "Xóa ảnh quảng cáo khỏi hệ thống")
    @DeleteMapping("/delete-image/{id}")
    public ResponseEntity<Object> deleteBrandImage(@PathVariable String id) {
        try {
            adImageService.deleteFileAdImage(id);
            return new ResponseEntity<>(new MessageResponse("Xóa ảnh quảng cáo thành công!", id), HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi xóa ảnh quảng cáo", e.getMessage()));
        }
    }

    @Operation(summary = "Cập nhật thông tin quảng cáo")
    @PutMapping("/{id}")
    public ResponseEntity<Object> updateAdImage(@PathVariable String id, @RequestBody AdImageDTO adImageDTO) {
        AdImageDTO updatedAdImage = adImageService.updateAdImage(id, adImageDTO);
        return new ResponseEntity<>(new MessageResponse("Cập nhật quảng cáo thành công!", updatedAdImage), HttpStatus.OK);
    }

    @Operation(summary = "Ẩn quảng cáo (không hiển thị)")
    @PutMapping("/hide/{id}")
    public ResponseEntity<Object> hideAdImage(@PathVariable String id) {
        try {
            AdImageDTO hiddenAdImage = adImageService.hideAdImage(id);
            return new ResponseEntity<>(new MessageResponse("Quảng cáo đã được ẩn thành công", hiddenAdImage), HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy quảng cáo với ID: " + id, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi ẩn quảng cáo", e.getMessage()));
        }
    }

    @Operation(summary = "Hiện quảng cáo trở lại")
    @PutMapping("/show/{id}")
    public ResponseEntity<Object> showAdImage(@PathVariable String id) {
        try {
            AdImageDTO adImageDTO = adImageService.showAdImage(id);
            return new ResponseEntity<>(adImageDTO, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy quảng cáo với ID: " + id, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi hiện quảng cáo", e.getMessage()));
        }
    }

    @Operation(summary = "Xóa mềm quảng cáo")
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteAdImage(@PathVariable String id) {
        adImageService.deleteAdImage(id);
        return new ResponseEntity<>(new MessageResponse("Bạn đã thực hiện xóa thành công quảng cáo với ID: " + id, id), HttpStatus.OK);
    }

    @Operation(summary = "Xuất danh sách quảng cáo ra file Excel")
    @GetMapping("/export-excel")
    public ResponseEntity<byte[]> exportAdImagesToExcel() {
        try {
            ByteArrayOutputStream outputStream = adImageService.exportAdImagesToExcel();

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=adImages.xlsx");
            headers.add(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return new ResponseEntity<>(outputStream.toByteArray(), headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi khi xuất file Excel: " + e.getMessage()).getBytes());
        }
    }
}