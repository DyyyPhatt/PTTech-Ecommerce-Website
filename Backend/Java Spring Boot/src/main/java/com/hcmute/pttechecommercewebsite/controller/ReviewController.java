package com.hcmute.pttechecommercewebsite.controller;

import com.hcmute.pttechecommercewebsite.dto.ReviewDTO;
import com.hcmute.pttechecommercewebsite.model.Review;
import com.hcmute.pttechecommercewebsite.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Review Controller", description = "API quản lý đánh giá sản phẩm")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Operation(summary = "Lấy tất cả đánh giá chưa bị xóa")
    @GetMapping
    public ResponseEntity<List<ReviewDTO>> getAllReviews() {
        List<ReviewDTO> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }

    @Operation(summary = "Lấy đánh giá theo ID")
    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable String id) {
        Optional<ReviewDTO> review = reviewService.getReviewById(id);
        return review.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @Operation(summary = "Lấy tất cả đánh giá của người dùng")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByUserId(@PathVariable String userId) {
        List<ReviewDTO> reviews = reviewService.getReviewsByUserId(new ObjectId(userId));
        return ResponseEntity.ok(reviews);
    }

    @Operation(summary = "Lấy tất cả đánh giá của sản phẩm")
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByProductId(@PathVariable String productId) {
        List<ReviewDTO> reviews = reviewService.getReviewsByProductId(new ObjectId(productId));
        return ResponseEntity.ok(reviews);
    }

    @Operation(summary = "Lấy tất cả đánh giá của đơn hàng")
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByOrderId(@PathVariable String orderId) {
        List<ReviewDTO> reviews = reviewService.getReviewsByOrderId(new ObjectId(orderId));
        return ResponseEntity.ok(reviews);
    }

    @Operation(summary = "Thêm đánh giá mới")
    @PostMapping
    public ResponseEntity<ReviewDTO> addReview(@RequestBody Review review) {
        ReviewDTO createdReview = reviewService.addReview(review);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReview);
    }

    @Operation(summary = "Chỉnh sửa đánh giá theo ID")
    @PutMapping("/{id}")
    public ResponseEntity<ReviewDTO> updateReview(@PathVariable String id, @RequestBody Review review) {
        Optional<ReviewDTO> updatedReview = reviewService.updateReview(id, review);
        return updatedReview.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @Operation(summary = "Xóa mềm đánh giá theo ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable String id) {
        boolean isDeleted = reviewService.deleteReview(id);
        return isDeleted ? ResponseEntity.noContent().build() : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @Operation(summary = "Trả lời đánh giá")
    @PostMapping("/reply/{id}")
    public ResponseEntity<ReviewDTO> replyToReview(@PathVariable String id, @RequestParam("replyText") String replyText) {
        Optional<ReviewDTO> reviewWithReply = reviewService.replyToReview(id, replyText);
        return reviewWithReply.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @Operation(summary = "Upload ảnh cho đánh giá")
    @PostMapping("/upload-image/{reviewId}")
    public ResponseEntity<String> uploadReviewImage(
            @PathVariable String reviewId,
            @RequestParam("file") MultipartFile file) throws IOException {
        String imageUrl = reviewService.uploadReviewImage(reviewId, file);
        return ResponseEntity.ok(imageUrl);
    }

    @Operation(summary = "Xóa ảnh khỏi đánh giá")
    @DeleteMapping("/delete-image/{reviewId}")
    public ResponseEntity<Void> deleteReviewImage(
            @PathVariable String reviewId,
            @RequestParam("imageUrl") String imageUrl) throws IOException {
        reviewService.deleteReviewImage(reviewId, imageUrl);
        return ResponseEntity.noContent().build();
    }
}