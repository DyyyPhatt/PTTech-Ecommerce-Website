import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaStarHalfAlt,
  FaUser,
  FaTag,
  FaCheckCircle,
  FaRegTimesCircle,
  FaReply,
  FaClock,
  FaImage,
} from "react-icons/fa";
import BackButton from "../../components/BackButton";

const ReviewDetail = () => {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  useEffect(() => {
    const fetchReviewDetail = async () => {
      const userToken = getUserToken();
      try {
        setLoading(true);
        console.log("User Token:", userToken);

        const reviewResponse = await axios.get(
          `http://localhost:8081/api/reviews/${id}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        console.log("Review Data:", reviewResponse.data);
        setReview(reviewResponse.data);

        const userResponse = await axios.get(
          `http://localhost:8081/api/users/${reviewResponse.data.userId}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        console.log("User Data:", userResponse.data);
        setUser(userResponse.data);

        const productResponse = await axios.get(
          `http://localhost:8081/api/products/${reviewResponse.data.productId}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        console.log("Product Data:", productResponse.data);
        setProduct(productResponse.data);

        if (
          reviewResponse.data.productVariantId &&
          productResponse.data.variants
        ) {
          const productVariant = productResponse.data.variants.find(
            (variant) =>
              variant.variantId === reviewResponse.data.productVariantId
          );
          console.log("Product Variant:", productVariant);
          setVariant(productVariant);
        }
      } catch (error) {
        console.error("Error fetching review details:", error);
        setError("Không thể tải thông tin đánh giá.");
        console.error("Error details:", error.response || error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReviewDetail();
    }
  }, [id]);

  const handleReply = async () => {
    const userToken = getUserToken();
    try {
      const response = await axios.post(
        `http://localhost:8081/api/reviews/reply/${id}`,
        null,
        {
          params: {
            replyText: replyText,
          },
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.status === 200) {
        setReview((prevReview) => ({
          ...prevReview,
          reply: {
            replyText,
            createdAt: new Date().toISOString(),
          },
        }));
        setShowSuccessMessage(true);
        setShowErrorMessage(false);
        setReplyText("");
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (error) {
      setShowErrorMessage(true);
      setShowSuccessMessage(false);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!review) {
    return <div>Không tìm thấy đánh giá.</div>;
  }

  const { rating, reviewTitle, review: reviewText, reply, images } = review;

  const validImages = Array.isArray(images)
    ? images.filter((img) => typeof img === "string" && img.trim() !== "")
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto flex justify-center items-center space-x-4">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white text-center">
          Chi tiết đánh giá
        </h1>
      </div>
      <div className="max-w-4xl mx-auto flex justify-between mb-4">
        <BackButton path="/review-list" />
        <button
          onClick={() => navigate(`/edit-review/${id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
            />
          </svg>
          <span>Chỉnh sửa đánh giá</span>
        </button>
      </div>
      {showErrorMessage && (
        <div
          className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-white bg-red-500 rounded-lg shadow-lg"
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-white bg-red-400 rounded-lg">
            <FaRegTimesCircle className="w-5 h-5" />
          </div>
          <div className="ml-3 text-sm font-normal">
            Trả lời đánh giá thất bại. Vui lòng thử lại!
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div
          className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:text-white"
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
            <FaCheckCircle className="w-5 h-5" />
          </div>
          <div className="ml-3 text-sm font-normal">
            Trả lời đánh giá thành công.
          </div>
        </div>
      )}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative">
            <button
              className="absolute top-0 right-0 text-white text-2xl p-2 hover:text-red-400"
              onClick={() => setSelectedImage(null)}
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Xem lớn"
              className="max-w-full max-h-[90vh] rounded shadow-lg"
            />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-4 bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="px-6 py-5 sm:px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-6">
            <FaUser className="text-white" />
            <h3 className="text-2xl font-semibold dark:text-white">
              {user ? user.username : "Đang tải..."}
            </h3>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaStar className="inline mr-2 text-yellow-500" />
                Điểm đánh giá
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, index) => {
                    const isFullStar = rating > index;
                    const isHalfStar = rating - index === 0.5;

                    return (
                      <span key={index} className="text-yellow-500">
                        {isFullStar ? (
                          <FaStar />
                        ) : isHalfStar ? (
                          <FaStarHalfAlt />
                        ) : (
                          <FaStar className="text-gray-300 dark:text-gray-600" />
                        )}
                      </span>
                    );
                  })}
                </div>
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaTag className="inline mr-2 text-indigo-500" />
                Tiêu đề đánh giá
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {reviewTitle}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaReply className="inline mr-2 text-blue-500" />
                Nội dung đánh giá
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {reviewText}
              </dd>
            </div>
            {validImages.length > 0 && (
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  <FaImage className="inline mr-2 text-green-500" />
                  Hình ảnh đánh giá
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {validImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Hình ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border border-gray-300 dark:border-gray-700 cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedImage(img)}
                      />
                    ))}
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="px-6 py-5 sm:px-6 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 text-white rounded-t-lg">
          <h3 className="text-lg font-medium dark:text-white">
            Thông tin sản phẩm
          </h3>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaTag className="inline mr-2 text-blue-500" />
                Sản phẩm
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {product ? product.name : "Đang tải..."}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaTag className="inline mr-2 text-blue-500" />
                Biến thể
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {variant ? (
                  <>
                    {variant.color && (
                      <p>
                        <strong>Màu:</strong> {variant.color}
                      </p>
                    )}
                    {variant.size && (
                      <p>
                        <strong>Size:</strong> {variant.size}
                      </p>
                    )}
                    {variant.ram && (
                      <p>
                        <strong>RAM:</strong> {variant.ram}
                      </p>
                    )}
                    {variant.storage && (
                      <p>
                        <strong>Dung lượng:</strong> {variant.storage}
                      </p>
                    )}
                    {variant.condition && (
                      <p>
                        <strong>Tình trạng:</strong> {variant.condition}
                      </p>
                    )}
                  </>
                ) : (
                  "Không có biến thể"
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="px-6 py-5 sm:px-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white rounded-t-lg">
          <h3 className="text-lg font-medium dark:text-white">
            Phản hồi đánh giá
          </h3>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
          {reply ? (
            <p className="mt-3 mb-3 ml-4 text-sm text-gray-500 dark:text-white">
              {reply.replyText}
            </p>
          ) : (
            <p className="mt-3 mb-3 ml-4 text-sm text-gray-500 dark:text-white">
              Chưa có phẩn hồi.
            </p>
          )}
        </div>

        {!reply && (
          <div className="mt-8 max-w-4xl mx-auto bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-300 dark:border-gray-600">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">
              Trả lời đánh giá
            </h3>
            <textarea
              className="w-full p-4 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              rows="4"
              placeholder="Nhập câu trả lời..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button
              onClick={handleReply}
              className="mt-4 py-2 px-6 bg-blue-500 text-white rounded-md"
            >
              Trả lời
            </button>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto flex justify-between mt-4">
        <BackButton path="/review-list" />
        <button
          onClick={() => navigate(`/edit-review/${id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
            />
          </svg>
          <span>Chỉnh sửa đánh giá</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewDetail;
