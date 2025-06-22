package com.hcmute.pttechecommercewebsite.controller;

import com.hcmute.pttechecommercewebsite.dto.ComparisonResultDTO;
import com.hcmute.pttechecommercewebsite.dto.ProductDTO;
import com.hcmute.pttechecommercewebsite.exception.ResourceNotFoundException;
import com.hcmute.pttechecommercewebsite.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/products")
@Tag(name = "Product Controller", description = "API quản lý sản phẩm")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @Operation(summary = "Lấy tất cả sản phẩm hoạt động", description = "Trả về danh sách sản phẩm đang hoạt động, sắp xếp theo trường và thứ tự truyền vào")
    @GetMapping("")
    public ResponseEntity<List<ProductDTO>> getAllProducts(
            @RequestParam String sortBy, @RequestParam String sortOrder) {
        List<ProductDTO> products = productService.getAllProducts(sortBy, sortOrder);
        return ResponseEntity.ok(products);
    }

    @Operation(summary = "Lấy tất cả sản phẩm đang hoạt động với bộ lọc", description = "Trả về sản phẩm với các bộ lọc nâng cao như thương hiệu, danh mục, kiểu hiển thị, khoảng giá")
    @GetMapping("/active")
    public ResponseEntity<List<ProductDTO>> getActiveProducts(
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder,
            @RequestParam(required = false) List<String> brandName,
            @RequestParam(required = false) List<String> categoryName,
            @RequestParam(required = false) List<String> visibilityType,
            @RequestParam(required = false) List<String> condition,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice
    ) {
        List<ProductDTO> result = productService.getAllActiveProducts(
                sortBy, sortOrder, brandName, categoryName, visibilityType, condition, minPrice, maxPrice
        );
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Lấy tất cả sản phẩm không hoạt động", description = "Trả về danh sách sản phẩm đã bị vô hiệu hóa")
    @GetMapping("/inactive")
    public ResponseEntity<List<ProductDTO>> getAllInactiveProducts(
            @RequestParam String sortBy, @RequestParam String sortOrder) {
        List<ProductDTO> products = productService.getAllInactiveProducts(sortBy, sortOrder);
        return ResponseEntity.ok(products);
    }

    @Operation(summary = "Lấy 10 sản phẩm bán chạy nhất", description = "Trả về danh sách 10 sản phẩm có doanh số bán cao nhất")
    @GetMapping("/top-selling")
    public ResponseEntity<List<ProductDTO>> getTopSellingProducts() {
        List<ProductDTO> products = productService.getTopSellingProducts();
        return ResponseEntity.ok(products);
    }

    @Operation(summary = "Lấy 10 sản phẩm được đánh giá cao nhất", description = "Trả về 10 sản phẩm có số lượng đánh giá và sao cao nhất")
    @GetMapping("/top-rated")
    public ResponseEntity<List<ProductDTO>> getTopRatedProducts() {
        List<ProductDTO> products = productService.getTopRatedProducts();
        return ResponseEntity.ok(products);
    }

    @Operation(summary = "Lấy sản phẩm có tồn kho thấp", description = "Trả về danh sách sản phẩm có số lượng tồn kho dưới 10")
    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductDTO>> getLowStockProducts() {
        List<ProductDTO> products = productService.getLowStockProducts();
        return ResponseEntity.ok(products);
    }

    @Operation(summary = "Tìm kiếm sản phẩm theo tên", description = "Tìm sản phẩm có tên chứa từ khóa")
    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO>> searchProductsByName(@RequestParam String keyword) {
        List<ProductDTO> products = productService.searchProductsByName(keyword);
        return ResponseEntity.ok(products);
    }

    @Operation(summary = "Tìm kiếm sản phẩm với bộ lọc", description = "Tìm kiếm theo từ khóa kết hợp bộ lọc nâng cao")
    @GetMapping("/search-filter")
    public ResponseEntity<List<ProductDTO>> searchProductsWithFilters(
            @RequestParam String keyword,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder,
            @RequestParam(required = false) List<String> brandName,
            @RequestParam(required = false) List<String> categoryName,
            @RequestParam(required = false) List<String> visibilityType,
            @RequestParam(required = false) List<String> condition,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice
    ) {
        List<ProductDTO> result = productService.searchWithFilters(
                keyword, sortBy, sortOrder, brandName, categoryName, visibilityType, condition, minPrice, maxPrice
        );
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Lấy sản phẩm theo ID", description = "Trả về chi tiết sản phẩm theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable String id) {
        Optional<ProductDTO> productDTO = productService.getProductById(id);
        return productDTO.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Lấy sản phẩm theo mã sản phẩm (productId)", description = "Trả về sản phẩm dựa trên mã sản phẩm")
    @GetMapping("/by-product-id/{productId}")
    public ResponseEntity<ProductDTO> getProductByProductId(@PathVariable String productId) {
        Optional<ProductDTO> productDTO = productService.getProductByProductId(productId);
        return productDTO.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Tạo mới sản phẩm", description = "Thêm mới sản phẩm với dữ liệu truyền vào")
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO productDTO) {
        ProductDTO createdProduct = productService.createProduct(productDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    @Operation(summary = "Cập nhật sản phẩm theo ID", description = "Cập nhật thông tin sản phẩm dựa theo ID")
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable String id, @RequestBody ProductDTO productDTO) {
        ProductDTO updatedProduct = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(updatedProduct);
    }

    @Operation(summary = "Cập nhật giá sản phẩm", description = "Cập nhật giá mới cho sản phẩm theo productId")
    @PutMapping("/update-price/{productId}")
    public ResponseEntity<ProductDTO> updateProductPrice(
            @PathVariable String productId,
            @RequestParam double newPrice) {

        try {
            ProductDTO updatedProduct = productService.updateProductPrice(productId, newPrice);

            return ResponseEntity.ok(updatedProduct);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Operation(summary = "Xóa sản phẩm (soft delete)", description = "Xóa sản phẩm bằng cách đánh dấu soft delete")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Ẩn sản phẩm", description = "Ẩn sản phẩm khỏi hiển thị")
    @PutMapping("/hide/{id}")
    public ResponseEntity<Void> hideProduct(@PathVariable String id) {
        productService.hideProduct(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Hiện sản phẩm", description = "Hiển thị sản phẩm đã ẩn")
    @PutMapping("/show/{id}")
    public ResponseEntity<Void> showProduct(@PathVariable String id) {
        productService.showProduct(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Tải ảnh sản phẩm lên", description = "Upload ảnh cho sản phẩm")
    @PostMapping("/upload-image/{productId}")
    public ResponseEntity<String> uploadImage(@PathVariable String productId, @RequestParam MultipartFile file) throws IOException {
        String imageUrl = productService.uploadImage(productId, file);
        return ResponseEntity.ok(imageUrl);
    }

    @Operation(summary = "Xóa ảnh sản phẩm", description = "Xóa ảnh đã upload của sản phẩm")
    @DeleteMapping("/delete-image/{productId}")
    public ResponseEntity<Void> deleteProductImage(@PathVariable String productId, @RequestParam String imageUrl) throws IOException {
        productService.deleteProductImage(productId, imageUrl);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Upload video cho sản phẩm", description = "Upload video mô tả sản phẩm")
    @PostMapping("/upload-video/{productId}")
    public ResponseEntity<String> uploadProductVideo(@PathVariable String productId, @RequestParam MultipartFile file) {
        try {
            String videoUrl = productService.uploadProductVideo(productId, file);
            return ResponseEntity.ok(videoUrl);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Lỗi khi upload video: " + e.getMessage());
        }
    }

    @Operation(summary = "Xóa video của sản phẩm", description = "Xóa video mô tả sản phẩm theo URL")
    @DeleteMapping("/delete-video/{productId}")
    public ResponseEntity<String> deleteProductVideo(@PathVariable String productId, @RequestParam("videoUrl") String videoUrl) {
        try {
            productService.deleteProductVideo(productId, videoUrl);
            return ResponseEntity.ok("Video đã được xóa thành công");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Lỗi khi xóa video: " + e.getMessage());
        }
    }

    @Operation(summary = "Tạo sản phẩm với thời gian lên lịch", description = "Tạo sản phẩm theo thời gian được lên lịch trước")
    @PostMapping("/schedule")
    public ResponseEntity<ProductDTO> scheduleCreateProduct(@RequestBody ProductDTO productDTO) {
        ProductDTO scheduledProduct = productService.scheduleCreateProduct(productDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduledProduct);
    }

    @Operation(summary = "So sánh sản phẩm kèm nhận xét")
    @GetMapping("/compare")
    public ResponseEntity<?> compareProducts(@RequestParam List<String> productIds) {
        if (productIds.size() > 4) {
            return ResponseEntity.badRequest().body("Bạn chỉ có thể so sánh tối đa 4 sản phẩm.");
        }

        try {
            ComparisonResultDTO result = productService.compareProductsWithEvaluation(productIds);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @Operation(summary = "Import sản phẩm từ file Excel", description = "Nhập dữ liệu sản phẩm từ file Excel upload lên")
    @PostMapping("/import-excel")
    public ResponseEntity<String> importProductsFromExcel(@RequestParam("file") MultipartFile file) {
        try {
            productService.importProductsFromExcel(file);
            return ResponseEntity.ok("Import dữ liệu sản phẩm thành công.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi import sản phẩm từ file Excel: " + e.getMessage());
        }
    }

    @Operation(summary = "Xuất danh sách sản phẩm ra file Excel", description = "Xuất toàn bộ danh sách sản phẩm theo thứ tự sắp xếp ra file Excel")
    @GetMapping("/export-excel")
    public ResponseEntity<byte[]> exportProductsToExcel(
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder) {

        try {
            ByteArrayOutputStream outputStream = productService.exportProductsToExcel(sortBy, sortOrder);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=products.xlsx");
            headers.add(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return new ResponseEntity<>(outputStream.toByteArray(), headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi khi xuất file Excel: " + e.getMessage()).getBytes());
        }
    }
}