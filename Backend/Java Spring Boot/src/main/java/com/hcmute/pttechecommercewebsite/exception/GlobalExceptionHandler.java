package com.hcmute.pttechecommercewebsite.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Xử lý lỗi khi không tìm thấy tài nguyên (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFound(ResourceNotFoundException ex) {
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage()), HttpStatus.NOT_FOUND);
    }

    // Xử lý lỗi chung (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneralException(Exception ex) {
        return new ResponseEntity<>(new ErrorResponse("Đã xảy ra lỗi. Vui lòng thử lại sau."), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ReviewSuspiciousException.class)
    public ResponseEntity<Map<String, String>> handleSuspiciousReview(ReviewSuspiciousException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(QASuspiciousException.class)
    public ResponseEntity<Map<String, Object>> handleSuspiciousQA(QASuspiciousException ex) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", ex.getMessage());
        errorResponse.put("reasons", ex.getReasons());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
}