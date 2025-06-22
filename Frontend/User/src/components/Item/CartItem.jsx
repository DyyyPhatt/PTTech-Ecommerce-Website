import React, { useEffect, useState } from "react";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import {
  FaTag,
  FaCheckCircle,
  FaPaintBrush,
  FaStar,
  FaMemory,
  FaHdd,
} from "react-icons/fa";
import { IoMdResize } from "react-icons/io";
import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import ConfirmModal from "../Modal/ConfirmModal";

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const { productDetail, fetchProductById } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (item.productId) {
      fetchProductById(item.productId);
    }
  }, [item.productId]);

  const handleRemove = () => {
    onRemove(item.productId, item.variantId);
    setIsModalOpen(false);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const isOutOfStock = item.stock === 0;

  return (
    <div
      key={item.productId}
      className="flex flex-col md:flex-row items-start bg-white dark:bg-gray-900 p-5 rounded-xl shadow hover:shadow-lg dark:hover:shadow-black/40 transition-all border border-gray-200 dark:border-gray-700 mb-6"
    >
      <Link to={`/product-details/${productDetail?.productId}`}>
        <img
          src={item.productImage}
          alt={item.productName}
          className="w-28 h-28 object-cover rounded-md border border-gray-300 dark:border-gray-600 mr-4 mb-4 md:mb-0"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/150?text=No+Image";
          }}
        />
      </Link>

      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/product-details/${productDetail?.productId}`}>
            <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:underline">
              {item.productName}
            </h2>
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
            title="Xóa sản phẩm"
          >
            <FiTrash2 size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <FaTag className="inline mr-1 text-blue-400 dark:text-blue-500" />
            <strong>Giá:</strong>{" "}
            <span className="line-through text-gray-400 dark:text-gray-500 mr-1">
              {formatPrice(item.originalPrice)}
            </span>
            {item.discountPrice > 0 && (
              <span className="text-red-500 dark:text-red-400 font-medium">
                {formatPrice(item.discountPrice)}
              </span>
            )}
          </div>

          <div>
            <FaCheckCircle className="inline mr-1 text-green-500 dark:text-green-400" />
            <strong>Tình trạng:</strong> {item.condition}
          </div>

          {item.color && (
            <div>
              <FaPaintBrush className="inline mr-1 text-pink-500 dark:text-pink-400" />
              <strong>Màu sắc:</strong>{" "}
              <span
                className="inline-block w-4 h-4 rounded-full align-middle mr-1 border"
                style={{ backgroundColor: item.hexCode }}
              ></span>
              {item.color}
            </div>
          )}

          {item.size && item.size !== "N/A" && (
            <div>
              <IoMdResize className="inline mr-1 text-pink-500 dark:text-pink-400" />
              <strong>Kích thước:</strong> {item.size}
            </div>
          )}

          {item.ram && item.ram !== "N/A" && (
            <div>
              <FaMemory className="inline mr-1 text-purple-500 dark:text-purple-400" />
              <strong>RAM:</strong> {item.ram}
            </div>
          )}

          {item.storage && item.storage !== "N/A" && (
            <div>
              <FaHdd className="inline mr-1 text-indigo-500 dark:text-indigo-400" />
              <strong>Storage:</strong> {item.storage}
            </div>
          )}

          <div className="text-yellow-500 dark:text-yellow-400 col-span-full">
            <FaStar className="inline mr-1" />
            {item.ratingAverage} ({item.totalReviews} đánh giá)
          </div>
        </div>

        {/* Hiển thị cảnh báo hết hàng nếu stock = 0 */}
        {isOutOfStock && (
          <div className="p-3 mt-4 bg-red-100 text-red-700 rounded-md font-semibold">
            Hết hàng, vui lòng chọn sản phẩm khác.
          </div>
        )}

        {/* Ẩn phần điều chỉnh số lượng nếu hết hàng */}
        {!isOutOfStock && (
          <div className="flex items-center mt-4">
            <button
              onClick={() => {
                if (item.quantity > 1) {
                  onQuantityChange(item.productId, item.variantId, -1);
                }
              }}
              className={`p-2 rounded-full ${
                item.quantity <= 1
                  ? "cursor-not-allowed opacity-50 bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
              }`}
              title={
                item.quantity <= 1 ? "Không thể giảm nữa" : "Giảm số lượng"
              }
              disabled={item.quantity <= 1}
            >
              <FiMinus />
            </button>
            <input
              type="number"
              value={item.quantity}
              min={1}
              max={item.stock}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value)) {
                  const clampedValue = Math.max(1, Math.min(item.stock, value));
                  onQuantityChange(
                    item.productId,
                    item.variantId,
                    clampedValue - item.quantity
                  );
                }
              }}
              onBlur={(e) => {
                let value = parseInt(e.target.value, 10);
                if (isNaN(value) || value < 1) {
                  value = 1;
                } else if (value > item.stock) {
                  value = item.stock;
                }
                if (value !== item.quantity) {
                  onQuantityChange(
                    item.productId,
                    item.variantId,
                    value - item.quantity
                  );
                }
              }}
              className="w-16 text-center mx-2 border border-gray-300 dark:border-gray-600 rounded-md py-1 text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={() => {
                if (item.quantity < item.stock) {
                  onQuantityChange(item.productId, item.variantId, 1);
                }
              }}
              className={`p-2 rounded-full ${
                item.quantity >= item.stock
                  ? "bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
              }`}
              title={
                item.quantity >= item.stock
                  ? `Chỉ còn ${item.stock} sản phẩm trong kho`
                  : "Tăng số lượng"
              }
              disabled={item.quantity >= item.stock}
            >
              <FiPlus />
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRemove}
      />
    </div>
  );
};

export default CartItem;
