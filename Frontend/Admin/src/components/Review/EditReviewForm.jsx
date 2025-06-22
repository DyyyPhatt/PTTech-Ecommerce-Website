import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useEditReview from "../../hooks/Review/useEditReview";
import useUsers from "../../hooks/Review/useUsers";
import useOrdersByUser from "../../hooks/Review/useOrdersByUser";
import useProductsByOrder from "../../hooks/Review/useProductsByOrder";
import BackButton from "../BackButton";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

const EditReviewForm = () => {
  const { id } = useParams();
  const {
    review,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    getReviewById,
    handleChange,
    handleSubmit,
  } = useEditReview(id);

  const { users } = useUsers();
  const [userSearch, setUserSearch] = useState("");

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");

  const { orders } = useOrdersByUser(selectedUserId);
  const { products } = useProductsByOrder(selectedOrderId);

  useEffect(() => {
    if (id) getReviewById();
  }, [id]);

  useEffect(() => {
    if (review) {
      setSelectedUserId(review.userId || "");
      setSelectedOrderId(review.orderId || "");
      setSelectedProductId(review.productId || "");
      setSelectedVariantId(review.productVariantId || "");
    }
  }, [review]);

  useEffect(() => {
    handleChange({
      target: {
        name: "userId",
        value: selectedUserId,
      },
    });
  }, [selectedUserId]);

  useEffect(() => {
    handleChange({
      target: {
        name: "orderId",
        value: selectedOrderId,
      },
    });
  }, [selectedOrderId]);

  useEffect(() => {
    handleChange({
      target: {
        name: "productId",
        value: selectedProductId,
      },
    });
    handleChange({
      target: {
        name: "productVariantId",
        value: selectedVariantId || null,
      },
    });
  }, [selectedProductId, selectedVariantId]);

  return (
    <div>
      <div className="mb-4">
        <BackButton path="/review-list" />
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6"
      >
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Người dùng
          </label>
          <input
            type="text"
            value={
              users.find((u) => u.id === selectedUserId)?.fullName ||
              users.find((u) => u.id === selectedUserId)?.username ||
              users.find((u) => u.id === selectedUserId)?.email ||
              ""
            }
            disabled
            className="bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Đơn hàng
          </label>
          <input
            type="text"
            value={
              orders.find((o) => o.id === selectedOrderId)
                ? `Đơn hàng #${selectedOrderId} - ${new Date(
                    orders.find((o) => o.id === selectedOrderId).createdAt
                  ).toLocaleDateString()}`
                : ""
            }
            disabled
            className="bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Sản phẩm
          </label>
          <textarea
            disabled
            value={
              products.find((p) => p.productId === selectedProductId)
                ? (() => {
                    const prod = products.find(
                      (p) => p.productId === selectedProductId
                    );
                    const specs = [
                      prod.color,
                      prod.size,
                      prod.ram,
                      prod.storage,
                    ]
                      .filter(Boolean)
                      .join(" | ");
                    return `${prod.productName}${specs ? ` - ${specs}` : ""}`;
                  })()
                : ""
            }
            className="bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Điểm đánh giá
          </label>
          <div className="flex space-x-1 cursor-pointer select-none text-yellow-400 text-xl">
            {[0, 1, 2, 3, 4].map((index) => {
              const diff = review.rating - index;
              let starIcon;
              if (diff >= 1) starIcon = <FaStar />;
              else if (diff >= 0.5) starIcon = <FaStarHalfAlt />;
              else starIcon = <FaStar className="text-gray-300" />;

              return (
                <span
                  key={index}
                  className="relative"
                  style={{ fontSize: "1.5rem" }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const isHalf = clickX < rect.width / 2;
                    const newRating = index + (isHalf ? 0.5 : 1);
                    handleChange({
                      target: { name: "rating", value: newRating },
                    });
                  }}
                  title={`Chọn ${index + 1} sao hoặc ${index + 0.5} sao`}
                >
                  {starIcon}
                </span>
              );
            })}
          </div>
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Tiêu đề đánh giá
          </label>
          <input
            type="text"
            name="reviewTitle"
            value={review.reviewTitle}
            onChange={handleChange}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
            required
          />
          {errors.reviewTitle && (
            <p className="text-red-500 text-sm mt-1">{errors.reviewTitle}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Nội dung đánh giá
          </label>
          <textarea
            name="review"
            rows={4}
            value={review.review}
            onChange={handleChange}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
            required
          />
          {errors.review && (
            <p className="text-red-500 text-sm mt-1">{errors.review}</p>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật đánh giá"}
          </button>
        </div>

        {showErrorMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-white bg-red-500 rounded-lg shadow-lg"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-white bg-red-400 rounded-lg">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0Zm1 14h-2v-2h2v2Zm0-4h-2V6h2v4Z" />
              </svg>
            </div>
            <div className="ml-3 text-sm font-normal dark:text-white">
              Cập nhật thất bại. Vui lòng thử lại!
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:bg-gray-700 dark:text-green-200"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            </div>
            <div className="ml-3 text-sm font-normal dark:text-white">
              Cập nhật đánh giá thành công!
            </div>
          </div>
        )}
      </form>
      <div className="mt-4">
        <BackButton path="/review-list" />
      </div>
    </div>
  );
};

export default EditReviewForm;
