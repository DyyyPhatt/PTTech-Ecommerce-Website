package com.hcmute.pttechecommercewebsite.controller;

import com.hcmute.pttechecommercewebsite.config.VNPayConfig;
import com.hcmute.pttechecommercewebsite.util.VNPayUtil;
import com.hcmute.pttechecommercewebsite.dto.OrderDTO;
import com.hcmute.pttechecommercewebsite.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Order Controller", description = "Quản lý đơn hàng và thanh toán VNPay")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private VNPayConfig vnPayConfig;

    @Operation(summary = "Lấy danh sách đơn hàng", description = "Có thể lọc theo phương thức thanh toán, trạng thái đơn hàng, trạng thái thanh toán và phương thức giao hàng")
    @GetMapping
    public List<OrderDTO> getAllOrders(@RequestParam(required = false) String paymentMethod,
                                       @RequestParam(required = false) String paymentStatus,
                                       @RequestParam(required = false) String orderStatus,
                                       @RequestParam(required = false) String shippingMethod,
                                       @RequestParam(required = false, defaultValue = "latest") String sortBy) {
        return orderService.getAllOrders(paymentMethod, paymentStatus, orderStatus, shippingMethod, sortBy);
    }

    @Operation(summary = "Lấy đơn hàng theo ID")
    @GetMapping("/{id}")
    public OrderDTO getOrderById(@PathVariable String id) {
        return orderService.getOrderById(id);
    }

    @Operation(summary = "Lấy đơn hàng theo mã đơn hàng")
    @GetMapping("/order-id/{orderId}")
    public OrderDTO getOrderByOrderId(@PathVariable String orderId) {
        return orderService.getOrderByOrderId(orderId);
    }

    @Operation(summary = "Lấy 10 đơn hàng có số lượng sản phẩm cao nhất")
    @GetMapping("/top-10-items")
    public List<OrderDTO> getTop10OrdersByTotalItems() {
        return orderService.getTop10OrdersByTotalItems();
    }

    @Operation(summary = "Lấy 10 đơn hàng có tổng tiền cao nhất")
    @GetMapping("/top-10-price")
    public List<OrderDTO> getTop10OrdersByFinalPrice() {
        return orderService.getTop10OrdersByFinalPrice();
    }

    @Operation(summary = "Lấy tất cả đơn hàng theo ID người dùng")
    @GetMapping("/user/{userId}")
    public List<OrderDTO> getOrdersByUserId(@PathVariable String userId) {
        return orderService.getOrdersByUserId(new ObjectId(userId));
    }

    @Operation(summary = "Lấy tất cả đơn hàng chứa sản phẩm theo ID")
    @GetMapping("/product/{productId}")
    public List<OrderDTO> getOrdersByProductId(@PathVariable String productId) {
        return orderService.getOrdersByProductId(new ObjectId(productId));
    }

    @Operation(summary = "Tạo đơn hàng mới")
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody OrderDTO orderDTO,
            @RequestParam(defaultValue = "false") boolean continueWithAvailableItems) {
        try {
            OrderDTO createdOrder = orderService.createOrder(orderDTO, continueWithAvailableItems);
            return ResponseEntity.ok(createdOrder);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @Operation(summary = "Cập nhật đơn hàng")
    @PutMapping("/{orderId}")
    public ResponseEntity<OrderDTO> updateOrder(@PathVariable String orderId, @RequestBody OrderDTO updatedOrderDTO) {
        try {
            OrderDTO updatedOrder = orderService.updateOrder(orderId, updatedOrderDTO);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @Operation(summary = "Hủy đơn hàng")
    @PostMapping("/cancel/{orderId}")
    public OrderDTO cancelOrder(@PathVariable String orderId, @RequestParam String cancellationReason) {
        return orderService.cancelOrder(orderId, cancellationReason);
    }

    @Operation(summary = "Gửi yêu cầu trả hàng kèm hình ảnh/video")
    @PostMapping(value = "/{orderId}/request-return", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OrderDTO> requestReturn(
            @PathVariable String orderId,
            @RequestParam String returnReason,
            @RequestParam(required = false) List<MultipartFile> images,
            @RequestParam(required = false) List<MultipartFile> videos) {

        try {
            OrderDTO updatedOrder = orderService.requestReturn(orderId, returnReason, images, videos);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException | IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @Operation(summary = "Tải ảnh trả hàng lên")
    @PostMapping("/{orderId}/return/upload-image")
    public ResponseEntity<String> uploadReturnImage(
            @PathVariable String orderId,
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = orderService.uploadReturnImage(orderId, file);
            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi upload ảnh trả hàng: " + e.getMessage());
        }
    }

    @Operation(summary = "Tải video trả hàng lên")
    @PostMapping("/{orderId}/return/upload-video")
    public ResponseEntity<String> uploadReturnVideo(
            @PathVariable String orderId,
            @RequestParam("file") MultipartFile file) {
        try {
            String videoUrl = orderService.uploadReturnVideo(orderId, file);
            return ResponseEntity.ok(videoUrl);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi upload video trả hàng: " + e.getMessage());
        }
    }

    @Operation(summary = "Xóa ảnh trả hàng")
    @DeleteMapping("/{orderId}/return/delete-image")
    public ResponseEntity<String> deleteReturnImage(
            @PathVariable String orderId,
            @RequestParam("imageUrl") String imageUrl) {
        try {
            orderService.deleteReturnImage(orderId, imageUrl);
            return ResponseEntity.ok("Ảnh trả hàng đã được xóa thành công.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xóa ảnh trả hàng: " + e.getMessage());
        }
    }

    @Operation(summary = "Xóa video trả hàng")
    @DeleteMapping("/{orderId}/return/delete-video")
    public ResponseEntity<String> deleteReturnVideo(
            @PathVariable String orderId,
            @RequestParam("videoUrl") String videoUrl) {
        try {
            orderService.deleteReturnVideo(orderId, videoUrl);
            return ResponseEntity.ok("Video trả hàng đã được xóa thành công.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xóa video trả hàng: " + e.getMessage());
        }
    }

    @Operation(summary = "Hoàn tất quy trình trả hàng")
    @PostMapping("/{orderId}/complete-return")
    public ResponseEntity<OrderDTO> completeReturn(@PathVariable String orderId) {
        try {
            OrderDTO updatedOrder = orderService.completeReturn(orderId);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @Operation(summary = "Từ chối yêu cầu trả hàng")
    @PostMapping("/{orderId}/reject-return")
    public ResponseEntity<OrderDTO> rejectReturn(
            @PathVariable String orderId,
            @RequestParam String rejectionReason) {
        try {
            OrderDTO updatedOrder = orderService.rejectReturn(orderId, rejectionReason);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @Operation(summary = "Xóa đơn hàng")
    @DeleteMapping("/{orderId}")
    public OrderDTO deleteOrder(@PathVariable String orderId) {
        return orderService.deleteOrder(orderId);
    }

    @Operation(summary = "Tạo URL thanh toán VNPay")
    @PostMapping("/vnpay/{orderId}")
    public ResponseEntity<String> initiateVNPayPayment(@PathVariable String orderId) {
        try {
            OrderDTO orderDTO = orderService.getOrderByOrderId(orderId);
            if (orderDTO == null) {
                return ResponseEntity.badRequest().body("Đơn hàng không tồn tại");
            }

            double amount = orderDTO.getFinalPrice();
            String paymentUrl = VNPayUtil.getPaymentUrl(orderId, amount, vnPayConfig);
            return ResponseEntity.ok(paymentUrl);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi tạo URL VNPay: " + e.getMessage());
        }
    }

    @Operation(summary = "Xử lý phản hồi IPN từ VNPay")
    @PostMapping("/vnpay/ipn")
    public ResponseEntity<String> handleVNPayIPN(HttpServletRequest request) {
        Map<String, String> vnpParams = VNPayUtil.getVNPayParams(request);
        String vnp_SecureHash = vnpParams.get("vnp_SecureHash");

        if (!VNPayUtil.validateSignature(vnpParams, vnp_SecureHash, vnPayConfig.getVnpHashSecret())) {
            return ResponseEntity.badRequest().body("Sai chữ ký VNPay");
        }

        String txnRef = vnpParams.get("vnp_TxnRef");
        String responseCode = vnpParams.get("vnp_ResponseCode");
        String status = vnpParams.get("vnp_TransactionStatus");

        OrderDTO order = orderService.getOrderByOrderId(txnRef);
        if (order == null || "Đã thanh toán".equals(order.getPaymentStatus())) {
            return ResponseEntity.ok("Đơn hàng đã xử lý hoặc không tồn tại.");
        }

        if ("00".equals(responseCode) && "00".equals(status)) {
            orderService.updateOrderPaymentStatus(txnRef, "Đã thanh toán");
        } else {
            orderService.updateOrderPaymentStatus(txnRef, "Thất bại hoặc bị hủy");
        }

        return ResponseEntity.ok("Xử lý IPN hoàn tất.");
    }

    @Operation(summary = "Xử lý redirect từ VNPay về site")
    @GetMapping("/vnpay/return")
    public ResponseEntity<String> handleVNPayReturn(
            @RequestParam String vnp_ResponseCode,
            @RequestParam String vnp_TransactionStatus,
            @RequestParam String vnp_TxnRef
    ) {
        OrderDTO order = orderService.getOrderByOrderId(vnp_TxnRef);
        if (order == null || "Đã thanh toán".equals(order.getPaymentStatus())) {
            return ResponseEntity.badRequest().body("Giao dịch không hợp lệ hoặc đã được xử lý.");
        }

        if ("00".equals(vnp_ResponseCode) && "00".equals(vnp_TransactionStatus)) {
            orderService.updateOrderPaymentStatus(vnp_TxnRef, "Đã thanh toán");
            return ResponseEntity.ok("Giao dịch thành công.");
        } else if ("07".equals(vnp_ResponseCode)) {
            orderService.updateOrderPaymentStatus(vnp_TxnRef, "Nghi ngờ gian lận");
            return ResponseEntity.ok("Giao dịch nghi ngờ.");
        } else if ("24".equals(vnp_ResponseCode)) {
            orderService.updateOrderPaymentStatus(vnp_TxnRef, "Khách hủy giao dịch");
            return ResponseEntity.ok("Giao dịch đã bị hủy.");
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Giao dịch thất bại.");
    }

    @Operation(summary = "Phân tích chi tiêu hàng tháng của người dùng")
    @GetMapping("/analytics/monthly-spending/{userId}")
    public ResponseEntity<Map<String, Object>> getMonthlySpendingAnalytics(@PathVariable String userId) {
        try {
            Map<String, Object> analytics = orderService.getMonthlySpendingAnalytics(new ObjectId(userId));
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Operation(summary = "Xuất đơn hàng ra file Excel")
    @GetMapping("/export-excel")
    public ResponseEntity<byte[]> exportOrdersToExcel(@RequestParam(required = false) String paymentMethod,
                                                      @RequestParam(required = false) String paymentStatus,
                                                      @RequestParam(required = false) String orderStatus,
                                                      @RequestParam(required = false) String shippingMethod,
                                                      @RequestParam(required = false, defaultValue = "latest") String sortBy) {
        try {
            // Gọi service để lấy danh sách đơn hàng và xuất ra file Excel
            ByteArrayOutputStream outputStream = orderService.exportOrdersToExcel(paymentMethod, paymentStatus, orderStatus, shippingMethod, sortBy);

            // Thiết lập các header HTTP cho response
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=orders.xlsx");
            headers.add(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            // Trả về response chứa dữ liệu file Excel
            return new ResponseEntity<>(outputStream.toByteArray(), headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Lỗi khi xuất file Excel: " + e.getMessage()).getBytes());
        }
    }
}