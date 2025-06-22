import React, { useState, useEffect } from "react";
import useUsers from "../../hooks/Review/useUsers";
import useOrdersByUser from "../../hooks/Review/useOrdersByUser";
import useProductsByOrder from "../../hooks/Review/useProductsByOrder";
import BackButton from "../BackButton";
import useAddReview from "../../hooks/Review/useAddReview";

const AddReviewForm = () => {
  const { users, loading: loadingUsers } = useUsers();
  const [userSearch, setUserSearch] = useState("");

  const [selectedUserId, setSelectedUserId] = useState("");
  const { orders, loading: loadingOrders } = useOrdersByUser(selectedUserId);

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const { products, loading: loadingProducts } =
    useProductsByOrder(selectedOrderId);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");

  const {
    reviewData,
    errors,
    loading,
    error,
    success,
    handleChange,
    addReview,
    setReviewData,
  } = useAddReview();

  useEffect(() => {
    setSelectedOrderId("");
    setSelectedProductId("");
    setSelectedVariantId("");
    setReviewData((prev) => ({
      ...prev,
      userId: selectedUserId,
      orderId: "",
      productId: "",
      productVariantId: null,
      rating: 5,
      reviewTitle: "",
      review: "",
      isDeleted: false,
    }));
  }, [selectedUserId, setReviewData]);

  useEffect(() => {
    setSelectedProductId("");
    setSelectedVariantId("");
    setReviewData((prev) => ({
      ...prev,
      orderId: selectedOrderId,
      productId: "",
      productVariantId: null,
    }));
  }, [selectedOrderId, setReviewData]);

  useEffect(() => {
    setReviewData((prev) => ({
      ...prev,
      productId: selectedProductId,
      productVariantId: selectedVariantId || null,
    }));
  }, [selectedProductId, selectedVariantId, setReviewData]);

  const [localRating, setLocalRating] = useState(5);
  const [localTitle, setLocalTitle] = useState("");
  const [localReviewText, setLocalReviewText] = useState("");

  useEffect(() => {
    setReviewData((prev) => ({
      ...prev,
      rating: localRating,
      reviewTitle: localTitle,
      review: localReviewText,
    }));
  }, [localRating, localTitle, localReviewText, setReviewData]);

  useEffect(() => {
    if (success) {
      setLocalRating(5);
      setLocalTitle("");
      setLocalReviewText("");
      setSelectedUserId("");
      setSelectedOrderId("");
      setSelectedProductId("");
      setSelectedVariantId("");
    }
  }, [success]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit form với dữ liệu:", reviewData);
    addReview();
  };

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
          <label
            htmlFor="userSearch"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Người dùng
          </label>
          <input
            type="text"
            id="userSearch"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Tìm kiếm người dùng..."
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
          />
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
            required
          >
            <option value="">Chọn người dùng</option>
            {loadingUsers ? (
              <option>Đang tải...</option>
            ) : (
              users
                .filter((user) =>
                  (user.fullName || user.username || user.email)
                    .toLowerCase()
                    .includes(userSearch.toLowerCase())
                )
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.username || user.email}
                  </option>
                ))
            )}
          </select>
        </div>

        {selectedUserId && (
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Đơn hàng
            </label>
            {loadingOrders ? (
              <p className="text-sm text-gray-500">Đang tải đơn hàng...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-red-500">
                Người dùng chưa có đơn hàng nào.
              </p>
            ) : (
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                required
              >
                <option value="">Chọn đơn hàng</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Đơn hàng #{order.id} -{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Sản phẩm */}
        {selectedOrderId && (
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Sản phẩm
            </label>
            {loadingProducts ? (
              <p className="text-sm text-gray-500">Đang tải sản phẩm...</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-red-500">
                Đơn hàng chưa có sản phẩm nào.
              </p>
            ) : (
              <select
                value={selectedProductId}
                onChange={(e) => {
                  const selected = products.find(
                    (p) => p.productId === e.target.value
                  );
                  setSelectedProductId(e.target.value);
                  setSelectedVariantId(selected?.variantId || "");
                }}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
                required
              >
                <option value="">Chọn sản phẩm</option>
                {products
                  .filter((item) => item.variantId)
                  .map((item) => {
                    const specs = [
                      item.color,
                      item.size,
                      item.ram,
                      item.storage,
                    ]
                      .filter(Boolean)
                      .join(" | ");
                    return (
                      <option key={item.productId} value={item.productId}>
                        {item.productName} {specs ? `- ${specs}` : ""}
                      </option>
                    );
                  })}
              </select>
            )}
          </div>
        )}

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Điểm đánh giá
          </label>
          <input
            type="number"
            min={1}
            max={5}
            step={0.5}
            value={localRating}
            onChange={(e) => setLocalRating(parseFloat(e.target.value))}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
            required
          />
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
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
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
            rows={4}
            value={localReviewText}
            onChange={(e) => setLocalReviewText(e.target.value)}
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
            disabled={loading}
            className="flex items-center justify-center text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm mt-2">
            Đánh giá đã được gửi thành công!
          </p>
        )}
      </form>
      <div className="mt-4">
        <BackButton path="/review-list" />
      </div>
    </div>
  );
};

export default AddReviewForm;
