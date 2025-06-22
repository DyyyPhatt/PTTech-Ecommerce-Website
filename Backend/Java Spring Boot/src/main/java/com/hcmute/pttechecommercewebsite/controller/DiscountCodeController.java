package com.hcmute.pttechecommercewebsite.controller;

import com.hcmute.pttechecommercewebsite.dto.DiscountCodeDTO;
import com.hcmute.pttechecommercewebsite.exception.MessageResponse;
import com.hcmute.pttechecommercewebsite.exception.ResourceNotFoundException;
import com.hcmute.pttechecommercewebsite.service.DiscountCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/discount-codes")
@Tag(name = "Discount Code Controller", description = "API quản lý mã giảm giá")
public class DiscountCodeController {

    private final DiscountCodeService discountCodeService;

    @Autowired
    public DiscountCodeController(DiscountCodeService discountCodeService) {
        this.discountCodeService = discountCodeService;
    }

    @Operation(summary = "Lấy tất cả mã giảm giá đang hoạt động")
    @GetMapping
    public ResponseEntity<List<DiscountCodeDTO>> getAllActiveDiscountCodes(
            @RequestParam(value = "sortBy", defaultValue = "code") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "asc") String sortOrder) {

        List<DiscountCodeDTO> discountCodes = discountCodeService.getAllActiveDiscountCodes(sortBy, sortOrder);
        if (discountCodes.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(discountCodes, HttpStatus.OK);
    }

    @Operation(summary = "Lấy tất cả mã giảm giá đang hoạt động (chưa xoá)")
    @GetMapping("/no-delete")
    public ResponseEntity<List<DiscountCodeDTO>> getAllActiveDiscountCodesWithDeletedFalse(
            @RequestParam(value = "sortBy", defaultValue = "code") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "asc") String sortOrder) {

        List<DiscountCodeDTO> discountCodes = discountCodeService.getAllActiveDiscountCodesWithDeletedFalse(sortBy, sortOrder);
        if (discountCodes.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(discountCodes, HttpStatus.OK);
    }

    @Operation(summary = "Lấy mã giảm giá theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<DiscountCodeDTO> getDiscountCodeById(@PathVariable String id) {
        return discountCodeService.getDiscountCodeById(id)
                .map(discountCodeDTO -> new ResponseEntity<>(discountCodeDTO, HttpStatus.OK))
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá với ID " + id + " không tồn tại"));
    }

    @Operation(summary = "Lấy tất cả mã giảm giá có thể sử dụng")
    @GetMapping("/usable")
    public ResponseEntity<List<DiscountCodeDTO>> getUsableDiscountCodes() {
        List<DiscountCodeDTO> discountCodes = discountCodeService.getUsableDiscountCodes();
        if (discountCodes.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(discountCodes, HttpStatus.OK);
    }

    @Operation(summary = "Tìm kiếm mã giảm giá theo từ khoá")
    @GetMapping("/search")
    public ResponseEntity<List<DiscountCodeDTO>> searchDiscountCodes(@RequestParam String keyword) {
        List<DiscountCodeDTO> discountCodes = discountCodeService.searchDiscountCodesByCode(keyword);
        if (discountCodes.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(discountCodes);
    }

    @Operation(summary = "Tạo mã giảm giá mới")
    @PostMapping
    public ResponseEntity<DiscountCodeDTO> createDiscountCode(@RequestBody DiscountCodeDTO discountCodeDTO) {
        DiscountCodeDTO createdDiscountCode = discountCodeService.createDiscountCode(discountCodeDTO);
        return new ResponseEntity<>(createdDiscountCode, HttpStatus.CREATED);
    }

    @Operation(summary = "Lên lịch tạo mã giảm giá")
    @PostMapping("/schedule-create")
    public ResponseEntity<DiscountCodeDTO> scheduleCreateDiscountCode(@RequestBody DiscountCodeDTO discountCodeDTO) {
        DiscountCodeDTO scheduledDiscountCode = discountCodeService.scheduleCreateDiscountCode(discountCodeDTO);
        return new ResponseEntity<>(scheduledDiscountCode, HttpStatus.CREATED);
    }

    @Operation(summary = "Cập nhật mã giảm giá")
    @PutMapping("/{id}")
    public ResponseEntity<Object> updateDiscountCode(@PathVariable String id, @RequestBody DiscountCodeDTO discountCodeDTO) {
        DiscountCodeDTO updatedDiscountCode = discountCodeService.updateDiscountCode(id, discountCodeDTO);
        return new ResponseEntity<>(new MessageResponse("Chỉnh sửa mã giảm giá thành công!", updatedDiscountCode), HttpStatus.OK);
    }

    @Operation(summary = "Ẩn mã giảm giá (soft hide)")
    @PutMapping("/hide/{id}")
    public ResponseEntity<Object> hideDiscountCode(@PathVariable String id) {
        DiscountCodeDTO hiddenDiscountCode = discountCodeService.hideDiscountCode(id);
        return new ResponseEntity<>(new MessageResponse("Ẩn mã giảm giá thành công!", hiddenDiscountCode), HttpStatus.OK);
    }

    @Operation(summary = "Hiển thị lại mã giảm giá đã ẩn")
    @PutMapping("/show/{id}")
    public ResponseEntity<Object> showDiscountCode(@PathVariable String id) {
        DiscountCodeDTO shownDiscountCode = discountCodeService.showDiscountCode(id);
        return new ResponseEntity<>(new MessageResponse("Mã giảm giá được hiển thị thành công!", shownDiscountCode), HttpStatus.OK);
    }

    @Operation(summary = "Xoá mã giảm giá (soft delete)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteDiscountCode(@PathVariable String id) {
        discountCodeService.deleteDiscountCode(id);
        return new ResponseEntity<>(new MessageResponse("Bạn đã thực hiện xóa thành công mã giảm giá với ID: " + id, id), HttpStatus.OK);
    }

    @Operation(summary = "Xuất mã giảm giá ra file Excel")
    @GetMapping("/export-excel")
    public ResponseEntity<byte[]> exportDiscountCodeToExcel(
            @RequestParam(value = "sortBy", defaultValue = "companyName") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder) {

        try {
            ByteArrayOutputStream outputStream = discountCodeService.exportDiscountCodesToExcel(sortBy, sortOrder);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=discountCodes.xlsx");
            headers.add(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return new ResponseEntity<>(outputStream.toByteArray(), headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi khi xuất file Excel: " + e.getMessage()).getBytes());
        }
    }
}