import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaStar,
  FaTrash,
  FaCheckCircle,
  FaImage,
} from "react-icons/fa";

const EditReviewModal = ({
  existingReview,
  onClose,
  onUpdate,
  uploadImage,
}) => {
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [review, setReview] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setReviewTitle(existingReview.reviewTitle || "");
      setReview(existingReview.review || "");
      setImages(
        existingReview.images?.map((img) => ({
          url: img,
          file: null,
        })) || []
      );
    }
  }, [existingReview]);

  // Thêm ảnh mới
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...imagePreviews]);
  };

  // Xóa ảnh
  const handleImageRemove = (index) => {
    const newImages = [...images];
    if (newImages[index].file) {
      URL.revokeObjectURL(newImages[index].url);
    }
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const newFiles = images.filter((img) => img.file).map((img) => img.file);
      const existingImages = images
        .filter((img) => !img.file)
        .map((img) => img.url);

      let updatedReview = {
        ...existingReview,
        rating,
        reviewTitle: reviewTitle.trim(),
        review: review.trim(),
        images: existingImages,
      };

      for (const file of newFiles) {
        const uploadURL = await uploadImage(updatedReview.id, file);
        updatedReview.images.push(uploadURL);
      }

      await onUpdate(updatedReview);

      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật đánh giá:", error);
    } finally {
      setLoading(false);
    }
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
          Chỉnh sửa đánh giá
        </h2>

        <div className="space-y-5">
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
            placeholder="Tiêu đề đánh giá"
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
                    src={img.url}
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
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <FaCheckCircle className="inline-block mr-2 mb-0.5" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditReviewModal;
