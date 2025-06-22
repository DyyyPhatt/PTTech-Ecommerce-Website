package com.hcmute.pttechecommercewebsite.service;

import com.hcmute.pttechecommercewebsite.dto.ComparisonResultDTO;
import com.hcmute.pttechecommercewebsite.dto.ProductDTO;
import com.hcmute.pttechecommercewebsite.exception.ResourceNotFoundException;
import com.hcmute.pttechecommercewebsite.model.Product;
import com.hcmute.pttechecommercewebsite.repository.BrandRepository;
import com.hcmute.pttechecommercewebsite.repository.CategoryRepository;
import com.hcmute.pttechecommercewebsite.repository.ProductRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    private String uploadDir = "upload-images/products";
    private String uploadUrl = "http://localhost:8081/images/products";

    private String uploadVideoDir = "upload-videos/products";
    private String uploadVideoUrl = "http://localhost:8081/videos/products";

    @Autowired
    public ProductService(
            ProductRepository productRepository,
            BrandRepository brandRepository,
            CategoryRepository categoryRepository
    ) {
        this.productRepository = productRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
    }

    @Autowired
    private MongoTemplate mongoTemplate;

    // Chuyển Entity thành DTO
    private ProductDTO convertToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .productId(product.getProductId())
                .name(product.getName())
                .brandId(product.getBrandId() != null ? product.getBrandId().toString() : null)
                .categoryId(product.getCategoryId() != null ? product.getCategoryId().toString() : null)
                .description(product.getDescription())
                .pricing(convertPricingToDTO(product.getPricing()))
                .specifications(product.getSpecifications())
                .variants(product.getVariants().stream().map(this::convertVariantToDTO).collect(Collectors.toList()))
                .tags(product.getTags())
                .images(product.getImages())
                .videos(product.getVideos())
                .blog(convertBlogToDTO(product.getBlog()))
                .ratings(convertRatingsToDTO(product.getRatings()))
                .warranty(convertWarrantyToDTO(product.getWarranty()))
                .totalSold(product.getTotalSold())
                .status(product.getStatus())
                .visibilityType(product.getVisibilityType())
                .isDeleted(product.isDeleted())
                .scheduledDate(product.getScheduledDate())
                .build();
    }

    // Chuyển Pricing thành DTO
    private ProductDTO.PricingDTO convertPricingToDTO(Product.Pricing pricing) {
        return ProductDTO.PricingDTO.builder()
                .original(pricing.getOriginal())
                .current(pricing.getCurrent())
                .history(pricing.getHistory().stream()
                        .map(history -> new ProductDTO.PricingDTO.PriceHistoryDTO(history.getPreviousPrice(), history.getNewPrice(), history.getChangedAt()))
                        .collect(Collectors.toList()))
                .build();
    }

    // Chuyển Variant thành DTO
    private ProductDTO.VariantDTO convertVariantToDTO(Product.Variant variant) {
        return ProductDTO.VariantDTO.builder()
                .variantId(variant.getVariantId().toString())
                .color(variant.getColor())
                .hexCode(variant.getHexCode())
                .size(variant.getSize())
                .ram(variant.getRam())
                .storage(variant.getStorage())
                .condition(variant.getCondition())
                .stock(variant.getStock())
                .build();
    }

    // Chuyển Blog thành DTO
    private ProductDTO.BlogDTO convertBlogToDTO(Product.Blog blog) {
        return ProductDTO.BlogDTO.builder()
                .title(blog.getTitle())
                .description(blog.getDescription())
                .content(blog.getContent())
                .publishedDate(blog.getPublishedDate())
                .build();
    }

    // Chuyển Ratings thành DTO
    private ProductDTO.RatingsDTO convertRatingsToDTO(Product.Ratings ratings) {
        return ProductDTO.RatingsDTO.builder()
                .average(ratings.getAverage())
                .totalReviews(ratings.getTotalReviews())
                .build();
    }

    // Chuyển Warranty thành DTO
    private ProductDTO.WarrantyDTO convertWarrantyToDTO(Product.Warranty warranty) {
        return ProductDTO.WarrantyDTO.builder()
                .duration(warranty.getDuration())
                .terms(warranty.getTerms())
                .build();
    }

    private Set<ObjectId> getAllCategoryIdsByNames(List<String> categoryNames) {
        Set<ObjectId> allCategoryIds = new HashSet<>();

        List<ObjectId> rootCategoryIds = categoryRepository.findByNameInIgnoreCase(categoryNames)
                .stream().map(category -> new ObjectId(category.getId())).collect(Collectors.toList());

        for (ObjectId rootId : rootCategoryIds) {
            collectSubcategoryIds(rootId, allCategoryIds);
        }

        return allCategoryIds;
    }

    // Đệ quy tìm các danh mục con
    private void collectSubcategoryIds(ObjectId parentId, Set<ObjectId> collectedIds) {
        if (collectedIds.contains(parentId)) return;

        collectedIds.add(parentId);

        // Tìm danh mục con có parentId này
        List<ObjectId> childIds = categoryRepository.findByParentCategoryId(parentId)
                .stream().map(c -> new ObjectId(c.getId())).collect(Collectors.toList());

        for (ObjectId childId : childIds) {
            collectSubcategoryIds(childId, collectedIds);
        }
    }

    // Lấy tất cả sản phẩm không bị xóa
    public List<ProductDTO> getAllProducts(String sortBy, String sortOrder) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortBy != null ? sortBy : "createdAt");

        Query query = new Query();
        query.addCriteria(Criteria.where("isDeleted").is(false));
        query.with(sort);

        List<Product> products = mongoTemplate.find(query, Product.class);
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<ProductDTO> getAllActiveProducts(
            String sortBy, String sortOrder,
            List<String> brandNames, List<String> categoryNames,
            List<String> visibilityTypes, List<String> conditions, Double minPrice, Double maxPrice) {

        Query query = new Query();
        query.addCriteria(Criteria.where("isDeleted").is(false).and("status").ne("inactive"));

        if (brandNames != null && !brandNames.isEmpty()) {
            List<ObjectId> brandIds = brandRepository.findByNameInIgnoreCase(brandNames)
                    .stream().map(brand -> new ObjectId(brand.getId())).collect(Collectors.toList());
            query.addCriteria(Criteria.where("brandId").in(brandIds));
        }

        if (categoryNames != null && !categoryNames.isEmpty()) {
            Set<ObjectId> allCategoryIds = getAllCategoryIdsByNames(categoryNames);
            query.addCriteria(Criteria.where("categoryId").in(allCategoryIds));
        }

        if (visibilityTypes != null && !visibilityTypes.isEmpty()) {
            query.addCriteria(Criteria.where("visibilityType").in(visibilityTypes));
        }

        if (conditions != null && !conditions.isEmpty()) {
            query.addCriteria(Criteria.where("variants.condition").in(conditions));
        }

        if (minPrice != null || maxPrice != null) {
            Criteria priceCriteria = Criteria.where("pricing.current");
            if (minPrice != null && maxPrice != null) {
                priceCriteria.gte(minPrice).lte(maxPrice);
            } else if (minPrice != null) {
                priceCriteria.gte(minPrice);
            } else {
                priceCriteria.lte(maxPrice);
            }
            query.addCriteria(priceCriteria);
        }

        // Xử lý sắp xếp
        if (sortBy != null) {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
            query.with(Sort.by(direction, sortBy));
        }

        List<Product> products = mongoTemplate.find(query, Product.class);
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Lấy tất cả sản phẩm không bị xóa và không hiển thị
    public List<ProductDTO> getAllInactiveProducts(String sortBy, String sortOrder) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortBy != null ? sortBy : "createdAt");

        Query query = new Query();
        query.addCriteria(Criteria.where("isDeleted").is(false).and("status").is("inactive"));
        query.with(sort);

        List<Product> products = mongoTemplate.find(query, Product.class);
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Lấy top 10 sản phẩm bán chạy nhất (dựa vào sắp xếp giảm dần theo totalSold)
    public List<ProductDTO> getTopSellingProducts() {
        Query query = new Query();
        query.addCriteria(Criteria.where("isDeleted").is(false));
        query.with(Sort.by(Sort.Direction.DESC, "totalSold"));
        query.limit(10);

        List<Product> topSellingProducts = mongoTemplate.find(query, Product.class);
        return topSellingProducts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Lấy top 10 sản phẩm có số lượng đánh giá và số sao cao nhất
    public List<ProductDTO> getTopRatedProducts() {
        Query query = new Query();
        query.addCriteria(Criteria.where("isDeleted").is(false));
        query.with(Sort.by(Sort.Direction.DESC, "ratings.average"));
        query.limit(10);

        List<Product> topRatedProducts = mongoTemplate.find(query, Product.class);
        return topRatedProducts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Lấy những sản phẩm có số lượng tồn kho dưới 10
    public List<ProductDTO> getLowStockProducts() {
        Query query = new Query();
        query.addCriteria(Criteria.where("isDeleted").is(false)
                .and("variants.stock").lt(10));

        List<Product> products = mongoTemplate.find(query, Product.class);
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Lấy sản phẩm theo ID
    public Optional<ProductDTO> getProductById(String id) {
        Query query = new Query();
        query.addCriteria(Criteria.where("_id").is(id).and("isDeleted").is(false));

        Product product = mongoTemplate.findOne(query, Product.class);
        return Optional.ofNullable(product).map(this::convertToDTO);
    }

    public Optional<ProductDTO> getProductByProductId(String productId) {
        Query query = new Query();
        query.addCriteria(Criteria.where("productId").is(productId).and("isDeleted").is(false));

        Product product = mongoTemplate.findOne(query, Product.class);
        return Optional.ofNullable(product).map(this::convertToDTO);
    }

    // Tìm kiếm sản phẩm theo tên
    public List<ProductDTO> searchProductsByName(String keyword) {
        Query query = new Query();
        query.addCriteria(Criteria.where("name").regex(keyword, "i")
                .and("isDeleted").is(false));

        List<Product> products = mongoTemplate.find(query, Product.class);
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<ProductDTO> searchWithFilters(
            String keyword,
            String sortBy, String sortOrder,
            List<String> brandNames, List<String> categoryNames,
            List<String> visibilityTypes, List<String> conditions, Double minPrice, Double maxPrice) {

        Query query = new Query();
        query.addCriteria(Criteria.where("isDeleted").is(false).and("status").ne("inactive"));

        if (keyword != null && !keyword.trim().isEmpty()) {
            query.addCriteria(Criteria.where("name").regex(keyword.trim(), "i"));
        }

        if (brandNames != null && !brandNames.isEmpty()) {
            List<ObjectId> brandIds = brandRepository.findByNameInIgnoreCase(brandNames)
                    .stream().map(brand -> new ObjectId(brand.getId())).collect(Collectors.toList());
            query.addCriteria(Criteria.where("brandId").in(brandIds));
        }

        if (categoryNames != null && !categoryNames.isEmpty()) {
            List<ObjectId> categoryIds = categoryRepository.findByNameInIgnoreCase(categoryNames)
                    .stream().map(category -> new ObjectId(category.getId())).collect(Collectors.toList());
            query.addCriteria(Criteria.where("categoryId").in(categoryIds));
        }

        if (visibilityTypes != null && !visibilityTypes.isEmpty()) {
            query.addCriteria(Criteria.where("visibilityType").in(visibilityTypes));
        }

        if (conditions != null && !conditions.isEmpty()) {
            query.addCriteria(Criteria.where("variants.condition").in(conditions));
        }

        if (minPrice != null || maxPrice != null) {
            Criteria priceCriteria = Criteria.where("pricing.current");
            if (minPrice != null && maxPrice != null) {
                priceCriteria.gte(minPrice).lte(maxPrice);
            } else if (minPrice != null) {
                priceCriteria.gte(minPrice);
            } else {
                priceCriteria.lte(maxPrice);
            }
            query.addCriteria(priceCriteria);
        }

        if (sortBy != null) {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;
            query.with(Sort.by(direction, sortBy));
        }

        List<Product> products = mongoTemplate.find(query, Product.class);
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Thêm mới sản phẩm
    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = Product.builder()
                .productId(productDTO.getProductId())
                .name(productDTO.getName())
                .brandId(productDTO.getBrandId() != null ? new ObjectId(productDTO.getBrandId()) : null)
                .categoryId(productDTO.getCategoryId() != null ? new ObjectId(productDTO.getCategoryId()) : null)
                .description(productDTO.getDescription())
                .pricing(convertPricingFromDTO(productDTO.getPricing()))
                .specifications(productDTO.getSpecifications())
                .variants(productDTO.getVariants().stream().map(this::convertVariantFromDTO).collect(Collectors.toList()))
                .tags(productDTO.getTags())
                .images(productDTO.getImages())
                .videos(productDTO.getVideos())
                .blog(convertBlogFromDTO(productDTO.getBlog()))
                .ratings(productDTO.getRatings() != null ? convertRatingsFromDTO(productDTO.getRatings()) : new Product.Ratings(0, 0))
                .warranty(convertWarrantyFromDTO(productDTO.getWarranty()))
                .totalSold(0)
                .status(productDTO.getStatus())
                .visibilityType("Mới")
                .isDeleted(false)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    // Chuyển Pricing từ DTO
    private Product.Pricing convertPricingFromDTO(ProductDTO.PricingDTO pricingDTO) {
        return Product.Pricing.builder()
                .original(pricingDTO.getOriginal())
                .current(pricingDTO.getCurrent())
                .history(pricingDTO.getHistory().stream()
                        .map(history -> new Product.Pricing.PriceHistory(history.getPreviousPrice(), history.getNewPrice(), history.getChangedAt()))
                        .collect(Collectors.toList()))
                .build();
    }

    // Chuyển Variant từ DTO
    private Product.Variant convertVariantFromDTO(ProductDTO.VariantDTO variantDTO) {
        return Product.Variant.builder()
                .variantId(variantDTO.getVariantId() != null ? new ObjectId(variantDTO.getVariantId()) : new ObjectId())
                .color(variantDTO.getColor())
                .hexCode(variantDTO.getHexCode())
                .size(variantDTO.getSize())
                .ram(variantDTO.getRam())
                .storage(variantDTO.getStorage())
                .condition(variantDTO.getCondition())
                .stock(variantDTO.getStock())
                .build();
    }

    // Chuyển Blog từ DTO
    private Product.Blog convertBlogFromDTO(ProductDTO.BlogDTO blogDTO) {
        return Product.Blog.builder()
                .title(blogDTO.getTitle())
                .description(blogDTO.getDescription())
                .content(blogDTO.getContent())
                .publishedDate(blogDTO.getPublishedDate())
                .build();
    }

    // Chuyển Ratings từ DTO
    private Product.Ratings convertRatingsFromDTO(ProductDTO.RatingsDTO ratingsDTO) {
        return Product.Ratings.builder()
                .average(ratingsDTO.getAverage())
                .totalReviews(ratingsDTO.getTotalReviews())
                .build();
    }

    // Chuyển Warranty từ DTO
    private Product.Warranty convertWarrantyFromDTO(ProductDTO.WarrantyDTO warrantyDTO) {
        return Product.Warranty.builder()
                .duration(warrantyDTO.getDuration())
                .terms(warrantyDTO.getTerms())
                .build();
    }

    // Tạo danh mục với thời gian lên lịch
    public ProductDTO scheduleCreateProduct(ProductDTO productDTO) {
        if (productDTO.getScheduledDate() != null && productDTO.getScheduledDate().before(new Date())) {
            throw new IllegalArgumentException("Thời gian phải trong tương lai.");
        }

        // Chuyển ProductDTO thành Product entity
        Product newProduct = Product.builder()
                .productId(productDTO.getProductId())
                .name(productDTO.getName())
                .brandId(productDTO.getBrandId() != null ? new ObjectId(productDTO.getBrandId()) : null)
                .categoryId(productDTO.getCategoryId() != null ? new ObjectId(productDTO.getCategoryId()) : null)
                .description(productDTO.getDescription())
                .pricing(convertPricingFromDTO(productDTO.getPricing()))
                .specifications(productDTO.getSpecifications())
                .variants(productDTO.getVariants().stream().map(this::convertVariantFromDTO).collect(Collectors.toList()))
                .tags(productDTO.getTags())
                .images(productDTO.getImages())
                .videos(productDTO.getVideos())
                .blog(convertBlogFromDTO(productDTO.getBlog()))
                .ratings(productDTO.getRatings() != null ? convertRatingsFromDTO(productDTO.getRatings()) : new Product.Ratings(0, 0))
                .warranty(convertWarrantyFromDTO(productDTO.getWarranty()))
                .totalSold(0)
                .status("inactive")
                .visibilityType("Mới")
                .isDeleted(false)
                .scheduledDate(productDTO.getScheduledDate())
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        productRepository.save(newProduct);
        return convertToDTO(newProduct);
    }

    // Kiểm tra và kích hoạt sản phẩm khi đến thời gian lên lịch
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkAndActivateScheduledProducts() {
        Date now = new Date();
        List<Product> scheduledProducts = productRepository.findByScheduledDateBeforeAndIsDeletedFalse(now);

        for (Product product : scheduledProducts) {
            product.setStatus("active");
            product.setScheduledDate(null);
            product.setUpdatedAt(now);
            productRepository.save(product);
        }
    }

    // Phương thức sẽ tự động chạy mỗi ngày vào lúc 00:00
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void updateVisibilityTypeForAllProducts() {
        Date now = new Date();
        List<Product> products = productRepository.findByIsDeletedFalse();

        for (Product product : products) {
            updateVisibilityTypeBasedOnCriteria(product, now);
        }
    }

    private void updateVisibilityTypeBasedOnCriteria(Product product, Date now) {
        String currentVisibility = product.getVisibilityType();
        String newVisibility = calculateVisibilityType(product, now);

        if (!Objects.equals(currentVisibility, newVisibility)) {
            product.setVisibilityType(newVisibility);
            product.setUpdatedAt(now);
            productRepository.save(product);
        }
    }

    private String calculateVisibilityType(Product product, Date now) {
        int totalSold = product.getTotalSold();
        double averageRating = product.getRatings() != null ? product.getRatings().getAverage() : 0.0;
        int totalReviews = product.getRatings() != null ? product.getRatings().getTotalReviews() : 0;
        Date createdAt = product.getCreatedAt();

        boolean isNew = createdAt != null && isNewProduct(createdAt, now);
        boolean isOnSale = isProductOnSale(product);
        boolean isHighlyRated = averageRating >= 4.5 && totalReviews >= 50;

        // --- Ưu tiên thứ tự hiển thị ---
        if (isOnSale) return "Khuyến Mãi";
        if (totalSold >= 300) return "Bán Chạy";
        if (isHighlyRated) return "Yêu Thích";
        if (totalSold >= 150) return "Nổi Bật";
        if (totalSold >= 50) return "Phổ Biến";
        if (isNew) return "Mới";

        return "Cơ Bản";
    }

    private boolean isNewProduct(Date createdAt, Date now) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(now);
        cal.add(Calendar.DAY_OF_MONTH, -30);
        Date thirtyDaysAgo = cal.getTime();
        return createdAt.after(thirtyDaysAgo);
    }

    private boolean isProductOnSale(Product product) {
        if (product.getPricing() == null) return false;
        double original = product.getPricing().getOriginal();
        double current = product.getPricing().getCurrent();

        return original > current && ((original - current) / original) >= 0.25;
    }

    // Tạo một tên tệp duy nhất cho ảnh và lưu vào thư mục
    public String uploadImage(String productId, MultipartFile file) throws IOException {
        Path productImageDir = Paths.get(uploadDir + File.separator + productId);
        Files.createDirectories(productImageDir);

        // Tạo tên tệp duy nhất cho ảnh
        String imageFileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();
        Path path = Paths.get(productImageDir + File.separator + imageFileName);
        file.transferTo(path);

        return uploadUrl + "/" + productId + "/" + imageFileName;
    }

    // Xóa ảnh của sản phẩm
    public void deleteProductImage(String productId, String imageUrl) throws IOException {
        // Lấy sản phẩm từ database
        Optional<Product> optionalProduct = productRepository.findByIdAndIsDeletedFalse(productId);
        if (!optionalProduct.isPresent()) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }

        Product product = optionalProduct.get();

        // Kiểm tra và xóa ảnh trong danh sách images của sản phẩm
        List<String> images = product.getImages();
        if (!images.contains(imageUrl)) {
            throw new ResourceNotFoundException("Hình ảnh không tồn tại trong danh sách sản phẩm");
        }

        // Xóa ảnh khỏi danh sách
        images.remove(imageUrl);
        product.setImages(images);

        // Lưu lại sản phẩm sau khi xóa hình ảnh
        productRepository.save(product);

        // Xóa tệp ảnh khỏi hệ thống
        String imageFileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
        Path imageFilePath = Paths.get(uploadDir + File.separator + productId + File.separator + imageFileName);
        File imageFile = imageFilePath.toFile();

        // Xóa tệp ảnh nếu tồn tại
        if (imageFile.exists() && !imageFile.delete()) {
            throw new IOException("Không thể xóa tệp ảnh: " + imageUrl);
        }
    }

    // Phương thức upload video cho sản phẩm
    public String uploadProductVideo(String productId, MultipartFile file) throws IOException {
        Path productVideoDir = Paths.get(uploadVideoDir + File.separator + productId);
        Files.createDirectories(productVideoDir);

        String videoFileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();
        Path path = Paths.get(productVideoDir + File.separator + videoFileName);
        file.transferTo(path);

        return uploadVideoUrl + "/" + productId + "/" + videoFileName;
    }

    // Phương thức xóa video của sản phẩm
    public void deleteProductVideo(String productId, String videoUrl) throws IOException {
        Optional<Product> optionalProduct = productRepository.findByIdAndIsDeletedFalse(productId);
        if (!optionalProduct.isPresent()) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }

        Product product = optionalProduct.get();

        List<String> videos = product.getVideos();
        if (videos.contains(videoUrl)) {
            videos.remove(videoUrl);
            product.setVideos(videos);
            productRepository.save(product);

            String videoFileName = videoUrl.substring(videoUrl.lastIndexOf("/") + 1);
            Path videoFilePath = Paths.get(uploadVideoDir + File.separator + productId + File.separator + videoFileName);
            File videoFile = videoFilePath.toFile();
            if (videoFile.exists() && !videoFile.delete()) {
                throw new IOException("Không thể xóa video: " + videoUrl);
            }
        } else {
            throw new ResourceNotFoundException("Video không tồn tại trong danh sách sản phẩm");
        }
    }

    // Chỉnh sửa sản phẩm
    public ProductDTO updateProduct(String id, ProductDTO productDTO) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            product.setName(productDTO.getName());
            product.setDescription(productDTO.getDescription());
            product.setBrandId(productDTO.getBrandId() != null ? new ObjectId(productDTO.getBrandId()) : null);
            product.setCategoryId(productDTO.getCategoryId() != null ? new ObjectId(productDTO.getCategoryId()) : null);
            product.setPricing(convertPricingFromDTO(productDTO.getPricing()));
            product.setSpecifications(productDTO.getSpecifications());
            product.setVariants(productDTO.getVariants().stream().map(this::convertVariantFromDTO).collect(Collectors.toList()));
            product.setTags(productDTO.getTags());
            product.setImages(productDTO.getImages());
            product.setVideos(productDTO.getVideos());
            product.setBlog(convertBlogFromDTO(productDTO.getBlog()));
            product.setRatings(convertRatingsFromDTO(productDTO.getRatings()));
            product.setWarranty(convertWarrantyFromDTO(productDTO.getWarranty()));
            product.setTotalSold(productDTO.getTotalSold());
            product.setStatus(productDTO.getStatus());
            product.setVisibilityType(productDTO.getVisibilityType());
            product.setUpdatedAt(new Date());

            Product updatedProduct = productRepository.save(product);
            return convertToDTO(updatedProduct);
        } else {
            throw new ResourceNotFoundException("Sản phẩm không tồn tại.");
        }
    }

    // Cập nhật giá và lưu lại lịch sử giá
    public ProductDTO updateProductPrice(String productId, double newPrice) {
        Optional<Product> productOpt = productRepository.findById(productId);

        if (productOpt.isEmpty()) {
            throw new ResourceNotFoundException("Sản phẩm không tồn tại");
        }

        Product product = productOpt.get();
        double previousPrice = product.getPricing().getCurrent();
        product.getPricing().setCurrent(newPrice);

        // Lưu lại lịch sử thay đổi giá
        Product.Pricing.PriceHistory priceHistory = new Product.Pricing.PriceHistory();
        priceHistory.setPreviousPrice(previousPrice);
        priceHistory.setNewPrice(newPrice);
        priceHistory.setChangedAt(new Date());

        // Thêm lịch sử giá vào danh sách lịch sử giá
        if (product.getPricing().getHistory() == null) {
            product.getPricing().setHistory(new ArrayList<>());
        }
        product.getPricing().getHistory().add(priceHistory);

        // Cập nhật sản phẩm với giá mới và lịch sử
        product.setUpdatedAt(new Date());
        productRepository.save(product);
        return convertToDTO(product);
    }

    // Ẩn sản phẩm
    public void hideProduct(String id) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            product.setStatus("inactive");
            product.setUpdatedAt(new Date());
            productRepository.save(product);
        } else {
            throw new ResourceNotFoundException("Sản phẩm không tồn tại.");
        }
    }

    // Hiện sản phẩm
    public void showProduct(String id) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            product.setStatus("active");
            product.setUpdatedAt(new Date());
            productRepository.save(product);
        } else {
            throw new ResourceNotFoundException("Sản phẩm không tồn tại.");
        }
    }

    // Xóa sản phẩm
    public void deleteProduct(String id) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            product.setDeleted(true);
            product.setUpdatedAt(new Date());
            productRepository.save(product);
        } else {
            throw new ResourceNotFoundException("Sản phẩm không tồn tại.");
        }
    }

    public ComparisonResultDTO compareProductsWithEvaluation(List<String> productIds) {
        if (productIds.size() > 4) {
            throw new IllegalArgumentException("Chỉ có thể so sánh tối đa 4 sản phẩm.");
        }

        List<Product> products = productRepository.findByProductIdInAndIsDeletedFalse(productIds);

        if (products.size() != productIds.size()) {
            throw new ResourceNotFoundException("Một hoặc nhiều sản phẩm không tồn tại hoặc đã bị xóa.");
        }

        List<ProductDTO> dtos = products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        Map<String, String> evaluations = generateEvaluations(dtos);

        return ComparisonResultDTO.builder()
                .products(dtos)
                .evaluations(evaluations)
                .build();
    }

    private Map<String, String> generateEvaluations(List<ProductDTO> products) {
        Map<String, String> result = new HashMap<>();

        double maxRating = products.stream().mapToDouble(p -> p.getRatings().getAverage()).max().orElse(0);
        double minRating = products.stream().mapToDouble(p -> p.getRatings().getAverage()).min().orElse(0);

        int maxSold = products.stream().mapToInt(ProductDTO::getTotalSold).max().orElse(0);
        int minSold = products.stream().mapToInt(ProductDTO::getTotalSold).min().orElse(0);

        double maxPrice = products.stream().mapToDouble(p -> p.getPricing().getCurrent()).max().orElse(0);
        double minPrice = products.stream().mapToDouble(p -> p.getPricing().getCurrent()).min().orElse(0);

        for (ProductDTO p : products) {
            String name = p.getName();
            double price = p.getPricing().getCurrent();
            double rating = p.getRatings().getAverage();
            int sold = p.getTotalSold();

            StringBuilder evaluation = new StringBuilder("Sản phẩm **" + name + "** ");

            // Giá
            if (price == minPrice) {
                evaluation.append("có mức giá thấp nhất (").append(String.format("%,.0f", price)).append(" VND), ");
            } else if (price == maxPrice) {
                evaluation.append("có mức giá cao nhất (").append(String.format("%,.0f", price)).append(" VND), ");
            } else {
                evaluation.append("có giá trung bình (").append(String.format("%,.0f", price)).append(" VND), ");
            }

            // Đánh giá
            if (rating == maxRating) {
                evaluation.append("được đánh giá cao nhất với ").append(rating).append(" sao, ");
            } else if (rating == minRating) {
                evaluation.append("có mức đánh giá thấp nhất (").append(rating).append(" sao), ");
            } else {
                evaluation.append("có đánh giá trung bình là ").append(rating).append(" sao, ");
            }

            // Số lượng bán
            if (sold == maxSold) {
                evaluation.append("và là sản phẩm bán chạy nhất với ").append(sold).append(" lượt bán.");
            } else if (sold == minSold) {
                evaluation.append("nhưng lại có lượt bán thấp nhất (").append(sold).append(" sản phẩm).");
            } else {
                evaluation.append("với tổng cộng ").append(sold).append(" sản phẩm đã bán.");
            }

            // Thêm đánh giá tổng quan
            if (price == maxPrice && rating == maxRating) {
                evaluation.append(" Mặc dù có giá cao, nhưng chất lượng được đánh giá rất tốt.");
            } else if (price == minPrice && rating == minRating) {
                evaluation.append(" Dù có giá rẻ, nhưng chất lượng có thể không được đánh giá cao.");
            } else if (price == minPrice && rating == maxRating) {
                evaluation.append(" Đây có thể là lựa chọn tối ưu về cả giá và chất lượng.");
            }

            result.put(p.getProductId(), evaluation.toString());
        }

        return result;
    }

    public void importProductsFromExcel(MultipartFile file) throws IOException {
        List<Product> productList = new ArrayList<>();
        XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream());
        XSSFSheet sheet = workbook.getSheetAt(0);

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            // Lấy dữ liệu từ các cột tương ứng
            String productId = getCellString(row.getCell(1));
            String name = getCellString(row.getCell(2));
            String description = getCellString(row.getCell(3));
            double originalPrice = parseDoubleSafe(row.getCell(4));
            double currentPrice = parseDoubleSafe(row.getCell(5));
            String brandIdStr = getCellString(row.getCell(6));
            String categoryIdStr = getCellString(row.getCell(7));
            String specificationsStr = getCellString(row.getCell(8));
            String variantsStr = getCellString(row.getCell(9));
            String tagsStr = getCellString(row.getCell(10));
            String videosStr = getCellString(row.getCell(11));
            String blogTitle = getCellString(row.getCell(12));
            String blogDesc = getCellString(row.getCell(13));
            String blogContent = getCellString(row.getCell(14));
            double avgRating = parseDoubleSafe(row.getCell(15));
            int totalReviews = (int) parseDoubleSafe(row.getCell(16));
            String warrantyDuration = getCellString(row.getCell(17));
            int totalSold = (int) parseDoubleSafe(row.getCell(18));
            String status = getCellString(row.getCell(19));
            String visibilityType = getCellString(row.getCell(20));
            String deletedStr = getCellString(row.getCell(21));
            String scheduleDateStr = getCellString(row.getCell(22));

            // Xử lý các ObjectId
            ObjectId brandId = isValidObjectId(brandIdStr) ? new ObjectId(brandIdStr) : null;
            ObjectId categoryId = isValidObjectId(categoryIdStr) ? new ObjectId(categoryIdStr) : null;

            // Phân tích các thông số kỹ thuật, biến thể, tags, videos
            Map<String, String> specifications = parseKeyValueString(specificationsStr);
            List<Product.Variant> variants = parseVariants(variantsStr);
            List<String> tags = parseList(tagsStr);
            List<String> videos = parseList(videosStr);

            boolean isDeleted = "Đã xóa".equalsIgnoreCase(deletedStr);
            Date scheduledDate = parseDate(scheduleDateStr);

            // Tạo đối tượng Product
            Product product = Product.builder()
                    .productId(productId)
                    .name(name)
                    .description(description)
                    .brandId(brandId)
                    .categoryId(categoryId)
                    .pricing(Product.Pricing.builder()
                            .original(originalPrice)
                            .current(currentPrice)
                            .history(new ArrayList<>())
                            .build())
                    .specifications(specifications)
                    .variants(variants)
                    .tags(tags)
                    .videos(videos)
                    .images(new ArrayList<>()) // Nếu không có cột, để rỗng
                    .blog(Product.Blog.builder()
                            .title(blogTitle)
                            .description(blogDesc)
                            .content(blogContent)
                            .publishedDate(new Date())
                            .build())
                    .ratings(Product.Ratings.builder()
                            .average(avgRating)
                            .totalReviews(totalReviews)
                            .build())
                    .warranty(Product.Warranty.builder()
                            .duration(warrantyDuration)
                            .terms("Không rõ")
                            .build())
                    .totalSold(totalSold)
                    .status(status)
                    .visibilityType(visibilityType != null ? visibilityType : "Mới")
                    .isDeleted(isDeleted)
                    .scheduledDate(scheduledDate)
                    .createdAt(new Date())
                    .updatedAt(new Date())
                    .build();

            productList.add(product);
        }

        productRepository.saveAll(productList);
        workbook.close();
    }

    private String getCellString(Cell cell) {
        if (cell == null) return null;

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> null;
        };
    }

    private boolean isValidObjectId(String id) {
        return id != null && ObjectId.isValid(id);
    }

    private double parseDoubleSafe(Cell cell) {
        try {
            return cell != null && cell.getCellType() == CellType.NUMERIC
                    ? cell.getNumericCellValue()
                    : Double.parseDouble(getCellString(cell));
        } catch (Exception e) {
            return 0.0;
        }
    }

    private Map<String, String> parseKeyValueString(String str) {
        if (str == null || str.isBlank()) return new HashMap<>();
        return Arrays.stream(str.split(","))
                .map(s -> s.split(":"))
                .filter(arr -> arr.length == 2)
                .collect(Collectors.toMap(a -> a[0].trim(), a -> a[1].trim()));
    }

    private List<Product.Variant> parseVariants(String str) {
        if (str == null || str.isBlank()) return new ArrayList<>();
        // Ví dụ chuỗi: "Red;#FF0000;L;8GB;128GB;New;10|Blue;#0000FF;M;4GB;64GB;Used;5"
        return Arrays.stream(str.split("\\|"))
                .map(v -> v.split(";"))
                .filter(arr -> arr.length == 7)
                .map(arr -> Product.Variant.builder()
                        .variantId(new ObjectId())
                        .color(arr[0])
                        .hexCode(arr[1])
                        .size(arr[2])
                        .ram(arr[3])
                        .storage(arr[4])
                        .condition(arr[5])
                        .stock(Integer.parseInt(arr[6]))
                        .build())
                .collect(Collectors.toList());
    }

    private List<String> parseList(String input) {
        return input == null ? new ArrayList<>() :
                Arrays.stream(input.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isBlank())
                        .collect(Collectors.toList());
    }

    private Date parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return java.sql.Timestamp.valueOf(dateStr); // Format: "2023-05-20 10:00:00"
        } catch (Exception e) {
            return null;
        }
    }

    // Xuất tất cả sản phẩm ra file Excel
    public ByteArrayOutputStream exportProductsToExcel(String sortBy, String sortOrder) throws IOException {
        // Lấy tất cả sản phẩm từ repository (dữ liệu từ ProductDTO)
        List<ProductDTO> products = getAllInactiveProducts(sortBy, sortOrder);

        // Tạo workbook Excel
        XSSFWorkbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Products");

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
                "ID", "Mã sản phẩm", "Tên sản phẩm", "Mô tả", "Giá gốc", "Giá hiện tại",
                "Thương hiệu", "Danh mục", "Thông số kỹ thuật", "Biến thể", "Tags",
                "Videos", "Blog Tiêu đề", "Blog Mô tả", "Blog Nội dung", "Đánh giá trung bình",
                "Tổng số lượt đánh giá", "Bảo hành", "Tổng số lượng đã bán","Trạng thái", "Loại hiển thị", "Trạng thái xóa",
                "Thời gian lên lịch"
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

        // Thêm dữ liệu sản phẩm vào file Excel
        int rowNum = 1;
        for (ProductDTO product : products) {
            Row row = sheet.createRow(rowNum++);

            // Cột ID
            row.createCell(0).setCellValue(product.getId());
            row.getCell(0).setCellStyle(dataStyle);

            // Cột Mã sản phẩm
            row.createCell(1).setCellValue(product.getProductId());
            row.getCell(1).setCellStyle(dataStyle);

            // Cột Tên sản phẩm
            row.createCell(2).setCellValue(product.getName());
            row.getCell(2).setCellStyle(dataStyle);

            // Cột Mô tả
            row.createCell(3).setCellValue(product.getDescription());
            row.getCell(3).setCellStyle(dataStyle);

            // Cột Giá gốc
            row.createCell(4).setCellValue(product.getPricing().getOriginal());
            row.getCell(4).setCellStyle(dataStyle);

            // Cột Giá hiện tại
            row.createCell(5).setCellValue(product.getPricing().getCurrent());
            row.getCell(5).setCellStyle(dataStyle);

            // Cột Thương hiệu
            row.createCell(6).setCellValue(product.getBrandId());
            row.getCell(6).setCellStyle(dataStyle);

            // Cột Danh mục
            row.createCell(7).setCellValue(product.getCategoryId());
            row.getCell(7).setCellStyle(dataStyle);

            // Cột Thông số kỹ thuật
            row.createCell(8).setCellValue(product.getSpecifications().toString());
            row.getCell(8).setCellStyle(dataStyle);

            // Cột Biến thể
            row.createCell(9).setCellValue(product.getVariants().toString());
            row.getCell(9).setCellStyle(dataStyle);

            // Cột Tags
            row.createCell(10).setCellValue(String.join(", ", product.getTags()));
            row.getCell(10).setCellStyle(dataStyle);

            // Cột Videos
            row.createCell(11).setCellValue(String.join(", ", product.getVideos()));
            row.getCell(11).setCellStyle(dataStyle);

            // Cột Blog Tiêu đề
            row.createCell(12).setCellValue(product.getBlog() != null ? product.getBlog().getTitle() : "N/A");
            row.getCell(12).setCellStyle(dataStyle);

            // Cột Blog Mô tả
            row.createCell(13).setCellValue(product.getBlog() != null ? product.getBlog().getDescription() : "N/A");
            row.getCell(13).setCellStyle(dataStyle);

            // Cột Blog Nội dung
            row.createCell(14).setCellValue(product.getBlog() != null ? product.getBlog().getContent() : "N/A");
            row.getCell(14).setCellStyle(dataStyle);

            // Cột Đánh giá trung bình
            row.createCell(15).setCellValue(product.getRatings() != null ? product.getRatings().getAverage() : 0.0);
            row.getCell(15).setCellStyle(dataStyle);

            // Cột Tổng số lượt đánh giá
            row.createCell(16).setCellValue(product.getRatings() != null ? product.getRatings().getTotalReviews() : 0);
            row.getCell(16).setCellStyle(dataStyle);

            // Cột Bảo hành
            row.createCell(17).setCellValue(product.getWarranty() != null ? product.getWarranty().getDuration() : "N/A");
            row.getCell(17).setCellStyle(dataStyle);

            // Cột Tổng số lượng đã bán
            row.createCell(18).setCellValue(product.getTotalSold());
            row.getCell(18).setCellStyle(dataStyle);

            // Cột Trạng thái
            row.createCell(19).setCellValue(product.getStatus());
            row.getCell(19).setCellStyle(dataStyle);

            // Cột Loại hiển thị
            row.createCell(20).setCellValue(product.getVisibilityType());
            row.getCell(20).setCellStyle(dataStyle);

            // Cột Trạng thái xóa
            row.createCell(21).setCellValue(product.isDeleted() ? "Đã xóa" : "Đang hiển thị");
            row.getCell(21).setCellStyle(dataStyle);

            // Cột Thời gian lên lịch
            row.createCell(22).setCellValue(product.getScheduledDate() != null ? product.getScheduledDate().toString() : "N/A");
            row.getCell(22).setCellStyle(dataStyle);
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
}