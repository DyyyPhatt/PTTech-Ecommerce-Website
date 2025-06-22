package com.hcmute.pttechecommercewebsite.service;

import com.hcmute.pttechecommercewebsite.dto.OrderDTO;
import com.hcmute.pttechecommercewebsite.model.DiscountCode;
import com.hcmute.pttechecommercewebsite.model.Order;
import com.hcmute.pttechecommercewebsite.model.Product;
import com.hcmute.pttechecommercewebsite.repository.CategoryRepository;
import com.hcmute.pttechecommercewebsite.repository.DiscountCodeRepository;
import com.hcmute.pttechecommercewebsite.repository.OrderRepository;
import com.hcmute.pttechecommercewebsite.repository.ProductRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DiscountCodeRepository discountCodeRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private EmailService emailService;

    private final String returnImageDir = "upload-images/returns";
    private final String returnImageUrl = "http://localhost:8081/images/returns";

    private final String returnVideoDir = "upload-videos/returns";
    private final String returnVideoUrl = "http://localhost:8081/videos/returns";

    // Lấy tất cả đơn hàng (có thể lọc theo các điều kiện)
    public List<OrderDTO> getAllOrders(String paymentMethod, String paymentStatus, String orderStatus, String shippingMethod, String sortBy) {
        List<Order> orders;

        // Xử lý lọc theo các tiêu chí
        if (paymentMethod != null) {
            orders = orderRepository.findByPaymentMethodAndIsDeletedFalse(paymentMethod);
        } else if (paymentStatus != null) {
            orders = orderRepository.findByPaymentStatusAndIsDeletedFalse(paymentStatus);
        } else if (orderStatus != null) {
            orders = orderRepository.findByOrderStatusAndIsDeletedFalse(orderStatus);
        } else if (shippingMethod != null) {
            orders = orderRepository.findByShippingMethodAndIsDeletedFalse(shippingMethod);
        } else {
            orders = orderRepository.findByIsDeletedFalse();
        }

        // Sort by (nếu có)
        if ("latest".equals(sortBy)) {
            orders.sort((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()));
        } else if ("oldest".equals(sortBy)) {
            orders.sort((o1, o2) -> o1.getCreatedAt().compareTo(o2.getCreatedAt()));
        }

        // Chuyển từ model sang DTO
        return orders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Lấy đơn hàng theo ID
    public OrderDTO getOrderById(String id) {
        return orderRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    // Lấy đơn hàng theo order_id
    public OrderDTO getOrderByOrderId(String orderId) {
        return orderRepository.findByOrderIdAndIsDeletedFalse(orderId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    // Lấy Top 10 đơn hàng có totalItems cao nhất
    public List<OrderDTO> getTop10OrdersByTotalItems() {
        List<Order> orders = orderRepository.findTop10ByIsDeletedFalseOrderByTotalItemsDesc();
        return orders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Lấy Top 10 đơn hàng có finalPrice cao nhất
    public List<OrderDTO> getTop10OrdersByFinalPrice() {
        List<Order> orders = orderRepository.findTop10ByIsDeletedFalseOrderByFinalPriceDesc();
        return orders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Lấy tất cả đơn hàng của một userId
    public List<OrderDTO> getOrdersByUserId(ObjectId userId) {
        List<Order> orders = orderRepository.findByUserIdAndIsDeletedFalse(userId);
        return orders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Lấy tất cả đơn hàng chứa một productId
    public List<OrderDTO> getOrdersByProductId(ObjectId productId) {
        List<Order> orders = orderRepository.findByItemsProductIdAndIsDeletedFalse(productId);
        return orders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public OrderDTO createOrder(OrderDTO orderDTO, boolean continueWithAvailableItems) {
        // Kiểm tra tồn kho trước
        Map<String, String> outOfStockItems = checkOutOfStockItems(orderDTO.getItems());

        if (!outOfStockItems.isEmpty()) {
            if (!continueWithAvailableItems) {
                throw new IllegalStateException("Một số sản phẩm đã hết hàng: " + outOfStockItems.values());
            } else {
                // Lọc lại chỉ các item còn hàng
                List<OrderDTO.ItemDTO> availableItems = orderDTO.getItems().stream()
                        .filter(item -> !outOfStockItems.containsKey(item.getProductId()))
                        .collect(Collectors.toList());

                // Nếu không còn item nào sau khi lọc → không thể tiếp tục
                if (availableItems.isEmpty()) {
                    throw new IllegalStateException("Tất cả sản phẩm trong đơn hàng đã hết hàng.");
                }

                orderDTO.setItems(availableItems);
            }
        }

        // --- tiếp tục xử lý như logic ban đầu ---
        double totalPrice = 0;
        Set<ObjectId> uniqueVariantProductIds = new HashSet<>();
        for (OrderDTO.ItemDTO itemDTO : orderDTO.getItems()) {
            totalPrice += itemDTO.getDiscountPrice() * itemDTO.getQuantity();
            uniqueVariantProductIds.add(new ObjectId(itemDTO.getVariantId()));
        }

        int totalItems = uniqueVariantProductIds.size();

        double discountAmount = 0;
        if (orderDTO.getDiscountCode() != null && !orderDTO.getDiscountCode().isEmpty()) {
            discountAmount = calculateDiscount(orderDTO.getDiscountCode(), totalPrice, orderDTO.getUserId(), false);
        }

        double shippingPrice = orderDTO.getShippingPrice();
        double finalPrice = totalPrice - discountAmount + shippingPrice;

        Order order = Order.builder()
                .orderId(generateOrderId())
                .userId(new ObjectId(orderDTO.getUserId()))
                .items(convertItemsToModel(orderDTO.getItems()))
                .totalItems(totalItems)
                .totalPrice(totalPrice)
                .shippingPrice(shippingPrice)
                .discountCode(orderDTO.getDiscountCode())
                .discountAmount(discountAmount)
                .finalPrice(finalPrice)
                .receiverName(orderDTO.getReceiverName())
                .phoneNumber(orderDTO.getPhoneNumber())
                .shippingAddress(convertShippingAddressToModel(orderDTO.getShippingAddress()))
                .paymentMethod(orderDTO.getPaymentMethod())
                .shippingMethod(orderDTO.getShippingMethod())
                .paymentStatus("Chưa thanh toán")
                .orderStatus("Chờ xác nhận")
                .isDeleted(false)
                .orderNotes(orderDTO.getOrderNotes())
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        orderRepository.save(order);
        decreaseStockAfterOrder(orderDTO);
        emailService.sendThankYouOrderEmail(order);

        return convertToDTO(order);
    }

    private Map<String, String> checkOutOfStockItems(List<OrderDTO.ItemDTO> items) {
        Map<String, String> outOfStockItems = new HashMap<>();

        for (OrderDTO.ItemDTO item : items) {
            Optional<Product> optionalProduct = productRepository.findByIdAndIsDeletedFalse(item.getProductId());

            if (optionalProduct.isPresent()) {
                Product product = optionalProduct.get();

                for (Product.Variant variant : product.getVariants()) {
                    if (variant.getVariantId().toString().equals(item.getVariantId())) {
                        if (variant.getStock() < item.getQuantity()) {
                            outOfStockItems.put(item.getProductId(), product.getName());
                        }
                        break;
                    }
                }
            } else {
                outOfStockItems.put(item.getProductId(), "Không tìm thấy sản phẩm");
            }
        }

        return outOfStockItems;
    }

    private void decreaseStockAfterOrder(OrderDTO orderDTO) {
        for (OrderDTO.ItemDTO itemDTO : orderDTO.getItems()) {
            Optional<Product> optionalProduct = productRepository.findByIdAndIsDeletedFalse(itemDTO.getProductId());

            // Kiểm tra nếu sản phẩm tồn tại
            if (optionalProduct.isPresent()) {
                Product product = optionalProduct.get();

                // Tìm biến thể tương ứng với variantId
                for (Product.Variant variant : product.getVariants()) {
                    if (variant.getVariantId().toString().equals(itemDTO.getVariantId())) {
                        int updatedStock = variant.getStock() - itemDTO.getQuantity();
                        variant.setStock(updatedStock);

                        // Lưu lại cập nhật vào cơ sở dữ liệu
                        product.setTotalSold(product.getTotalSold() + itemDTO.getQuantity());
                        productRepository.save(product);
                        break;
                    }
                }

            } else {
                System.out.println("Sản phẩm không tìm thấy: " + itemDTO.getProductId());
            }
        }
    }

    private double calculateDiscount(String discountCode, double totalPrice, String userId, boolean isUpdate) {
        // Lấy mã giảm giá từ cơ sở dữ liệu
        DiscountCode discount = discountCodeRepository.findByCodeAndIsActiveTrueAndIsDeletedFalseAndValidDateRange(discountCode, new Date())
                .orElse(null);

        // Nếu không tìm thấy mã giảm giá hợp lệ
        if (discount == null) {
            return 0;
        }

        // Nếu không phải là hành động cập nhật, kiểm tra xem người dùng đã sử dụng mã giảm giá chưa
        if (!isUpdate) {
            if (discount.getUsedByUsers() != null && discount.getUsedByUsers().contains(new ObjectId(userId))) {
                throw new RuntimeException("Mã giảm giá này đã được sử dụng bởi bạn trước đó.");
            }
        }

        // Kiểm tra nếu giá trị đơn hàng (totalPrice) nhỏ hơn số tiền mua tối thiểu để áp dụng mã giảm giá
        if (discount.getMinimumPurchaseAmount() != null && totalPrice < discount.getMinimumPurchaseAmount()) {
            return 0;
        }

        // Kiểm tra loại giảm giá và tính toán giảm giá phù hợp
        double discountAmount = 0;
        if ("percentage".equals(discount.getDiscountType())) {
            discountAmount = totalPrice * (discount.getDiscountValue() / 100);

            if (discount.getMaxDiscountAmount() != null) {
                discountAmount = Math.min(discountAmount, discount.getMaxDiscountAmount());
            }
        } else if ("fixed".equals(discount.getDiscountType())) {
            discountAmount = discount.getDiscountValue();
        }

        discountAmount = Math.min(discountAmount, totalPrice);

        // Cập nhật usageCount và thêm userId vào usedByUsers
        discount.setUsageCount(discount.getUsageCount() + 1);
        if (discount.getUsedByUsers() == null) {
            discount.setUsedByUsers(new ArrayList<>());
        }
        discount.getUsedByUsers().add(new ObjectId(userId));

        // Lưu lại mã giảm giá với các cập nhật
        discountCodeRepository.save(discount);

        return discountAmount;
    }

    // Phương thức kiểm tra và cập nhật trạng thái đơn hàng mỗi 30 phút
    @Scheduled(fixedRate = 1800000) // Chạy mỗi 30 phút (1800000 ms)
    public void updateOrderStatusToWaitingForPickup() {
        Date currentTime = new Date();
        long thirtyMinutesAgo = currentTime.getTime() - (30 * 60 * 1000);

        List<Order> orders = orderRepository.findByOrderStatusAndCreatedAtBefore("Chờ xác nhận", new Date(thirtyMinutesAgo));
        for (Order order : orders) {
            order.setOrderStatus("Chờ lấy hàng");
            order.setUpdatedAt(new Date());

            orderRepository.save(order);
        }
    }

    // Tạo ID đơn hàng duy nhất
    private String generateOrderId() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8);
    }

    // Phương thức cập nhật thông tin đơn hàng
    public OrderDTO updateOrder(String orderId, OrderDTO updatedOrderDTO) {
        // Tìm đơn hàng theo orderId
        Order order = orderRepository.findByIdAndIsDeletedFalse(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại hoặc đã bị xóa"));

        // Kiểm tra trạng thái đơn hàng trước khi cập nhật
        if ("Đã hủy".equals(order.getOrderStatus())) {
            throw new RuntimeException("Đơn hàng đã bị hủy, không thể cập nhật.");
        }

        updateStockAndTotalSoldForUpdatedOrder(order, updatedOrderDTO);

        if (updatedOrderDTO.getItems() != null) {
            order.setItems(convertItemsToModel(updatedOrderDTO.getItems()));
        }

        if (updatedOrderDTO.getShippingAddress() != null) {
            order.setShippingAddress(convertShippingAddressToModel(updatedOrderDTO.getShippingAddress()));
        }

        if (updatedOrderDTO.getReceiverName() != null) {
            order.setReceiverName(updatedOrderDTO.getReceiverName());
        }

        if (updatedOrderDTO.getPhoneNumber() != null) {
            order.setPhoneNumber(updatedOrderDTO.getPhoneNumber());
        }

        if (updatedOrderDTO.getOrderStatus() != null) {
            if ("Đã nhận hàng".equals(updatedOrderDTO.getOrderStatus())) {
                throw new RuntimeException("Không thể thay đổi trạng thái khi đơn hàng đã được nhận.");
            }
            order.setOrderStatus(updatedOrderDTO.getOrderStatus());

            if ("Đã giao".equals(updatedOrderDTO.getOrderStatus())) {
                order.setPaymentStatus("Đã thanh toán");
            }
        }

        if (updatedOrderDTO.getPaymentMethod() != null) {
            order.setPaymentMethod(updatedOrderDTO.getPaymentMethod());
        }

        if (updatedOrderDTO.getShippingMethod() != null) {
            order.setShippingMethod(updatedOrderDTO.getShippingMethod());
        }

        if (updatedOrderDTO.getOrderNotes() != null) {
            order.setOrderNotes(updatedOrderDTO.getOrderNotes());
        }

        // Tính toán lại tổng giá trị của đơn hàng sau khi cập nhật
        double totalPrice = 0;
        Set<ObjectId> uniqueVariantProductIds = new HashSet<>();
        for (OrderDTO.ItemDTO itemDTO : updatedOrderDTO.getItems()) {
            totalPrice += itemDTO.getDiscountPrice() * itemDTO.getQuantity();
            uniqueVariantProductIds.add(new ObjectId(itemDTO.getVariantId()));
        }

        // Tính số lượng loại sản phẩm (distinct product types)
        int totalItems = uniqueVariantProductIds.size();

        // Tính lại giá trị giảm giá (nếu có)
        double discountAmount = 0;
        if (updatedOrderDTO.getDiscountCode() != null && !updatedOrderDTO.getDiscountCode().isEmpty()) {
            discountAmount = calculateDiscount(updatedOrderDTO.getDiscountCode(), totalPrice, updatedOrderDTO.getUserId(), true);
        }

        double shippingPrice = updatedOrderDTO.getShippingPrice();
        double finalPrice = totalPrice - discountAmount + shippingPrice;

        // Cập nhật các thông tin liên quan đến giá trị tổng quan đơn hàng
        order.setTotalPrice(totalPrice);
        order.setTotalItems(totalItems);
        order.setDiscountCode(updatedOrderDTO.getDiscountCode());
        order.setDiscountAmount(discountAmount);
        order.setFinalPrice(finalPrice);
        order.setShippingPrice(shippingPrice);

        // Cập nhật thời gian cập nhật đơn hàng
        order.setUpdatedAt(new Date());

        // Lưu lại đơn hàng đã được cập nhật vào cơ sở dữ liệu
        orderRepository.save(order);

        return convertToDTO(order);
    }

    public void updateStockAndTotalSoldForUpdatedOrder(Order oldOrder, OrderDTO updatedOrderDTO) {
        // Duyệt qua các sản phẩm trong đơn hàng cũ và đơn hàng mới
        for (int i = 0; i < updatedOrderDTO.getItems().size(); i++) {
            OrderDTO.ItemDTO updatedItemDTO = updatedOrderDTO.getItems().get(i);
            Order.Item oldItem = oldOrder.getItems().get(i);

            // Kiểm tra sự thay đổi về số lượng
            int oldQuantity = oldItem.getQuantity();
            int newQuantity = updatedItemDTO.getQuantity();

            if (oldQuantity != newQuantity) {
                int quantityDifference = newQuantity - oldQuantity;

                Optional<Product> optionalProduct = productRepository.findByIdAndIsDeletedFalse(oldItem.getProductId().toString());

                if (optionalProduct.isPresent()) {
                    Product product = optionalProduct.get();

                    for (Product.Variant variant : product.getVariants()) {
                        if (variant.getVariantId().toString().equals(updatedItemDTO.getVariantId())) {
                            if (quantityDifference > 0) {
                                variant.setStock(variant.getStock() - quantityDifference);
                                product.setTotalSold(product.getTotalSold() + quantityDifference);
                            }
                            else {
                                variant.setStock(variant.getStock() + Math.abs(quantityDifference));
                                product.setTotalSold(product.getTotalSold() - Math.abs(quantityDifference));
                            }

                            productRepository.save(product);
                            break;
                        }
                    }
                }
            }
        }
    }

    // Phương thức hủy đơn hàng
    public OrderDTO cancelOrder(String orderId, String cancellationReason) {
        // Tìm đơn hàng theo id
        Order order = orderRepository.findByIdAndIsDeletedFalse(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại hoặc đã bị xóa"));

        // Kiểm tra trạng thái đơn hàng trước khi hủy
        if (!"Chờ xác nhận".equals(order.getOrderStatus()) && !"Chờ lấy hàng".equals(order.getOrderStatus())) {
            throw new RuntimeException("Chỉ các đơn hàng ở trạng thái 'Chờ xác nhận' hoặc 'Chờ lấy hàng' mới có thể hủy");
        }

        // Cập nhật lại tồn kho (tăng lại số lượng khi đơn hàng bị hủy)
        increaseStockForOrder(order);

        order.setOrderStatus("Đã hủy");
        order.setCancellationReason(cancellationReason);
        order.setUpdatedAt(new Date());

        // Lưu lại đơn hàng đã cập nhật
        orderRepository.save(order);
        return convertToDTO(order);
    }

    // Xử lý yêu cầu trả hàng và cập nhật trạng thái đơn hàng
    public OrderDTO requestReturn(String orderId, String returnReason,
                                  List<MultipartFile> images,
                                  List<MultipartFile> videos) throws IOException {

        Order order = orderRepository.findByIdAndIsDeletedFalse(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại hoặc đã bị xóa"));

        // Kiểm tra trạng thái đơn hàng
        if ("Đã hủy".equals(order.getOrderStatus())) {
            throw new RuntimeException("Đơn hàng đã bị hủy, không thể yêu cầu trả hàng.");
        }

        if (!"Đã giao".equals(order.getOrderStatus())) {
            throw new RuntimeException("Đơn hàng phải có trạng thái 'Đã giao' mới có thể yêu cầu trả hàng.");
        }

        // Upload ảnh và video
        List<String> imageUrls = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                String imageUrl = uploadReturnImage(orderId, image);
                imageUrls.add(imageUrl);
            }
        }

        List<String> videoUrls = new ArrayList<>();
        if (videos != null && !videos.isEmpty()) {
            for (MultipartFile video : videos) {
                String videoUrl = uploadReturnVideo(orderId, video);
                videoUrls.add(videoUrl);
            }
        }

        // Cập nhật đơn hàng
        order.setReturnReason(returnReason);
        order.setReturnImageUrls(imageUrls);
        order.setReturnVideoUrls(videoUrls);
        order.setOrderStatus("Yêu cầu trả hàng");
        order.setUpdatedAt(new Date());

        orderRepository.save(order);

        return convertToDTO(order);
    }

    public String uploadReturnImage(String orderId, MultipartFile file) throws IOException {
        Path imageDir = Paths.get(returnImageDir + File.separator + orderId);
        Files.createDirectories(imageDir);

        String imageFileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();
        Path path = imageDir.resolve(imageFileName);
        file.transferTo(path);

        return returnImageUrl + "/" + orderId + "/" + imageFileName;
    }

    public String uploadReturnVideo(String orderId, MultipartFile file) throws IOException {
        Path videoDir = Paths.get(returnVideoDir + File.separator + orderId);
        Files.createDirectories(videoDir);

        String videoFileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();
        Path path = videoDir.resolve(videoFileName);
        file.transferTo(path);

        return returnVideoUrl + "/" + orderId + "/" + videoFileName;
    }

    public void deleteReturnImage(String orderId, String imageUrl) throws IOException {
        String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
        Path filePath = Paths.get(returnImageDir + File.separator + orderId + File.separator + fileName);
        File file = filePath.toFile();

        if (file.exists() && !file.delete()) {
            throw new IOException("Không thể xóa ảnh trả hàng: " + imageUrl);
        }
    }

    public void deleteReturnVideo(String orderId, String videoUrl) throws IOException {
        String fileName = videoUrl.substring(videoUrl.lastIndexOf("/") + 1);
        Path filePath = Paths.get(returnVideoDir + File.separator + orderId + File.separator + fileName);
        File file = filePath.toFile();

        if (file.exists() && !file.delete()) {
            throw new IOException("Không thể xóa video trả hàng: " + videoUrl);
        }
    }

    // Xử lý hoàn tất trả hàng
    public OrderDTO completeReturn(String orderId) {
        // Tìm đơn hàng theo orderId
        Order order = orderRepository.findByIdAndIsDeletedFalse(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại hoặc đã bị xóa"));

        // Kiểm tra trạng thái đơn hàng
        if (!"Yêu cầu trả hàng".equals(order.getOrderStatus())) {
            throw new RuntimeException("Đơn hàng không thể hoàn tất trả hàng vì chưa có yêu cầu trả hàng.");
        }

        // Cập nhật lại số lượng sản phẩm vào kho
        increaseStockForOrder(order);

        // Cập nhật trạng thái đơn hàng thành "Đã trả hàng"
        order.setOrderStatus("Đã trả hàng");
        order.setReturnApproved(true);
        order.setUpdatedAt(new Date());

        // Lưu lại đơn hàng đã cập nhật
        orderRepository.save(order);

        // Gửi email thông báo cho người dùng
        emailService.sendReturnCompletionEmail(order);

        return convertToDTO(order);
    }

    public OrderDTO rejectReturn(String orderId, String rejectionReason) {
        // Tìm đơn hàng theo orderId
        Order order = orderRepository.findByIdAndIsDeletedFalse(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại hoặc đã bị xóa"));

        // Kiểm tra trạng thái đơn hàng để xác nhận có yêu cầu trả hàng
        if (!"Yêu cầu trả hàng".equals(order.getOrderStatus())) {
            throw new RuntimeException("Đơn hàng không thể từ chối trả hàng vì chưa có yêu cầu trả hàng.");
        }

        order.setOrderStatus("Từ chối trả hàng");
        order.setReturnRejectionReason(rejectionReason);
        order.setUpdatedAt(new Date());

        // Lưu lại đơn hàng đã cập nhật
        orderRepository.save(order);

        // Gửi email thông báo cho người dùng về việc từ chối trả hàng
        emailService.sendReturnRejectionEmail(order);

        return convertToDTO(order);
    }

    // Phương thức xóa đơn hàng
    public OrderDTO deleteOrder(String orderId) {
        // Tìm đơn hàng theo id
        Order order = orderRepository.findByIdAndIsDeletedFalse(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại hoặc đã bị xóa"));

        // Kiểm tra trạng thái đơn hàng trước khi xóa
        if ("Đã hủy".equals(order.getOrderStatus())) {
            throw new RuntimeException("Đơn hàng đã bị hủy, không thể xóa.");
        }

        // Cập nhật lại tồn kho (tăng lại số lượng khi xóa đơn hàng)
        increaseStockForOrder(order);

        // Đánh dấu đơn hàng là đã xóa
        order.setDeleted(true);
        order.setUpdatedAt(new Date());

        // Lưu lại đơn hàng đã được cập nhật
        orderRepository.save(order);
        return convertToDTO(order);
    }

    private void increaseStockForOrder(Order order) {
        for (Order.Item item : order.getItems()) {
            Optional<Product> optionalProduct = productRepository.findByIdAndIsDeletedFalse(item.getProductId().toString());
            if (optionalProduct.isPresent()) {
                Product product = optionalProduct.get();
                for (Product.Variant variant : product.getVariants()) {
                    if (variant.getVariantId().toString().equals(item.getVariantId().toString())) {
                        variant.setStock(variant.getStock() + item.getQuantity());
                        product.setTotalSold(product.getTotalSold() - item.getQuantity());
                        productRepository.save(product);
                        break;
                    }
                }
            }
        }
    }

    public void updateOrderPaymentStatus(String orderId, String newStatus) {
        Order order = orderRepository.findByOrderIdAndIsDeletedFalse(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        order.setPaymentStatus(newStatus);
        order.setUpdatedAt(new Date());
        orderRepository.save(order);
    }

    @Scheduled(cron = "0 0 * * * *") // Chạy mỗi giờ
    public void autoDeleteOldVnpayOrders() {
        Date now = new Date();
        List<String> targetStatuses = Arrays.asList("Chưa thanh toán", "Khách hủy giao dịch", "Nghi ngờ gian lận");

        List<Order> orders = orderRepository.findAllByPaymentMethodAndPaymentStatusInAndIsDeletedFalse("VNPay", targetStatuses);

        for (Order order : orders) {
            long diffInMillis = now.getTime() - order.getCreatedAt().getTime();
            long hoursElapsed = TimeUnit.MILLISECONDS.toHours(diffInMillis);

            if (hoursElapsed >= 24) {
                increaseStockForOrder(order);
                order.setDeleted(true);
                order.setUpdatedAt(now);
                orderRepository.save(order);
            }
        }
    }

    public Map<String, Object> getMonthlySpendingAnalytics(ObjectId userId) {
        List<Order> orders = orderRepository.findByUserIdAndIsDeletedFalse(userId);

        Map<YearMonth, Double> monthlySpending = new TreeMap<>();
        Map<YearMonth, Integer> orderCountByMonth = new HashMap<>();
        Map<YearMonth, Double> totalPerMonth = new HashMap<>();
        Map<String, Double> spendingByCategory = new HashMap<>();

        for (Order order : orders) {
            if (order.getCreatedAt() == null || !"Đã thanh toán".equals(order.getPaymentStatus())) continue;

            YearMonth month = YearMonth.from(order.getCreatedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            double finalPrice = order.getFinalPrice();

            // Tổng chi theo tháng
            monthlySpending.put(month, monthlySpending.getOrDefault(month, 0.0) + finalPrice);
            totalPerMonth.put(month, totalPerMonth.getOrDefault(month, 0.0) + finalPrice);
            orderCountByMonth.put(month, orderCountByMonth.getOrDefault(month, 0) + 1);

            // Chi tiêu theo danh mục sản phẩm
            for (Order.Item item : order.getItems()) {
                String category = item.getCategoryId() != null ? item.getCategoryId().toString() : "Không xác định";
                double itemTotal = item.getDiscountPrice() * item.getQuantity();
                spendingByCategory.put(category, spendingByCategory.getOrDefault(category, 0.0) + itemTotal);
            }
        }

        // So sánh tăng giảm chi tiêu giữa 2 tháng gần nhất
        Double percentChange = null;
        List<YearMonth> sortedMonths = new ArrayList<>(monthlySpending.keySet());
        if (sortedMonths.size() >= 2) {
            YearMonth latest = sortedMonths.get(sortedMonths.size() - 1);
            YearMonth previous = sortedMonths.get(sortedMonths.size() - 2);
            double latestTotal = monthlySpending.get(latest);
            double previousTotal = monthlySpending.get(previous);
            if (previousTotal != 0) {
                percentChange = ((latestTotal - previousTotal) / previousTotal) * 100;
            }
        }

        // Danh sách dữ liệu biểu đồ (month, totalSpending)
        List<Map<String, Object>> chartData = monthlySpending.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("month", entry.getKey().toString());
                    map.put("totalSpending", entry.getValue());
                    return map;
                })
                .collect(Collectors.toList());

        // Giá trị trung bình mỗi đơn hàng theo tháng
        Map<YearMonth, Double> avgOrderValueByMonth = new HashMap<>();
        for (YearMonth month : totalPerMonth.keySet()) {
            double total = totalPerMonth.get(month);
            int count = orderCountByMonth.getOrDefault(month, 0);
            avgOrderValueByMonth.put(month, count > 0 ? total / count : 0);
        }

        // Tính tổng chi tiêu để tính % chi tiêu theo danh mục
        double totalSpendingAmount = spendingByCategory.values().stream().mapToDouble(Double::doubleValue).sum();
        Map<String, Double> spendingPercentByCategory = new HashMap<>();
        for (Map.Entry<String, Double> entry : spendingByCategory.entrySet()) {
            spendingPercentByCategory.put(entry.getKey(), totalSpendingAmount > 0 ? (entry.getValue() / totalSpendingAmount) * 100 : 0);
        }

        // Tính tần suất đặt hàng trung bình (số ngày giữa các đơn)
        List<LocalDate> orderDates = orders.stream()
                .filter(o -> "Đã thanh toán".equals(o.getPaymentStatus()) && o.getCreatedAt() != null)
                .map(o -> o.getCreatedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDate())
                .sorted()
                .collect(Collectors.toList());

        long avgDaysBetweenOrders = 0;
        if (orderDates.size() > 1) {
            long totalDays = 0;
            for (int i = 1; i < orderDates.size(); i++) {
                totalDays += ChronoUnit.DAYS.between(orderDates.get(i - 1), orderDates.get(i));
            }
            avgDaysBetweenOrders = totalDays / (orderDates.size() - 1);
        }

        // Gợi ý tiết kiệm mở rộng
        StringBuilder suggestions = new StringBuilder(getSavingSuggestions(orders));

        // Gợi ý danh mục chi tiêu cao (>30%)
        for (Map.Entry<String, Double> entry : spendingPercentByCategory.entrySet()) {
            if (entry.getValue() > 30.0) {
                String categoryId = entry.getKey();
                double percent = entry.getValue();

                categoryRepository.findByIdAndIsDeletedFalse(categoryId).ifPresentOrElse(
                        category -> {
                            suggestions.append(String.format(
                                    "Chi tiêu nhiều ở danh mục %s (%.1f%% tổng chi tiêu). Hãy cân nhắc giảm hoặc tìm ưu đãi.\n",
                                    category.getName(), percent));
                        },
                        () -> {
                            suggestions.append(String.format(
                                    "Chi tiêu nhiều ở danh mục %s (%.1f%% tổng chi tiêu). Hãy cân nhắc giảm hoặc tìm ưu đãi.\n",
                                    categoryId, percent));
                        }
                );

                break;
            }
        }

        // Gợi ý gộp đơn nếu đặt hàng quá thường xuyên (< 3 ngày)
        if (avgDaysBetweenOrders > 0 && avgDaysBetweenOrders < 3) {
            suggestions.append("Bạn đặt hàng khá thường xuyên, hãy cân nhắc gộp đơn để tiết kiệm chi phí vận chuyển.\n");
        }

        // Gợi ý giá trị đơn hàng lớn (>10 triệu)
        for (Double avgValue : avgOrderValueByMonth.values()) {
            if (avgValue > 10000000) {
                suggestions.append("Trung bình giá trị đơn hàng lớn. Cân nhắc mua theo đợt hoặc tìm các ưu đãi giá tốt hơn.\n");
                break;
            }
        }

        // Gợi ý tăng cường dùng mã giảm giá nếu % giảm giá thấp (<5%)
        double totalFinalPrice = orders.stream()
                .filter(o -> "Đã thanh toán".equals(o.getPaymentStatus()))
                .mapToDouble(Order::getFinalPrice)
                .sum();

        double totalDiscount = orders.stream()
                .filter(o -> "Đã thanh toán".equals(o.getPaymentStatus()))
                .mapToDouble(Order::getDiscountAmount)
                .sum();

        if (totalFinalPrice > 0 && (totalDiscount / totalFinalPrice) < 0.05) {
            suggestions.append("Bạn có thể tăng cường sử dụng mã giảm giá hoặc ưu đãi để tiết kiệm hơn.\n");
        }

        // Cảnh báo vượt mức định mức chi tiêu
        double monthlyLimit = 10000000;
        List<String> overLimitMonths = monthlySpending.entrySet().stream()
                .filter(entry -> entry.getValue() > monthlyLimit)
                .map(entry -> entry.getKey().toString())
                .collect(Collectors.toList());

        // Tổng hợp kết quả
        Map<String, Object> response = new HashMap<>();
        response.put("chartData", chartData);
        response.put("monthlyChangePercent", percentChange);
        response.put("spendingByCategory", spendingByCategory);
        response.put("spendingPercentByCategory", spendingPercentByCategory);
        response.put("orderCountByMonth", convertMapToStringKey(orderCountByMonth));
        response.put("avgOrderValueByMonth", convertMapToStringKey(avgOrderValueByMonth));
        response.put("avgDaysBetweenOrders", avgDaysBetweenOrders);
        response.put("suggestions", suggestions.toString());
        response.put("overLimitMonths", overLimitMonths);

        return response;
    }

    // Chuyển Map<YearMonth, ?> thành Map<String, ?>
    private <T> Map<String, T> convertMapToStringKey(Map<YearMonth, T> map) {
        Map<String, T> result = new HashMap<>();
        for (Map.Entry<YearMonth, T> entry : map.entrySet()) {
            result.put(entry.getKey().toString(), entry.getValue());
        }
        return result;
    }

    private String getSavingSuggestions(List<Order> orders) {
        double totalShipping = 0, totalWithoutDiscount = 0, totalDiscount = 0;
        int orderCount = 0;

        for (Order order : orders) {
            if (!"Đã thanh toán".equals(order.getPaymentStatus())) continue;
            orderCount++;
            totalShipping += order.getShippingPrice();
            totalWithoutDiscount += order.getTotalPrice();
            totalDiscount += order.getDiscountAmount();
        }

        StringBuilder suggestions = new StringBuilder("Gợi ý tiết kiệm:\n");

        if (orderCount > 0 && (totalShipping / orderCount) > 15000) {
            suggestions.append("Cân nhắc sử dụng đơn vị vận chuyển miễn phí hoặc gộp đơn để giảm chi phí giao hàng.\n");
        }

        if (totalDiscount == 0) {
            suggestions.append("Bạn chưa sử dụng mã giảm giá nào. Hãy kiểm tra các ưu đãi hiện có.\n");
        }

        if (totalWithoutDiscount > 10000000) {
            suggestions.append("Tổng chi tiêu vượt 10 triệu. Cân nhắc giới hạn ngân sách tháng tới.\n");
        }

        if (suggestions.length() == "Gợi ý tiết kiệm:\n".length()) {
            suggestions.append("Chi tiêu hiện tại hợp lý. Tiếp tục duy trì nhé!");
        }

        return suggestions.toString();
    }

    // Xuất tất cả đơn hàng ra file Excel
    public ByteArrayOutputStream exportOrdersToExcel(String paymentMethod, String paymentStatus, String orderStatus, String shippingMethod, String sortBy) throws IOException {
        // Lấy tất cả đơn hàng từ repository (dữ liệu từ OrderDTO)
        List<OrderDTO> orders = getAllOrders(paymentMethod, paymentStatus, orderStatus, shippingMethod, sortBy);

        // Tạo workbook Excel
        XSSFWorkbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Orders");

        // Định dạng chung cho workbook
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerFont.setColor(IndexedColors.WHITE.getIndex());
        headerStyle.setFont(headerFont);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_50_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // Tạo dòng tiêu đề
        Row headerRow = sheet.createRow(0);
        String[] columns = {
                "ID", "Mã đơn hàng", "Mã người dùng", "Tổng số sản phẩm", "Tổng giá trị",
                "Giá vận chuyển", "Mã giảm giá", "Số tiền giảm giá", "Giá trị cuối", "Tên người nhận", "Số điện thoại",
                "Địa chỉ giao hàng", "Phương thức thanh toán", "Trạng thái thanh toán", "Trạng thái đơn hàng",
                "Phương thức giao hàng", "Ngày tạo", "Ngày cập nhật", "Trạng thái xóa", "Ghi chú"
        };
        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        // Định dạng cho dữ liệu
        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setAlignment(HorizontalAlignment.CENTER);
        dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        // Thêm dữ liệu đơn hàng vào file Excel
        int rowNum = 1;
        for (OrderDTO order : orders) {
            Row row = sheet.createRow(rowNum++);

            // Cột ID
            row.createCell(0).setCellValue(order.getId());
            row.getCell(0).setCellStyle(dataStyle);

            // Cột Mã đơn hàng
            row.createCell(1).setCellValue(order.getOrderId());
            row.getCell(1).setCellStyle(dataStyle);

            // Cột Mã người dùng
            row.createCell(2).setCellValue(order.getUserId());
            row.getCell(2).setCellStyle(dataStyle);

            // Cột Tổng số sản phẩm
            row.createCell(3).setCellValue(order.getTotalItems());
            row.getCell(3).setCellStyle(dataStyle);

            // Cột Tổng giá trị
            row.createCell(4).setCellValue(order.getTotalPrice());
            row.getCell(4).setCellStyle(dataStyle);

            // Cột Giá vận chuyển
            row.createCell(5).setCellValue(order.getShippingPrice());
            row.getCell(5).setCellStyle(dataStyle);

            // Cột Mã giảm giá
            row.createCell(6).setCellValue(order.getDiscountCode() != null ? order.getDiscountCode() : "N/A");
            row.getCell(6).setCellStyle(dataStyle);

            // Cột Số tiền giảm giá
            row.createCell(7).setCellValue(order.getDiscountAmount());
            row.getCell(7).setCellStyle(dataStyle);

            // Cột Giá trị cuối
            row.createCell(8).setCellValue(order.getFinalPrice());
            row.getCell(8).setCellStyle(dataStyle);

            // Cột Tên người nhận
            row.createCell(9).setCellValue(order.getReceiverName());
            row.getCell(9).setCellStyle(dataStyle);

            // Cột Số điện thoại
            row.createCell(10).setCellValue(order.getPhoneNumber());
            row.getCell(10).setCellStyle(dataStyle);

            // Cột Địa chỉ giao hàng
            row.createCell(11).setCellValue(order.getShippingAddress() != null ? order.getShippingAddress().toString() : "N/A");
            row.getCell(11).setCellStyle(dataStyle);

            // Cột Phương thức thanh toán
            row.createCell(12).setCellValue(order.getPaymentMethod());
            row.getCell(12).setCellStyle(dataStyle);

            // Cột Trạng thái thanh toán
            row.createCell(13).setCellValue(order.getPaymentStatus());
            row.getCell(13).setCellStyle(dataStyle);

            // Cột Trạng thái đơn hàng
            row.createCell(14).setCellValue(order.getOrderStatus());
            row.getCell(14).setCellStyle(dataStyle);

            // Cột Phương thức giao hàng
            row.createCell(15).setCellValue(order.getShippingMethod());
            row.getCell(15).setCellStyle(dataStyle);

            // Cột Ngày tạo
            row.createCell(16).setCellValue(order.getCreatedAt() != null ? order.getCreatedAt().toString() : "N/A");
            row.getCell(16).setCellStyle(dataStyle);

            // Cột Ngày cập nhật
            row.createCell(17).setCellValue(order.getUpdatedAt() != null ? order.getUpdatedAt().toString() : "N/A");
            row.getCell(17).setCellStyle(dataStyle);

            // Cột Trạng thái xóa
            row.createCell(18).setCellValue(order.isDeleted() ? "Đã xóa" : "Đang hiển thị");
            row.getCell(18).setCellStyle(dataStyle);

            // Cột Ghi chú
            row.createCell(19).setCellValue(order.getOrderNotes() != null ? order.getOrderNotes() : "N/A");
            row.getCell(19).setCellStyle(dataStyle);
        }

        // Tự động điều chỉnh độ rộng cột theo nội dung
        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // Tạo OutputStream và ghi workbook vào đó
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return outputStream;
    }

    // Chuyển đổi từ Order sang OrderDTO
    private OrderDTO convertToDTO(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .orderId(order.getOrderId())
                .userId(order.getUserId().toString())
                .items(order.getItems().stream().map(item -> OrderDTO.ItemDTO.builder()
                                .productId(item.getProductId().toString())
                                .variantId(item.getVariantId().toString())
                                .brandId(item.getBrandId().toString())
                                .categoryId(item.getCategoryId().toString())
                                .discountPrice(item.getDiscountPrice())
                                .originalPrice(item.getOriginalPrice())
                                .quantity(item.getQuantity())
                                .totalPrice(item.getTotalPrice())
                                .productName(item.getProductName())
                                .color(item.getColor())
                                .hexCode(item.getHexCode())
                                .size(item.getSize())
                                .ram(item.getRam())
                                .storage(item.getStorage())
                                .condition(item.getCondition())
                                .productImage(item.getProductImage())
                                .createdAt(item.getCreatedAt())
                                .updatedAt(item.getUpdatedAt())
                                .build())
                        .collect(Collectors.toList()))
                .totalItems(order.getTotalItems())
                .totalPrice(order.getTotalPrice())
                .shippingPrice(order.getShippingPrice())
                .discountCode(order.getDiscountCode())
                .discountAmount(order.getDiscountAmount())
                .finalPrice(order.getFinalPrice())
                .receiverName(order.getReceiverName())
                .phoneNumber(order.getPhoneNumber())
                .shippingAddress(OrderDTO.ShippingAddressDTO.builder()
                        .street(order.getShippingAddress().getStreet())
                        .communes(order.getShippingAddress().getCommunes())
                        .district(order.getShippingAddress().getDistrict())
                        .city(order.getShippingAddress().getCity())
                        .country(order.getShippingAddress().getCountry())
                        .build())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .shippingMethod(order.getShippingMethod())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .isDeleted(order.isDeleted())
                .orderNotes(order.getOrderNotes())
                .cancellationReason(order.getCancellationReason())
                .returnReason(order.getReturnReason())
                .returnImageUrls(order.getReturnImageUrls())
                .returnVideoUrls(order.getReturnVideoUrls())
                .isReturnApproved(order.isReturnApproved())
                .returnRejectionReason(order.getReturnRejectionReason())
                .build();
    }

    // Chuyển đổi các ItemDTO sang Item trong Order
    private List<Order.Item> convertItemsToModel(List<OrderDTO.ItemDTO> itemDTOs) {
        return itemDTOs.stream().map(itemDTO -> Order.Item.builder()
                        .productId(new ObjectId(itemDTO.getProductId()))
                        .variantId(new ObjectId(itemDTO.getVariantId()))
                        .brandId(new ObjectId(itemDTO.getBrandId()))
                        .categoryId(new ObjectId(itemDTO.getCategoryId()))
                        .discountPrice(itemDTO.getDiscountPrice())
                        .originalPrice(itemDTO.getOriginalPrice())
                        .quantity(itemDTO.getQuantity())
                        .totalPrice(itemDTO.getTotalPrice())
                        .productName(itemDTO.getProductName())
                        .color(itemDTO.getColor())
                        .hexCode(itemDTO.getHexCode())
                        .size(itemDTO.getSize())
                        .ram(itemDTO.getRam())
                        .storage(itemDTO.getStorage())
                        .condition(itemDTO.getCondition())
                        .productImage(itemDTO.getProductImage())
                        .createdAt(itemDTO.getCreatedAt())
                        .updatedAt(itemDTO.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // Chuyển đổi ShippingAddressDTO sang ShippingAddress
    private Order.ShippingAddress convertShippingAddressToModel(OrderDTO.ShippingAddressDTO shippingAddressDTO) {
        return Order.ShippingAddress.builder()
                .street(shippingAddressDTO.getStreet())
                .communes(shippingAddressDTO.getCommunes())
                .district(shippingAddressDTO.getDistrict())
                .city(shippingAddressDTO.getCity())
                .country(shippingAddressDTO.getCountry())
                .build();
    }
}