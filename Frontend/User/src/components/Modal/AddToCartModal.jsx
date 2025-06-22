import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { addItemToGuestCart } from "../../utils/cartUtils";
import { FaTimes, FaShoppingCart, FaCheckCircle } from "react-icons/fa";
import Cookies from "js-cookie";
import useCart from "../../hooks/useCart";
import { toast } from "react-toastify";

const AddToCartModal = ({ isOpen, onClose, product }) => {
  const userId = Cookies.get("userId");
  const isLoggedIn = !!Cookies.get("accessToken");
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const { cart, fetchCart, addItem } = useCart(userId);

  useEffect(() => {
    if (isOpen) {
      setSelectedVariant(product.variants[0]);
      setQuantity(1);
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (userId) {
      fetchCart();
    }
  }, [userId]);

  const showToast = (message, type = "info") => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleAdd = async () => {
    if (!selectedVariant || quantity < 1) return;

    const itemDTO = {
      productId: product.id,
      variantId: selectedVariant.variantId,
      brandId: product.brandId,
      categoryId: product.categoryId,
      quantity: quantity,
      totalPrice:
        quantity * (product.pricing.current || product.pricing.original),
      productName: product.name,
      originalPrice: product.pricing.original,
      discountPrice: product.pricing.current,
      ratingAverage: product.ratingAverage || 0,
      totalReviews: product.totalReviews || 0,
      productImage: product.images?.[0] || "",
      color: selectedVariant.color,
      hexCode: selectedVariant.hexCode,
      size: selectedVariant.size,
      ram: selectedVariant.ram,
      storage: selectedVariant.storage,
      condition: selectedVariant.condition,
      stock: selectedVariant.stock || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isLoggedIn) {
      if (!cart?.id) {
        await fetchCart();
      }

      if (cart?.id) {
        addItem(cart.id, itemDTO);
        showToast("Đã thêm sản phẩm vào giỏ hàng", "success");
      } else {
        console.error("Không thể thêm vào giỏ hàng: cart chưa sẵn sàng");
      }
    } else {
      addItemToGuestCart(product, selectedVariant, quantity);
      showToast("Đã thêm sản phẩm vào giỏ hàng", "success");
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300">
          {/* Header */}
          <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
            <Dialog.Title className="text-xl font-bold flex items-center gap-2">
              <FaShoppingCart size={20} /> Thêm sản phẩm vào giỏ hàng
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-300 transition"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col items-center">
              <img
                src={product.images?.[0] || "https://placehold.co/300"}
                alt={product.name}
                className="w-40 h-40 object-contain rounded-lg shadow mb-3"
              />
              <p className="text-center text-base font-medium text-gray-700 dark:text-gray-300">
                {product.name}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Chọn biến thể:
                </label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  value={selectedVariant?.variantId}
                  onChange={(e) => {
                    const v = product.variants.find(
                      (v) => v.variantId === e.target.value
                    );
                    setSelectedVariant(v);
                  }}
                >
                  {product.variants.map((variant) => (
                    <option key={variant.variantId} value={variant.variantId}>
                      {[
                        variant.color,
                        variant.size,
                        variant.ram,
                        variant.storage,
                      ]
                        .filter(Boolean)
                        .join(" / ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Số lượng:
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedVariant?.stock || 1}
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    if (value > selectedVariant?.stock) {
                      setQuantity(selectedVariant.stock);
                    } else if (value < 1) {
                      setQuantity(1);
                    } else {
                      setQuantity(value);
                    }
                  }}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <p
                  className={`text-xs mt-1 ${
                    selectedVariant?.stock <= 5
                      ? "text-red-500 font-semibold"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {selectedVariant?.stock <= 5
                    ? `⚠️ Còn lại: ${selectedVariant?.stock} sản phẩm`
                    : `Tồn kho: ${selectedVariant?.stock}`}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 p-5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
            >
              Hủy
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-lg shadow hover:scale-105 transform transition-all duration-200"
            >
              <FaCheckCircle size={16} /> Thêm vào giỏ hàng
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddToCartModal;
