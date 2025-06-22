import React, { useState } from "react";
import {
  FaStar,
  FaStarHalf,
  FaShoppingCart,
  FaTrashAlt,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AddToCartModal from "../Modal/AddToCartModal";

const BaseProductCard = ({
  product,
  brands = [],
  showDelete = false,
  onDelete = () => {},
  showFavoriteButton = true,
  favoriteButtonTop = "top-11",
  isFavorited = false,
  onToggleFavorite = () => {},
  showVisibilityBadge = true,
  showDiscountBadge = true,
  discountBadgePosition = "left",
  onClickProduct = null,
  onClickDetail = null,
}) => {
  const navigate = useNavigate();
  const brand = brands.find((b) => b.id === product.brandId);
  const [isModalOpen, setModalOpen] = useState(false);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = rating && rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalf key="half-star" className="text-yellow-400" />);
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<FaStar key={`empty-star-${i}`} className="text-gray-300" />);
    }

    return stars;
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case "Bán Chạy":
        return "bg-red-600 text-white dark:bg-red-500";
      case "Yêu Thích":
        return "bg-pink-600 text-white dark:bg-pink-500";
      case "Nổi Bật":
        return "bg-orange-500 text-white dark:bg-orange-400";
      case "Phổ Biến":
        return "bg-green-500 text-white dark:bg-green-400";
      case "Mới":
        return "bg-blue-500 text-white dark:bg-blue-400";
      case "Khuyến Mãi":
        return "bg-yellow-400 text-black dark:bg-yellow-300";
      case "Bình Thường":
        return "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0₫";
    return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}₫`;
  };

  const totalStock = product?.variants?.reduce(
    (sum, variant) => sum + (variant?.stock || 0),
    0
  );

  const primaryVariant = product?.variants?.[0];
  const lowStock = totalStock <= 20;
  const productImage =
    product?.images?.[0] || "https://via.placeholder.com/150";

  const getConditionStyle = (condition) => {
    switch ((condition || "").toLowerCase()) {
      case "mới":
        return "bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
      case "qua sử dụng":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
      case "hàng trưng bày":
        return "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const handleClick = () => {
    if (onClickProduct) onClickProduct(product);
    navigate(`/product-details/${product?.productId || product?._id || ""}`);
  };

  return (
    <div className="max-w-xs bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden hover:scale-105 transform transition-transform duration-300">
      <div className="relative group">
        <img
          src={productImage}
          alt={product?.name || "Sản phẩm không rõ tên"}
          className="w-full h-56 object-contain p-4 bg-white dark:bg-gray-800 cursor-pointer rounded-t-xl"
          onError={(e) => (e.target.src = "https://placehold.co/400")}
          onClick={handleClick}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center items-center">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700"
            onClick={() => {
              if (onClickDetail) onClickDetail(product);
              handleClick();
            }}
          >
            Xem chi tiết
          </button>
        </div>

        {showVisibilityBadge && product?.visibilityType && (
          <span
            className={`absolute top-2 left-2 px-3 py-1 rounded-full text-sm font-semibold ${getBadgeStyle(
              product.visibilityType
            )}`}
          >
            {product.visibilityType}
          </span>
        )}

        {showDiscountBadge &&
          product?.pricing?.original > product?.pricing?.current && (
            <span
              className={`absolute ${
                discountBadgePosition === "right"
                  ? "top-2 right-2"
                  : "top-10 left-2"
              } bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold`}
            >
              -
              {Math.round(
                ((product.pricing.original - product.pricing.current) /
                  product.pricing.original) *
                  100
              )}
              %
            </span>
          )}

        {showFavoriteButton && (
          <button
            className={`absolute ${favoriteButtonTop} right-2 bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-600 shadow-md backdrop-blur-sm p-2 rounded-full transition-all duration-300 hover:scale-110`}
            onClick={() => onToggleFavorite(product)}
          >
            {isFavorited ? (
              <FaHeart size={14} className="text-red-500" />
            ) : (
              <FaRegHeart
                size={14}
                className="text-gray-600 dark:text-gray-300"
              />
            )}
          </button>
        )}

        {showDelete && (
          <button
            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
            onClick={() => onDelete(product)}
          >
            <FaTrashAlt size={14} />
          </button>
        )}
      </div>

      <div className="p-4 dark:bg-gray-900">
        <div className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">
          {brand?.name || "Không rõ thương hiệu"}
        </div>
        <h2
          className="text-lg font-bold text-gray-800 dark:text-white mb-2 cursor-pointer min-h-14 hover:underline line-clamp-2"
          onClick={handleClick}
        >
          {product?.name || "Sản phẩm không rõ tên"}
        </h2>

        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {renderStars(product?.ratings?.average)}
          </div>
          <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">
            ({product?.ratings?.totalReviews || 0} đánh giá)
          </span>
        </div>

        <div className="flex justify-between items-center mb-3">
          <span
            className={`text-sm font-medium px-3 py-1 rounded-full ${getConditionStyle(
              primaryVariant?.condition
            )}`}
          >
            {primaryVariant?.condition || "Tình trạng không rõ"}
          </span>
          {lowStock && (
            <span className="text-red-500 text-xs">
              Chỉ còn {totalStock} sản phẩm
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-red-600 text-lg font-bold">
            {formatCurrency(product?.pricing?.current)}
          </span>
          {product?.pricing?.original > product?.pricing?.current && (
            <span className="text-gray-500 dark:text-gray-400 line-through text-sm">
              {formatCurrency(product.pricing.original)}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            if (totalStock > 0) setModalOpen(true);
          }}
          disabled={totalStock === 0}
          className={`w-full font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-all duration-300
            ${
              totalStock === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-500 text-white"
            }
          `}
        >
          <FaShoppingCart className="mr-2" />
          {totalStock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
        </button>
      </div>

      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        product={product}
      />
    </div>
  );
};

export default BaseProductCard;
