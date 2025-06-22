package com.hcmute.pttechecommercewebsite.controller;

import com.hcmute.pttechecommercewebsite.dto.BrandDTO;
import com.hcmute.pttechecommercewebsite.exception.MessageResponse;
import com.hcmute.pttechecommercewebsite.exception.ResourceNotFoundException;
import com.hcmute.pttechecommercewebsite.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/brands")
@Tag(name = "Brand Controller", description = "API quản lý thương hiệu")
public class BrandController {

    private final BrandService brandService;

    @Autowired
    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @Operation(summary = "Lấy tất cả thương hiệu", description = "Trả về danh sách tất cả thương hiệu, có thể sắp xếp theo tên hoặc các trường khác.")
    @GetMapping
    public ResponseEntity<List<BrandDTO>> getAllBrands(
            @RequestParam(value = "sortBy", defaultValue = "name") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "asc") String sortOrder) {

        Sort sort = Sort.by(Sort.Order.by(sortBy));
        if ("desc".equalsIgnoreCase(sortOrder)) {
            sort = sort.descending();
        }

        List<BrandDTO> brands = brandService.getAllBrands(sort);
        if (brands.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(brands, HttpStatus.OK);
    }

    @Operation(summary = "Lấy tất cả thương hiệu chưa bị xoá (soft delete)")
    @GetMapping("/no-delete")
    public ResponseEntity<List<BrandDTO>> getAllBrandsWithDeletedFalse(
            @RequestParam(value = "sortBy", defaultValue = "name") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "asc") String sortOrder) {

        Sort sort = Sort.by(Sort.Order.by(sortBy));
        if ("desc".equalsIgnoreCase(sortOrder)) {
            sort = sort.descending();
        }

        List<BrandDTO> brands = brandService.getAllBrandsWithDeletedFalse(sort);
        if (brands.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(brands, HttpStatus.OK);
    }

    @Operation(summary = "Lấy thương hiệu theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<BrandDTO> getBrandById(@PathVariable String id) {
        return brandService.getBrandById(id)
                .map(brandDTO -> new ResponseEntity<>(brandDTO, HttpStatus.OK))
                .orElseThrow(() -> new ResourceNotFoundException("Thương hiệu với ID " + id + " không tồn tại hoặc đã bị ẩn"));
    }

    @Operation(summary = "Tìm kiếm thương hiệu theo tên")
    @GetMapping("/search")
    public ResponseEntity<List<BrandDTO>> searchBrands(@RequestParam String keyword) {
        List<BrandDTO> brands = brandService.searchBrandsByName(keyword);
        if (brands.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(brands);
    }

    @Operation(summary = "Tạo thương hiệu mới")
    @PostMapping
    public ResponseEntity<BrandDTO> createBrand(@ModelAttribute BrandDTO brandDTO) {
        BrandDTO createdBrand = brandService.createBrand(brandDTO);
        return new ResponseEntity<>(createdBrand, HttpStatus.CREATED);
    }

    @Operation(summary = "Tạo thương hiệu có thời gian lên lịch")
    @PostMapping("/schedule-create")
    public ResponseEntity<BrandDTO> scheduleCreateBrand(@RequestBody BrandDTO brandDTO) {
        BrandDTO scheduledBrand = brandService.scheduleCreateBrand(brandDTO);
        return new ResponseEntity<>(scheduledBrand, HttpStatus.CREATED);
    }

    @Operation(summary = "Tải ảnh thương hiệu lên")
    @PostMapping("/upload-images")
    public ResponseEntity<MessageResponse> uploadAdImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = brandService.uploadImage(file);
            return ResponseEntity.ok(new MessageResponse("Tải ảnh lên thành công", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi tải ảnh lên", e.getMessage()));
        }
    }

    @Operation(summary = "Xoá ảnh thương hiệu theo ID")
    @DeleteMapping("/delete-image/{id}")
    public ResponseEntity<Object> deleteBrandImage(@PathVariable String id) {
        try {
            brandService.deleteBrandImage(id);
            return new ResponseEntity<>(new MessageResponse("Xóa ảnh thương hiệu thành công!", id), HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi xóa ảnh thương hiệu", e.getMessage()));
        }
    }

    @Operation(summary = "Cập nhật thương hiệu theo ID")
    @PutMapping("/{id}")
    public ResponseEntity<Object> updateBrand(@PathVariable String id, @ModelAttribute BrandDTO brandDTO) {
        BrandDTO updatedBrand = brandService.updateBrand(id, brandDTO);
        return new ResponseEntity<>(new MessageResponse("Chỉnh sửa thương hiệu thành công!", updatedBrand), HttpStatus.OK);
    }

    @Operation(summary = "Ẩn thương hiệu")
    @PutMapping("/hide/{id}")
    public ResponseEntity<Object> hideBrand(@PathVariable String id) {
        BrandDTO hiddenBrand = brandService.hideBrand(id);
        return new ResponseEntity<>(new MessageResponse("Thương hiệu đã được ẩn thành công", hiddenBrand), HttpStatus.OK);
    }

    @Operation(summary = "Hiện thương hiệu")
    @PutMapping("/show/{id}")
    public ResponseEntity<Object> showBrand(@PathVariable String id) {
        try {
            BrandDTO brandDTO = brandService.showBrand(id);
            return new ResponseEntity<>(brandDTO, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy thương hiệu với ID: " + id, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi hiện thương hiệu", e.getMessage()));
        }
    }

    @Operation(summary = "Xoá mềm thương hiệu")
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteBrand(@PathVariable String id) {
        brandService.deleteBrand(id);
        return new ResponseEntity<>(new MessageResponse("Bạn đã thực hiện xóa thành công thương hiệu với ID: " + id, id), HttpStatus.OK);
    }

    @Operation(summary = "Import thương hiệu từ file Excel")
    @PostMapping("/import-excel")
    public ResponseEntity<String> importBrandsFromExcel(@RequestParam("file") MultipartFile file) {
        try {
            brandService.importBrandsFromExcel(file);
            return ResponseEntity.ok("Import dữ liệu thành công.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi import dữ liệu từ file Excel: " + e.getMessage());
        }
    }

    @Operation(summary = "Xuất danh sách thương hiệu ra file Excel")
    @GetMapping("/export-excel")
    public ResponseEntity<byte[]> exportBrandsToExcel() {
        try {
            ByteArrayOutputStream outputStream = brandService.exportBrandsToExcel();

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=brands.xlsx");
            headers.add(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return new ResponseEntity<>(outputStream.toByteArray(), headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi khi xuất file Excel: " + e.getMessage()).getBytes());
        }
    }
}