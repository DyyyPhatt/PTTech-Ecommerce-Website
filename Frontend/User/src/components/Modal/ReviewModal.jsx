import React, { useState } from "react";
import {
  FaTimes,
  FaStar,
  FaTrash,
  FaArrowLeft,
  FaCheckCircle,
  FaImage,
} from "react-icons/fa";
import Cookies from "js-cookie";

const ReviewModal = ({ order, onClose, onSubmit, reviewedProducts = [] }) => {
  const userId = Cookies.get("userId");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [review, setReview] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...imagePreviews]);
  };

  const handleImageRemove = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!selectedProduct || loading) return;

    setLoading(true);

    try {
      const imageFiles = images.map((img) => img.file);

      const reviewData = {
        productId: selectedProduct.productId || selectedProduct.id,
        productVariantId: selectedProduct.variantId || null,
        userId: userId,
        orderId: order.id,
        rating,
        reviewTitle: reviewTitle.trim(),
        review: review.trim(),
        images: imageFiles,
      };

      await onSubmit(reviewData);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setRating(5);
    setReviewTitle("");
    setReview("");
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
  };

  const handleBack = () => {
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black bg-opacity-50 px-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl p-6 rounded-2xl shadow-2xl relative overflow-y-auto max-h-[90vh] border border-indigo-400 dark:border-indigo-700 ring-2 ring-indigo-100 dark:ring-indigo-500/30">
        <button
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-red-600 transition"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-6 flex items-center gap-2">
          <FaCheckCircle className="text-emerald-500" />
          Gửi đánh giá của bạn
        </h2>

        {!selectedProduct ? (
          <>
            <p className="mb-3 text-gray-700 dark:text-gray-300 font-medium">
              Chọn sản phẩm bạn muốn đánh giá:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {order.items.map((item) => {
                const isReviewed = reviewedProducts.some(
                  (r) =>
                    r.orderId === order.id &&
                    r.productVariantId === item.variantId
                );

                return (
                  <button
                    key={item.productId}
                    onClick={() => !isReviewed && setSelectedProduct(item)}
                    disabled={isReviewed}
                    className={`flex items-center gap-4 border p-3 rounded-xl transition shadow-sm ${
                      isReviewed
                        ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60"
                        : "bg-indigo-50 dark:bg-indigo-900 hover:bg-indigo-100 dark:hover:bg-indigo-800 border-indigo-200 dark:border-indigo-600"
                    }`}
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-md border dark:border-gray-700"
                    />
                    <div className="text-left">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {item.productName}
                      </p>
                      {item.color && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Màu: {item.color}
                        </p>
                      )}
                      {isReviewed && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                          Đã đánh giá
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-5">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-pink-600 font-medium hover:underline transition"
            >
              <FaArrowLeft />
              Chọn sản phẩm khác
            </button>

            <div className="flex items-center gap-4">
              <img
                src={selectedProduct.productImage}
                alt={selectedProduct.productName}
                className="w-16 h-16 object-cover rounded border dark:border-gray-600"
              />
              <div>
                <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                  {selectedProduct.productName}
                </p>
                {selectedProduct.color && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Màu sắc: {selectedProduct.color}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((num) => (
                <FaStar
                  key={num}
                  size={26}
                  className={`cursor-pointer transition duration-150 ${
                    rating >= num
                      ? "text-amber-400 drop-shadow"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                  onClick={() => setRating(num)}
                />
              ))}
            </div>

            <input
              type="text"
              className="w-full border-2 border-indigo-200 dark:border-indigo-600 rounded-lg p-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Tiêu đề đánh giá (ví dụ: Rất hài lòng)"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
            />

            <textarea
              className="w-full border-2 border-indigo-200 dark:border-indigo-600 rounded-lg p-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
              rows={4}
              placeholder="Viết đánh giá chi tiết về sản phẩm..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <FaImage className="text-pink-600" />
                Hình ảnh đánh giá (tuỳ chọn)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-700 dark:text-gray-200 bg-indigo-50 dark:bg-gray-800 px-2 py-1 rounded border border-indigo-300 dark:border-indigo-500"
              />

              <div className="flex flex-wrap gap-3 mt-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group transition transform hover:scale-105"
                  >
                    <img
                      src={img.preview}
                      alt="preview"
                      className="w-20 h-20 object-cover rounded-lg border-2 border-indigo-300 dark:border-indigo-600 shadow"
                    />
                    <button
                      onClick={() => handleImageRemove(idx)}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 shadow-sm"
                      title="Xoá ảnh"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full text-white font-semibold py-3 rounded-xl text-lg mt-6 shadow-md transition duration-200 flex justify-center items-center gap-2 ${
                loading
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    />
                  </svg>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="inline-block mr-2 mb-0.5" />
                  Gửi đánh giá
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
