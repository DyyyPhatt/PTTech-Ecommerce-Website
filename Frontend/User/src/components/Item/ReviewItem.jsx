import React, { useRef, useState, useEffect } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaRegStar,
  FaUserEdit,
  FaTrashAlt,
} from "react-icons/fa";
import useUser from "../../hooks/useUsers";
import Cookies from "js-cookie";

const ReviewItem = ({ review, onEdit, onDelete }) => {
  const reviewRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { user } = useUser(review.userId);
  const currentUserId = Cookies.get("userId");
  const isOwner = currentUserId === review.userId;

  useEffect(() => {
    if (reviewRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(reviewRef.current).lineHeight
      );
      const maxHeight = lineHeight * 5;
      if (reviewRef.current.scrollHeight > maxHeight) {
        setShowToggle(true);
      }
    }
  }, [review.review]);

  return (
    <>
      <div className="mb-6 p-6 border-l-4 border-indigo-500 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 dark:border-indigo-400">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-400 shadow dark:ring-indigo-600"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow">
                {user?.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {user?.username || "Người dùng ẩn danh"}
                {isOwner && (
                  <span className="ml-2 text-xs text-blue-500 dark:text-blue-400 font-normal">
                    (Bạn)
                  </span>
                )}
              </p>
              <div className="flex items-center gap-0.5 text-amber-400 mt-1">
                {[...Array(5)].map((_, index) => {
                  const Icon = index < review.rating ? FaStar : FaRegStar;
                  return <Icon key={index} className="w-5 h-5" />;
                })}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {review.updatedAt
              ? new Date(review.updatedAt).toLocaleDateString("vi-VN")
              : ""}
          </div>
        </div>

        {/* Review Title */}
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {review.reviewTitle}
        </h4>

        {/* Review Content */}
        <p
          ref={reviewRef}
          className={`text-gray-800 dark:text-gray-300 text-sm sm:text-base leading-relaxed transition-all duration-300 ${
            isExpanded ? "" : "line-clamp-5"
          }`}
        >
          {review.review}
        </p>

        {/* Toggle Read More */}
        {showToggle && (
          <div className="flex justify-end mt-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 transition underline underline-offset-2"
            >
              {isExpanded ? (
                <FaChevronUp className="text-xs" />
              ) : (
                <FaChevronDown className="text-xs" />
              )}
              {isExpanded ? "Thu gọn" : "Xem thêm"}
            </button>
          </div>
        )}

        {/* Review Images */}
        {review.images?.length > 0 && (
          <div className="flex mt-4 gap-3 flex-wrap">
            {review.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Review image ${idx}`}
                onClick={() => setSelectedImage(img)}
                className="w-24 h-24 object-cover rounded-xl border shadow cursor-pointer hover:scale-105 hover:ring-2 hover:ring-indigo-300 dark:hover:ring-indigo-500 transition-transform duration-200"
              />
            ))}
          </div>
        )}

        {/* Admin Reply */}
        {review.reply?.replyText && (
          <div className="mt-5 p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg shadow-sm dark:from-blue-900 dark:to-blue-800 dark:border-blue-400">
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              <span className="font-semibold">Phản hồi từ PTTech:</span>{" "}
              {review.reply.replyText}
            </p>
          </div>
        )}

        {/* Actions */}
        {isOwner && (
          <div className="flex justify-end gap-3 mt-4 text-sm">
            <button
              onClick={() => onEdit(review)}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400 font-medium transition"
            >
              <FaUserEdit />
              Chỉnh sửa
            </button>
            <button
              onClick={() => onDelete(review.id)}
              className="flex items-center gap-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition"
            >
              <FaTrashAlt />
              Xoá
            </button>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60 transition-all">
          {/* Overlay để đóng */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setSelectedImage(null)}
          />

          {/* Modal content */}
          <div className="relative z-10 w-[95%] max-w-6xl max-h-[95vh] p-2 sm:p-4 bg-white rounded-xl shadow-2xl animate-fade-in dark:bg-gray-900">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-4 text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 text-2xl font-bold transition"
              aria-label="Đóng"
            >
              &times;
            </button>

            {/* Image */}
            <img
              src={selectedImage}
              alt="Ảnh phóng to"
              className="w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewItem;
