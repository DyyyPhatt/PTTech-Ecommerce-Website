package com.hcmute.pttechecommercewebsite.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.hcmute.pttechecommercewebsite.dto.ReviewDTO;
import com.hcmute.pttechecommercewebsite.exception.ResourceNotFoundException;
import com.hcmute.pttechecommercewebsite.exception.ReviewSuspiciousException;
import com.hcmute.pttechecommercewebsite.model.Product;
import com.hcmute.pttechecommercewebsite.model.Review;
import com.hcmute.pttechecommercewebsite.repository.ProductRepository;
import com.hcmute.pttechecommercewebsite.repository.ReviewRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private EmailService emailService;

    private final String reviewUploadDir = "upload-images/reviews";
    private final String reviewUploadUrl = "http://localhost:8081/images/reviews";

    // Chuyển đổi từ Review model sang ReviewDTO
    private ReviewDTO convertToDTO(Review review) {
        ReviewDTO.ReplyDTO replyDTO = null;
        if (review.getReply() != null) {
            replyDTO = new ReviewDTO.ReplyDTO(review.getReply().getReplyText(), review.getReply().getReplyDate());
        }

        return ReviewDTO.builder()
                .id(review.getId())
                .productId(review.getProductId().toString())
                .productVariantId(review.getProductVariantId() != null ? review.getProductVariantId().toString() : null)
                .userId(review.getUserId().toString())
                .orderId(review.getOrderId().toString())
                .rating(review.getRating())
                .review(review.getReview())
                .reviewTitle(review.getReviewTitle())
                .images(review.getImages())
                .reply(replyDTO)
                .isDeleted(review.isDeleted())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    // Xem tất cả đánh giá chưa bị xóa
    public List<ReviewDTO> getAllReviews() {
        List<Review> reviews = reviewRepository.findByIsDeletedFalse();
        return reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Xem đánh giá theo ID
    public Optional<ReviewDTO> getReviewById(String id) {
        Optional<Review> review = reviewRepository.findByIdAndIsDeletedFalse(id);
        return review.map(this::convertToDTO);
    }

    // Xem tất cả đánh giá của người dùng
    public List<ReviewDTO> getReviewsByUserId(ObjectId userId) {
        List<Review> reviews = reviewRepository.findByUserIdAndIsDeletedFalse(userId);
        return reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Xem tất cả đánh giá của sản phẩm
    public List<ReviewDTO> getReviewsByProductId(ObjectId productId) {
        List<Review> reviews = reviewRepository.findByProductIdAndIsDeletedFalse(productId);
        return reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Xem tất cả đánh giá của đơn hàng
    public List<ReviewDTO> getReviewsByOrderId(ObjectId orderId) {
        List<Review> reviews = reviewRepository.findByOrderIdAndIsDeletedFalse(orderId);
        return reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Thêm đánh giá mới
    public ReviewDTO addReview(Review review) {
        RestTemplate restTemplate = new RestTemplate();
        String flaskApiUrl = "http://localhost:5000/check-review";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("review", review.getReview());

        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<JsonNode> response = restTemplate.postForEntity(flaskApiUrl, request, JsonNode.class);
        JsonNode responseBody = response.getBody();

        if (responseBody != null) {
            JsonNode dataNode = responseBody.get("data");
            boolean suspicious = dataNode.get("suspicious").asBoolean(false);

            if (suspicious) {
                JsonNode reasonsNode = dataNode.get("reasons");
                List<String> reasons = new ArrayList<>();
                if (reasonsNode != null && reasonsNode.isArray()) {
                    for (JsonNode reason : reasonsNode) {
                        reasons.add(reason.asText());
                    }
                }
                throw new ReviewSuspiciousException("Đánh giá bị nghi ngờ: " + String.join("; ", reasons));
            }
        }

        review.setDeleted(false);
        review.setCreatedAt(new Date());
        review.setUpdatedAt(new Date());

        Review savedReview = reviewRepository.save(review);
        String productId = savedReview.getProductId().toString();
        double newRating = savedReview.getRating();
        updateProductRatings(productId, newRating, 0);

        // Gửi email cảm ơn sau khi đánh giá thành công
        emailService.sendThankYouEmail(savedReview);

        return convertToDTO(savedReview);
    }

    // Cập nhật ratings cho sản phẩm sau khi có đánh giá mới
    private void updateProductRatings(String productId, double newRating, double oldRating) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();

            int totalReviews = product.getRatings().getTotalReviews();
            double averageRating = product.getRatings().getAverage();

            if (oldRating == 0) {
                totalReviews += 1;
                averageRating = (averageRating * (totalReviews - 1) + newRating) / totalReviews;
            } else if (newRating == 0) {
                totalReviews -= 1;
                averageRating = (averageRating * (totalReviews + 1) - oldRating) / totalReviews;
            } else {
                averageRating = (averageRating * totalReviews - oldRating + newRating) / totalReviews;
            }

            product.getRatings().setAverage(averageRating);
            product.getRatings().setTotalReviews(totalReviews);
            productRepository.save(product);
        }
    }

    // Chỉnh sửa đánh giá
    public Optional<ReviewDTO> updateReview(String id, Review review) {
        Optional<Review> existingReview = reviewRepository.findByIdAndIsDeletedFalse(id);
        if (existingReview.isPresent()) {
            Review oldReview = existingReview.get();

            double oldRating = oldReview.getRating();
            double newRating = review.getRating();

            review.setId(id);
            review.setUpdatedAt(new Date());
            Review updatedReview = reviewRepository.save(review);

            if (oldRating != newRating) {
                updateProductRatings(updatedReview.getProductId().toString(), newRating, oldRating);
            }

            return Optional.of(convertToDTO(updatedReview));
        }
        return Optional.empty();
    }

    // Xóa mềm đánh giá
    public boolean deleteReview(String id) {
        Optional<Review> review = reviewRepository.findByIdAndIsDeletedFalse(id);
        if (review.isPresent()) {
            Review existingReview = review.get();

            double oldRating = existingReview.getRating();
            String productId = existingReview.getProductId().toString();

            existingReview.setDeleted(true);
            existingReview.setUpdatedAt(new Date());
            reviewRepository.save(existingReview);

            updateProductRatings(productId, 0, oldRating);

            return true;
        }
        return false;
    }

    // Trả lời đánh giá
    public Optional<ReviewDTO> replyToReview(String id, String replyText) {
        Optional<Review> review = reviewRepository.findByIdAndIsDeletedFalse(id);
        if (review.isPresent()) {
            Review existingReview = review.get();

            if (existingReview.getReply() == null) {
                existingReview.setReply(new Review.Reply(replyText, new java.util.Date()));
            } else {
                existingReview.getReply().setReplyText(replyText);
                existingReview.getReply().setReplyDate(new java.util.Date());
            }

            reviewRepository.save(existingReview);
            return Optional.of(convertToDTO(existingReview));
        }
        return Optional.empty();
    }

    public String uploadReviewImage(String reviewId, MultipartFile file) throws IOException {
        Path reviewImageDir = Paths.get(reviewUploadDir + File.separator + reviewId);
        Files.createDirectories(reviewImageDir);

        String imageFileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();
        Path path = Paths.get(reviewImageDir + File.separator + imageFileName);
        file.transferTo(path);

        return reviewUploadUrl + "/" + reviewId + "/" + imageFileName;
    }

    public void deleteReviewImage(String reviewId, String imageUrl) throws IOException {
        Optional<Review> optionalReview = reviewRepository.findById(reviewId);
        if (!optionalReview.isPresent()) {
            throw new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + reviewId);
        }

        Review review = optionalReview.get();
        List<String> images = review.getImages();

        if (!images.contains(imageUrl)) {
            throw new ResourceNotFoundException("Hình ảnh không tồn tại trong đánh giá");
        }

        // Cập nhật DB
        images.remove(imageUrl);
        review.setImages(images);
        reviewRepository.save(review);

        // Xóa file khỏi ổ đĩa
        String imageFileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
        Path imageFilePath = Paths.get(reviewUploadDir + File.separator + reviewId + File.separator + imageFileName);
        File imageFile = imageFilePath.toFile();

        if (imageFile.exists() && !imageFile.delete()) {
            throw new IOException("Không thể xóa ảnh: " + imageUrl);
        }
    }
}