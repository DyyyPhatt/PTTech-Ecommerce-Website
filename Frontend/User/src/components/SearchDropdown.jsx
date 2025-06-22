import React from "react";
import { Link } from "react-router-dom";
import { FaStar, FaStarHalf } from "react-icons/fa";
import { HiOutlineSearch } from "react-icons/hi";
import { BsExclamationTriangle } from "react-icons/bs";

const SearchDropdown = ({
  showDropdown,
  searchLoading,
  searchError,
  dropdownResults,
  onClose,
}) => {
  if (!showDropdown) return null;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = rating && rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar
          key={`star-${i}`}
          className="text-yellow-400 dark:text-yellow-400"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FaStarHalf
          key="half-star"
          className="text-yellow-400 dark:text-yellow-400"
        />
      );
    }

    const remaining = 5 - stars.length;
    for (let i = 0; i < remaining; i++) {
      stars.push(
        <FaStar
          key={`empty-${i}`}
          className="text-gray-300 dark:text-gray-600"
        />
      );
    }

    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  const formatCurrency = (amount) =>
    amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) ||
    "0₫";

  return (
    <div
      className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-xl mt-2 z-50 max-h-96 overflow-y-auto border border-gray-200
                 dark:bg-gray-800 dark:border-gray-700 dark:shadow-black/50"
    >
      {searchLoading ? (
        <div className="p-6 flex items-center justify-center gap-3 text-gray-500 animate-pulse dark:text-gray-400">
          <svg
            className="w-6 h-6 text-[#ff5b6a] animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <span>Đang tìm kiếm sản phẩm...</span>
        </div>
      ) : searchError ? (
        <div
          className="p-6 text-center text-red-600 font-medium bg-red-50 rounded flex items-center justify-center gap-2
                        dark:bg-red-900 dark:text-red-400"
        >
          <BsExclamationTriangle className="w-5 h-5" />
          <span>Đã xảy ra lỗi: {searchError}</span>
        </div>
      ) : Array.isArray(dropdownResults) && dropdownResults.length > 0 ? (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {dropdownResults.map((product) => (
            <li
              key={product.id}
              className="hover:bg-[#fff0f2] dark:hover:bg-[#5b1b1b] transition-colors duration-200"
            >
              <Link
                to={`/product-details/${product.productId}`}
                className="flex items-center gap-4 px-4 py-3"
                onClick={onClose}
              >
                <img
                  src={product.images?.[0] || "/default-image.jpg"}
                  alt={product.name}
                  className="w-14 h-14 object-cover rounded border
                             border-gray-200 dark:border-gray-600"
                  onError={(e) =>
                    (e.target.src = "https://placehold.co/100x100?text=Image")
                  }
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold text-[#500009] dark:text-[#ffb3b8] truncate">
                    {product.name}
                  </span>
                  <div className="text-xs flex gap-2 items-center mt-1">
                    <span className="text-[#d70018] font-bold dark:text-[#ff5b6a]">
                      {formatCurrency(product.pricing?.current)}
                    </span>
                    {product.pricing?.original &&
                      product.pricing.original > product.pricing.current && (
                        <span className="line-through text-gray-400 dark:text-gray-500">
                          {formatCurrency(product.pricing.original)}
                        </span>
                      )}
                  </div>
                  <div className="text-xs flex gap-2 mt-1 items-center text-gray-600 dark:text-gray-400">
                    {renderStars(product.ratings?.average)}
                    <span className="text-gray-500 text-[11px] dark:text-gray-400">
                      ({product.ratings?.totalReviews || 0} đánh giá)
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div
          className="p-6 text-center text-gray-500 font-medium bg-gray-50 rounded flex items-center justify-center gap-2
                        dark:bg-gray-700 dark:text-gray-400"
        >
          <HiOutlineSearch className="w-5 h-5" />
          <span>Không tìm thấy sản phẩm nào phù hợp</span>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
