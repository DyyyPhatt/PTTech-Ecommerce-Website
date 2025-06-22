package com.hcmute.pttechecommercewebsite.controller;

import com.hcmute.pttechecommercewebsite.dto.InventoryDTO;
import com.hcmute.pttechecommercewebsite.model.Inventory;
import com.hcmute.pttechecommercewebsite.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventories")
@Tag(name = "Inventory Controller", description = "API quản lý nhập kho")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @Operation(summary = "Lấy tất cả thông tin nhập kho (sắp xếp theo thời gian tạo)")
    @GetMapping
    public ResponseEntity<List<InventoryDTO>> getAllInventories(@RequestParam(required = false, defaultValue = "desc") String sort) {
        // sort: "asc" cho cũ nhất, "desc" cho mới nhất
        List<InventoryDTO> inventories = inventoryService.getAllInventories(sort);
        return new ResponseEntity<>(inventories, HttpStatus.OK);
    }

    @Operation(summary = "Lọc nhập kho theo Product ID")
    @GetMapping("/filter")
    public ResponseEntity<List<InventoryDTO>> getInventoriesByProductId(@RequestParam String productId) {
        List<InventoryDTO> inventories = inventoryService.getInventoriesByProductId(productId);
        return new ResponseEntity<>(inventories, HttpStatus.OK);
    }

    @Operation(summary = "Lấy danh sách nhập kho sắp xếp theo tổng tiền")
    @GetMapping("/sorted")
    public ResponseEntity<List<InventoryDTO>> getInventoriesSortedByTotalAmount(@RequestParam(defaultValue = "true") boolean ascending) {
        List<InventoryDTO> inventories = inventoryService.getInventoriesSortedByTotalAmount(ascending);
        return new ResponseEntity<>(inventories, HttpStatus.OK);
    }

    @Operation(summary = "Lấy danh sách nhập kho sắp xếp theo tổng số lượng")
    @GetMapping("/sorted-by-quantity")
    public ResponseEntity<List<InventoryDTO>> getInventoriesSortedByTotalQuantity(@RequestParam(defaultValue = "true") boolean ascending) {
        List<InventoryDTO> inventories = inventoryService.getInventoriesSortedByTotalQuantity(ascending);
        return new ResponseEntity<>(inventories, HttpStatus.OK);
    }

    @Operation(summary = "Lấy thông tin nhập kho theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<InventoryDTO> getInventoryById(@PathVariable String id) {
        Optional<InventoryDTO> inventory = inventoryService.getInventoryById(id);
        return inventory.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @Operation(summary = "Tạo mới phiếu nhập kho")
    @PostMapping
    public ResponseEntity<InventoryDTO> createInventory(@RequestBody InventoryDTO inventoryDTO) {
        InventoryDTO createdInventory = inventoryService.createInventory(inventoryDTO);
        return new ResponseEntity<>(createdInventory, HttpStatus.CREATED);
    }

    @Operation(summary = "Xóa phiếu nhập kho theo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable String id) {
        boolean isDeleted = inventoryService.deleteInventory(id);
        return isDeleted ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @Operation(summary = "Import danh sách nhập kho từ file Excel")
    @PostMapping("/import-excel")
    public ResponseEntity<String> importInventoriesFromExcel(@RequestParam("file") MultipartFile file) {
        try {
            inventoryService.importInventoriesFromExcel(file);
            return ResponseEntity.ok("Import thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi import: " + e.getMessage());
        }
    }

    @Operation(summary = "Xuất danh sách nhập kho ra file Excel")
    @GetMapping("/export-excel")
    public ResponseEntity<byte[]> exportInventoriesToExcel(@RequestParam(required = false, defaultValue = "desc") String sort) {
        try {
            // Gọi service để xuất danh sách nhập kho
            ByteArrayOutputStream outputStream = inventoryService.exportInventoriesToExcel(sort);

            // Thiết lập các header cho response (để trình duyệt tải file Excel)
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inventories.xlsx");
            headers.add(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            // Trả về file Excel dưới dạng byte array
            return new ResponseEntity<>(outputStream.toByteArray(), headers, HttpStatus.OK);
        } catch (IOException e) {
            // Nếu có lỗi xảy ra trong quá trình xuất file Excel
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi khi xuất file Excel: " + e.getMessage()).getBytes());
        }
    }
}