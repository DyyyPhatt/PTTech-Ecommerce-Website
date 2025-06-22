package com.hcmute.pttechecommercewebsite.controller;

import com.hcmute.pttechecommercewebsite.dto.CategoryDTO;
import com.hcmute.pttechecommercewebsite.exception.MessageResponse;
import com.hcmute.pttechecommercewebsite.exception.ResourceNotFoundException;
import com.hcmute.pttechecommercewebsite.service.CategoryService;
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

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Category Controller", description = "API quản lý danh mục sản phẩm")
public class CategoryController {

    private final CategoryService categoryService;

    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @Operation(summary = "Lấy tất cả danh mục")
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories(
            @RequestParam(value = "sortBy", defaultValue = "name") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder) {

        List<CategoryDTO> categories = categoryService.getAllCategories(sortBy, sortOrder);
        if (categories.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    @Operation(summary = "Lấy tất cả danh mục chưa bị xoá")
    @GetMapping("/no-delete")
    public ResponseEntity<List<CategoryDTO>> getAllCategoriesWithDeletedFalse(
            @RequestParam(value = "sortBy", defaultValue = "name") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder) {

        List<CategoryDTO> categories = categoryService.getAllCategoriesWithDeletedFalse(sortBy, sortOrder);
        if (categories.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    @Operation(summary = "Lấy danh mục theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable String id) {
        return categoryService.getCategoryById(id)
                .map(categoryDTO -> new ResponseEntity<>(categoryDTO, HttpStatus.OK))
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục với ID " + id + " không tồn tại hoặc đã bị ẩn"));
    }

    @Operation(summary = "Lấy danh sách danh mục con theo ID danh mục cha")
    @GetMapping("/parent/{parentCategoryId}")
    public ResponseEntity<List<CategoryDTO>> getCategoriesByParentId(@PathVariable String parentCategoryId) {
        List<CategoryDTO> categories = categoryService.getCategoriesByParentId(parentCategoryId);
        if (categories.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    @Operation(summary = "Tìm kiếm danh mục theo tên")
    @GetMapping("/search")
    public ResponseEntity<List<CategoryDTO>> searchCategories(@RequestParam String keyword) {
        List<CategoryDTO> categories = categoryService.searchCategoriesByName(keyword);
        if (categories.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(categories);
    }

    @Operation(summary = "Tạo danh mục mới")
    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@ModelAttribute CategoryDTO categoryDTO) {
        CategoryDTO createdCategory = categoryService.createCategory(categoryDTO);
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }

    @Operation(summary = "Lên lịch tạo danh mục")
    @PostMapping("/schedule-create")
    public ResponseEntity<CategoryDTO> scheduleCreateCategory(@RequestBody CategoryDTO categoryDTO) {
        CategoryDTO scheduledCategory = categoryService.scheduleCreateCategory(categoryDTO);
        return new ResponseEntity<>(scheduledCategory, HttpStatus.CREATED);
    }

    @Operation(summary = "Tải ảnh danh mục lên")
    @PostMapping("/upload-images")
    public ResponseEntity<MessageResponse> uploadAdImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = categoryService.uploadImage(file);
            return ResponseEntity.ok(new MessageResponse("Tải ảnh lên thành công", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi tải ảnh lên", e.getMessage()));
        }
    }

    @Operation(summary = "Xoá ảnh danh mục theo ID")
    @DeleteMapping("/delete-image/{id}")
    public ResponseEntity<Object> deleteCategoryImage(@PathVariable String id) {
        try {
            categoryService.deleteCategoryImage(id);
            return new ResponseEntity<>(new MessageResponse("Xóa ảnh danh mục thành công!", id), HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi xóa ảnh danh mục", e.getMessage()));
        }
    }

    @Operation(summary = "Chỉnh sửa danh mục")
    @PutMapping("/{id}")
    public ResponseEntity<Object> updateCategory(@PathVariable String id, @ModelAttribute CategoryDTO categoryDTO) {
        CategoryDTO updatedCategory = categoryService.updateCategory(id, categoryDTO);
        return new ResponseEntity<>(new MessageResponse("Chỉnh sửa danh mục thành công!", updatedCategory), HttpStatus.OK);
    }

    @Operation(summary = "Ẩn danh mục")
    @PutMapping("/hide/{id}")
    public ResponseEntity<Object> hideCategory(@PathVariable String id) {
        CategoryDTO hiddenCategory = categoryService.hideCategory(id);
        return new ResponseEntity<>(new MessageResponse("Danh mục đã được ẩn thành công", hiddenCategory), HttpStatus.OK);
    }

    @Operation(summary = "Hiện danh mục")
    @PutMapping("/show/{id}")
    public ResponseEntity<Object> showCategory(@PathVariable String id) {
        try {
            CategoryDTO categoryDTO = categoryService.showCategory(id);
            return new ResponseEntity<>(categoryDTO, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Không tìm thấy danh mục với ID: " + id, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi khi hiện danh mục", e.getMessage()));
        }
    }

    @Operation(summary = "Xoá danh mục (xóa mềm)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return new ResponseEntity<>(new MessageResponse("Bạn đã thực hiện xóa thành công danh mục với ID: " + id, id), HttpStatus.OK);
    }

    @Operation(summary = "Import danh mục từ file Excel")
    @PostMapping("/import-excel")
    public ResponseEntity<String> importCategoriesFromExcel(@RequestParam("file") MultipartFile file) {
        try {
            categoryService.importCategoriesFromExcel(file);
            return ResponseEntity.ok("Import dữ liệu danh mục thành công.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi import dữ liệu từ file Excel: " + e.getMessage());
        }
    }

    @Operation(summary = "Export danh mục ra file Excel")
    @GetMapping("/export-excel")
    public ResponseEntity<byte[]> exportCategoriesToExcel(
            @RequestParam(value = "sortBy", defaultValue = "name") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder) {

        try {
            ByteArrayOutputStream outputStream = categoryService.exportCategoriesToExcel(sortBy, sortOrder);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=categories.xlsx");
            headers.add(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return new ResponseEntity<>(outputStream.toByteArray(), headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi khi xuất file Excel: " + e.getMessage()).getBytes());
        }
    }
}