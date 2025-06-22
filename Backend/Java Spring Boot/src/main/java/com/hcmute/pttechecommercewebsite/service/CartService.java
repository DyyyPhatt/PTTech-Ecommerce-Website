package com.hcmute.pttechecommercewebsite.service;

import com.hcmute.pttechecommercewebsite.dto.CartDTO;
import com.hcmute.pttechecommercewebsite.model.Cart;
import com.hcmute.pttechecommercewebsite.model.Product;
import com.hcmute.pttechecommercewebsite.repository.CartRepository;
import com.hcmute.pttechecommercewebsite.repository.ProductRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    // Chuyển đổi từ CartDTO sang Cart (Model)
    private Cart toModel(CartDTO cartDTO) {
        Cart cart = Cart.builder()
                .id(cartDTO.getId())
                .userId(new ObjectId(cartDTO.getUserId()))
                .totalItems(cartDTO.getItems() != null ? cartDTO.getItems().size() : 0)
                .totalPrice(cartDTO.getItems() != null ? cartDTO.getItems().stream().mapToDouble(CartDTO.ItemDTO::getTotalPrice).sum() : 0.0)
                .isDeleted(false)
                .items(cartDTO.getItems() != null ? cartDTO.getItems().stream().map(this::toModelItem).toList() : new ArrayList<>())
                .build();
        return cart;
    }

    // Chuyển đổi từ ItemDTO sang Item (Model)
    private Cart.Item toModelItem(CartDTO.ItemDTO itemDTO) {
        Cart.Item item = Cart.Item.builder()
                .productId(new ObjectId(itemDTO.getProductId()))
                .variantId(new ObjectId(itemDTO.getVariantId()))
                .brandId(new ObjectId(itemDTO.getBrandId()))
                .categoryId(new ObjectId(itemDTO.getCategoryId()))
                .quantity(itemDTO.getQuantity())
                .productName(itemDTO.getProductName())
                .originalPrice(itemDTO.getOriginalPrice())
                .discountPrice(itemDTO.getDiscountPrice())
                .ratingAverage(itemDTO.getRatingAverage())
                .totalReviews(itemDTO.getTotalReviews())
                .productImage(itemDTO.getProductImage())
                .color(itemDTO.getColor())
                .hexCode(itemDTO.getHexCode())
                .size(itemDTO.getSize())
                .ram(itemDTO.getRam())
                .storage(itemDTO.getStorage())
                .condition(itemDTO.getCondition())
                .stock(itemDTO.getStock())
                .createdAt(itemDTO.getCreatedAt())
                .updatedAt(itemDTO.getUpdatedAt())
                .build();
        // Tính lại tổng giá trị ngay khi chuyển đổi
        item.setTotalPrice(item.getQuantity() * item.getDiscountPrice());
        return item;
    }

    // Chuyển đổi từ Cart (Model) sang CartDTO
    public CartDTO toDTO(Cart cart) {
        CartDTO cartDTO = CartDTO.builder()
                .id(cart.getId())
                .userId(cart.getUserId().toString())
                .totalItems(cart.getTotalItems())
                .totalPrice(cart.getTotalPrice())
                .isDeleted(cart.isDeleted())
                .items(cart.getItems().stream()
                        .map(this::toDTOItem)
                        .toList())
                .build();
        return cartDTO;
    }

    // Chuyển đổi từ Item (Model) sang ItemDTO
    private CartDTO.ItemDTO toDTOItem(Cart.Item item) {
        return CartDTO.ItemDTO.builder()
                .productId(item.getProductId().toString())
                .variantId(item.getVariantId().toString())
                .brandId(item.getBrandId().toString())
                .categoryId(item.getCategoryId().toString())
                .quantity(item.getQuantity())
                .totalPrice(item.getTotalPrice())
                .productName(item.getProductName())
                .originalPrice(item.getOriginalPrice())
                .discountPrice(item.getDiscountPrice())
                .ratingAverage(item.getRatingAverage())
                .totalReviews(item.getTotalReviews())
                .productImage(item.getProductImage())
                .color(item.getColor())
                .hexCode(item.getHexCode())
                .size(item.getSize())
                .ram(item.getRam())
                .storage(item.getStorage())
                .condition(item.getCondition())
                .stock(item.getStock())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    private boolean syncCartItemsWithProductData(Cart cart) {
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            return false;
        }

        List<ObjectId> productIds = cart.getItems().stream()
                .map(Cart.Item::getProductId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        if (productIds.isEmpty()) {
            return false;
        }

        // Dùng MongoTemplate để truy vấn product theo danh sách productIds
        Query query = new Query(Criteria.where("_id").in(productIds));
        List<Product> products = mongoTemplate.find(query, Product.class);

        Map<ObjectId, Product> productMap = products.stream()
                .collect(Collectors.toMap(p -> new ObjectId(p.getId()), Function.identity()));

        boolean updated = false;

        for (Cart.Item item : cart.getItems()) {
            if (item.getProductId() == null) continue;

            Product product = productMap.get(item.getProductId());
            if (product == null) continue;

            boolean itemUpdated = false;

            // Đồng bộ các trường tương tự như trước
            if (!Objects.equals(item.getProductName(), product.getName())) {
                item.setProductName(product.getName());
                itemUpdated = true;
            }

            if (product.getPricing() != null) {
                if (item.getOriginalPrice() != product.getPricing().getOriginal()) {
                    item.setOriginalPrice(product.getPricing().getOriginal());
                    itemUpdated = true;
                }
                if (item.getDiscountPrice() != product.getPricing().getCurrent()) {
                    item.setDiscountPrice(product.getPricing().getCurrent());
                    itemUpdated = true;
                }
            }

            List<String> images = product.getImages();
            if (images != null && !images.isEmpty()) {
                String newImage = images.get(0);
                if (!Objects.equals(newImage, item.getProductImage())) {
                    item.setProductImage(newImage);
                    itemUpdated = true;
                }
            }

            if (product.getRatings() != null) {
                if (item.getRatingAverage() != product.getRatings().getAverage()) {
                    item.setRatingAverage(product.getRatings().getAverage());
                    itemUpdated = true;
                }
                if (item.getTotalReviews() != product.getRatings().getTotalReviews()) {
                    item.setTotalReviews(product.getRatings().getTotalReviews());
                    itemUpdated = true;
                }
            }

            if (product.getVariants() != null && item.getVariantId() != null) {
                Product.Variant matchedVariant = product.getVariants().stream()
                        .filter(v -> v.getVariantId().equals(item.getVariantId()))
                        .findFirst()
                        .orElse(null);

                if (matchedVariant != null) {
                    if (!Objects.equals(item.getColor(), matchedVariant.getColor())) {
                        item.setColor(matchedVariant.getColor());
                        itemUpdated = true;
                    }
                    if (!Objects.equals(item.getRam(), matchedVariant.getRam())) {
                        item.setRam(matchedVariant.getRam());
                        itemUpdated = true;
                    }
                    if (!Objects.equals(item.getStorage(), matchedVariant.getStorage())) {
                        item.setStorage(matchedVariant.getStorage());
                        itemUpdated = true;
                    }
                    if (item.getStock() != matchedVariant.getStock()) {
                        item.setStock(matchedVariant.getStock());
                        itemUpdated = true;
                    }
                }
            }

            if (itemUpdated) {
                item.setTotalPrice(item.getQuantity() * item.getDiscountPrice());
                item.setUpdatedAt(new Date());
                updated = true;
            }
        }

        if (updated) {
            cart.setTotalPrice(cart.getItems().stream().mapToDouble(Cart.Item::getTotalPrice).sum());
            cartRepository.save(cart);
        }

        return updated;
    }

    public List<CartDTO> getAllCarts() {
        Query query = new Query(Criteria.where("isDeleted").is(false));
        List<Cart> carts = mongoTemplate.find(query, Cart.class);

        carts.forEach(this::syncCartItemsWithProductData);

        return carts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CartDTO getCartById(String cartId) {
        Query query = new Query(Criteria.where("_id").is(new ObjectId(cartId))
                .and("isDeleted").is(false));

        Cart cart = mongoTemplate.findOne(query, Cart.class);
        if (cart == null) {
            throw new RuntimeException("Giỏ hàng không tồn tại hoặc đã bị xóa.");
        }

        syncCartItemsWithProductData(cart);
        return toDTO(cart);
    }

    public CartDTO getCartByUserId(ObjectId userId) {
        Query query = new Query(Criteria.where("userId").is(userId)
                .and("isDeleted").is(false));

        Cart cart = mongoTemplate.findOne(query, Cart.class);
        if (cart == null) {
            throw new RuntimeException("Giỏ hàng của người dùng không tồn tại hoặc đã bị xóa.");
        }

        syncCartItemsWithProductData(cart);
        return toDTO(cart);
    }

    // Thêm giỏ hàng mới
    public CartDTO addCart(CartDTO cartDTO) {
        Cart cart = toModel(cartDTO);
        Cart savedCart = cartRepository.save(cart);
        return toDTO(savedCart);
    }

    // Thêm sản phẩm vào giỏ hàng
    public CartDTO addItemToCart(String cartId, CartDTO.ItemDTO itemDTO) {
        Optional<Cart> cartOpt = cartRepository.findByIdAndIsDeletedFalse(cartId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();

            Cart.Item existingItem = findItem(cart, itemDTO.getProductId(), itemDTO.getVariantId());

            if (existingItem != null) {
                int currentQuantity = existingItem.getQuantity();
                int maxAddable = existingItem.getStock() - currentQuantity;
                int quantityToAdd = Math.min(itemDTO.getQuantity(), maxAddable);

                if (quantityToAdd > 0) {
                    existingItem.setQuantity(currentQuantity + quantityToAdd);
                    existingItem.setTotalPrice(existingItem.getQuantity() * existingItem.getDiscountPrice());
                }
            } else {
                int quantityToAdd = Math.min(itemDTO.getQuantity(), itemDTO.getStock());

                if (quantityToAdd > 0) {
                    Cart.Item newItem = toModelItem(itemDTO);
                    newItem.setQuantity(quantityToAdd);
                    newItem.setTotalPrice(quantityToAdd * newItem.getDiscountPrice());
                    cart.getItems().add(newItem);
                }
            }

            cart.setTotalItems(cart.getItems().size());
            cart.setTotalPrice(cart.getItems().stream().mapToDouble(Cart.Item::getTotalPrice).sum());

            try {
                Cart updatedCart = cartRepository.save(cart);
                return toDTO(updatedCart);
            } catch (Exception e) {
                throw new RuntimeException("Lỗi khi lưu giỏ hàng vào cơ sở dữ liệu: " + e.getMessage());
            }
        } else {
            throw new RuntimeException("Giỏ hàng không tồn tại hoặc đã bị xóa.");
        }
    }

    // Xóa sản phẩm khỏi giỏ hàng
    public CartDTO removeItemFromCart(String cartId, String productId, String variantId) {
        Optional<Cart> cartOpt = cartRepository.findByIdAndIsDeletedFalse(cartId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            Cart.Item itemToRemove = findItem(cart, productId, variantId);
            if (itemToRemove != null) {
                cart.getItems().remove(itemToRemove);

                // Cập nhật tổng số sản phẩm và tổng giá trị của giỏ hàng
                cart.setTotalItems(cart.getItems().size());
                cart.setTotalPrice(cart.getItems().stream().mapToDouble(Cart.Item::getTotalPrice).sum());

                Cart updatedCart = cartRepository.save(cart);
                return toDTO(updatedCart);
            } else {
                throw new RuntimeException("Sản phẩm không tồn tại trong giỏ hàng.");
            }
        } else {
            throw new RuntimeException("Giỏ hàng không tồn tại hoặc đã bị xóa.");
        }
    }

    // Tăng số lượng sản phẩm trong giỏ hàng
    public CartDTO increaseItemQuantity(String cartId, String productId, String variantId) {
        Optional<Cart> cartOpt = cartRepository.findByIdAndIsDeletedFalse(cartId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            Cart.Item item = findItem(cart, productId, variantId);

            if (item == null) {
                throw new RuntimeException("Sản phẩm không tồn tại trong giỏ hàng.");
            }

            // Tăng số lượng và tính lại tổng giá trị
            if (item.getQuantity() >= item.getStock()) {
                throw new RuntimeException("Sản phẩm đã đạt số lượng tối đa trong kho.");
            }
            item.setQuantity(item.getQuantity() + 1);
            item.setTotalPrice(item.getQuantity() * item.getDiscountPrice());

            // Cập nhật lại tổng số sản phẩm và tổng giá trị của giỏ hàng
            cart.setTotalItems(cart.getItems().size());
            cart.setTotalPrice(cart.getItems().stream().mapToDouble(Cart.Item::getTotalPrice).sum());

            cartRepository.save(cart);
            return toDTO(cart);
        } else {
            throw new RuntimeException("Giỏ hàng không tồn tại hoặc đã bị xóa.");
        }
    }

    // Giảm số lượng sản phẩm trong giỏ hàng
    public CartDTO decreaseItemQuantity(String cartId, String productId, String variantId) {
        Optional<Cart> cartOpt = cartRepository.findByIdAndIsDeletedFalse(cartId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            Cart.Item item = findItem(cart, productId, variantId);

            // Giảm số lượng và tính lại tổng giá trị
            if (item.getQuantity() > 1) {
                item.setQuantity(item.getQuantity() - 1);
                item.setTotalPrice(item.getQuantity() * item.getDiscountPrice());
            }

            // Cập nhật lại tổng số sản phẩm và tổng giá trị của giỏ hàng
            cart.setTotalItems(cart.getItems().size());
            cart.setTotalPrice(cart.getItems().stream().mapToDouble(Cart.Item::getTotalPrice).sum());

            cartRepository.save(cart);
            return toDTO(cart);
        } else {
            throw new RuntimeException("Giỏ hàng không tồn tại hoặc đã bị xóa.");
        }
    }

    private Cart.Item findItem(Cart cart, String productId, String variantId) {
        return cart.getItems().stream()
                .filter(item -> item.getProductId().toString().equals(productId) && item.getVariantId().toString().equals(variantId))
                .findFirst()
                .orElse(null);
    }

    // Thay đổi biến thể sản phẩm trong giỏ hàng
    public CartDTO changeItemVariant(String cartId, String productId, String oldVariantId, String newVariantId) {
        Optional<Cart> cartOpt = cartRepository.findByIdAndIsDeletedFalse(cartId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            Cart.Item item = findItem(cart, productId, oldVariantId);
            item.setVariantId(new ObjectId(newVariantId));
            cartRepository.save(cart);
            return toDTO(cart);
        } else {
            throw new RuntimeException("Giỏ hàng không tồn tại hoặc đã bị xóa.");
        }
    }

    public CartDTO syncGuestCart(ObjectId userId, List<CartDTO.ItemDTO> guestItems) {
        Cart cart;

        // Kiểm tra cart của user, nếu chưa có thì tạo mới
        Optional<Cart> existingCartOpt = cartRepository.findByUserIdAndIsDeletedFalse(userId);
        if (existingCartOpt.isPresent()) {
            cart = existingCartOpt.get();
        } else {
            cart = Cart.builder()
                    .userId(userId)
                    .items(new ArrayList<>())
                    .totalItems(0)
                    .totalPrice(0.0)
                    .isDeleted(false)
                    .build();
        }

        for (CartDTO.ItemDTO guestItemDTO : guestItems) {
            Cart.Item existingItem = cart.getItems().stream()
                    .filter(item ->
                            item.getProductId().toString().equals(guestItemDTO.getProductId()) &&
                                    item.getVariantId().toString().equals(guestItemDTO.getVariantId()))
                    .findFirst()
                    .orElse(null);

            if (existingItem != null) {
                int newQuantity = existingItem.getQuantity() + guestItemDTO.getQuantity();
                int maxStock = guestItemDTO.getStock();

                existingItem.setQuantity(Math.min(newQuantity, maxStock));
                existingItem.setTotalPrice(existingItem.getQuantity() * existingItem.getDiscountPrice());
                existingItem.setUpdatedAt(guestItemDTO.getUpdatedAt());
            } else {
                Cart.Item newItem = toModelItem(guestItemDTO);
                cart.getItems().add(newItem);
            }
        }

        // Cập nhật lại tổng số item và tổng giá
        cart.setTotalItems(cart.getItems().size());
        cart.setTotalPrice(cart.getItems().stream().mapToDouble(Cart.Item::getTotalPrice).sum());

        // Lưu lại cart
        Cart updatedCart = cartRepository.save(cart);
        return toDTO(updatedCart);
    }

    // Xóa giỏ hàng (xóa mềm)
    public void deleteCart(String cartId) {
        Optional<Cart> cartOpt = cartRepository.findById(cartId);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cart.setDeleted(true);
            cartRepository.save(cart);
        } else {
            throw new RuntimeException("Giỏ hàng không tồn tại.");
        }
    }
}
