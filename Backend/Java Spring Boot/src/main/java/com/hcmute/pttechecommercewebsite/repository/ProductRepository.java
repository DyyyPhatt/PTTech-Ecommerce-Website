package com.hcmute.pttechecommercewebsite.repository;

import com.hcmute.pttechecommercewebsite.model.Product;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    // Tìm tất cả sản phẩm không bị xóa
    List<Product> findByIsDeletedFalse(Sort sort);

    // Tìm sản phẩm theo ID và không bị xóa
    Optional<Product> findByIdAndIsDeletedFalse(String id);

    // Tìm tất cả sản phẩm không bị xóa
    List<Product> findByIsDeletedFalse();

    // Tìm sản phẩm đã lên lịch và có thời gian lên lịch trước ngày hiện tại
    List<Product> findByScheduledDateBeforeAndIsDeletedFalse(Date scheduledDate);

    // Tìm sản phẩm theo ID mà không bị xóa
    Optional<Product> findById(String id);

    List<Product> findByProductIdInAndIsDeletedFalse(List<String> productIds);
}