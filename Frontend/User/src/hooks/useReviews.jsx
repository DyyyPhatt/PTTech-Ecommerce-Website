import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "http://localhost:8081/api/reviews";

const getAuthToken = () => {
  return Cookies.get("accessToken");
};

const useReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/product/${productId}`);
        setReviews(response.data);
      } catch (err) {
        console.error(err);
        setError("Lỗi khi lấy đánh giá sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const getAllReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (err) {
      console.error("Lỗi khi lấy tất cả đánh giá:", err);
      throw err;
    }
  };

  const addReview = async (review) => {
    try {
      console.log(review);
      const response = await axios.post(`${API_URL}`, review, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      setReviews((prev) => [...prev, response.data]);
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.error("Lỗi khi thêm đánh giá:", err);
      throw err;
    }
  };

  const updateReview = async (reviewId, updatedReview) => {
    try {
      const oldReview = reviews.find((r) => r.id === reviewId);
      if (!oldReview) {
        throw new Error("Review không tồn tại trong state");
      }

      const oldImages = oldReview.images || [];
      const newImages = updatedReview.images || [];

      const imagesToDelete = oldImages.filter(
        (img) => !newImages.includes(img)
      );
      for (const imageUrl of imagesToDelete) {
        await deleteImage(reviewId, imageUrl);
      }

      const response = await axios.put(
        `${API_URL}/${reviewId}`,
        updatedReview,
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );

      setReviews((prev) =>
        prev.map((review) => (review.id === reviewId ? response.data : review))
      );

      return response.data;
    } catch (err) {
      console.error("Lỗi khi cập nhật đánh giá:", err);
      throw err;
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await axios.delete(`${API_URL}/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (err) {
      console.error("Lỗi khi xóa đánh giá:", err);
      throw err;
    }
  };

  const uploadImage = async (reviewId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(
        `${API_URL}/upload-image/${reviewId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Lỗi khi tải ảnh đánh giá:", err);
      throw err;
    }
  };

  const deleteImage = async (reviewId, imageUrl) => {
    try {
      await axios.delete(`${API_URL}/delete-image/${reviewId}`, {
        params: { imageUrl },
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
    } catch (err) {
      console.error("Lỗi khi xóa ảnh đánh giá:", err);
      throw err;
    }
  };

  return {
    reviews,
    loading,
    error,
    getAllReviews,
    addReview,
    updateReview,
    deleteReview,
    uploadImage,
    deleteImage,
  };
};

export default useReviews;
