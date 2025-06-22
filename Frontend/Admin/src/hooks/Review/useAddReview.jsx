import { useState } from "react";

const getUserToken = () => localStorage.getItem("userToken");

const useAddReview = () => {
  const [reviewData, setReviewData] = useState({
    userId: "",
    orderId: "",
    productId: "",
    productVariantId: null,
    rating: 5,
    reviewTitle: "",
    review: "",
    images: [""], // Thêm images mặc định
    isDeleted: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReviewData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateReview = () => {
    const newErrors = {};
    if (!reviewData.userId) newErrors.userId = "Vui lòng chọn người dùng";
    if (!reviewData.orderId) newErrors.orderId = "Vui lòng chọn đơn hàng";
    if (!reviewData.productId) newErrors.productId = "Vui lòng chọn sản phẩm";
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5)
      newErrors.rating = "Điểm đánh giá phải từ 1 đến 5";
    if (!reviewData.reviewTitle)
      newErrors.reviewTitle = "Vui lòng nhập tiêu đề đánh giá";
    if (!reviewData.review)
      newErrors.review = "Vui lòng nhập nội dung đánh giá";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addReview = async () => {
    if (!validateReview()) {
      return;
    }

    try {
      console.log("Gửi dữ liệu đánh giá:", reviewData);
      setLoading(true);
      setError(null);
      setSuccess(false);

      const token = getUserToken();

      const response = await fetch("http://localhost:8081/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        let errorMessage = `Lỗi server: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log("Lỗi phản hồi từ server:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          console.log("Lỗi phản hồi dạng text:", errorText);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Phản hồi thành công:", result);
      setSuccess(true);
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err);
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return {
    reviewData,
    errors,
    loading,
    error,
    success,
    handleChange,
    addReview,
    setReviewData,
  };
};

export default useAddReview;
