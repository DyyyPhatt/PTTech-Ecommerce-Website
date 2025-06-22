import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

const ReviewListTable = ({
  reviews,
  setReviews,
  selectedReviewIds,
  handleToggleSelect,
  handleSelectAll,
  isAllSelected,
}) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySuccess, setReplySuccess] = useState(false);
  const [replyError, setReplyError] = useState(false);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const fetchUserName = async (userId) => {
    const userToken = getUserToken();
    try {
      const response = await axios.get(
        `http://localhost:8081/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      return response.data.username;
    } catch (error) {
      console.error("Error fetching username:", error);
      return "N/A";
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/review-detail/${id}`);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const usernames = {};
      for (const review of reviews) {
        if (!usernames[review.userId]) {
          const username = await fetchUserName(review.userId);
          usernames[review.userId] = username;
        }
      }
      setUsers(usernames);
    };

    fetchUsers();
  }, [reviews]);

  const fetchProductName = async (id) => {
    const userToken = getUserToken();
    try {
      const response = await axios.get(
        `http://localhost:8081/api/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      return response.data.name;
    } catch (error) {
      console.error("Error fetching product:", error);
      return "N/A";
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const names = {};
      for (const review of reviews) {
        if (!names[review.productId]) {
          const name = await fetchProductName(review.productId);
          names[review.productId] = name;
        }
      }
      setProducts(names);
    };

    fetchProducts();
  }, [reviews]);

  useEffect(() => {
    if (replySuccess) {
      const timer = setTimeout(() => setReplySuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [replySuccess]);

  useEffect(() => {
    if (replyError) {
      const timer = setTimeout(() => setReplyError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [replyError]);

  return (
    <div>
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg border border-gray-300 dark:border-gray-600">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Phản hồi đánh giá
            </h2>
            <textarea
              rows={4}
              className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
              placeholder="Nhập câu trả lời..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={async () => {
                  const userToken = getUserToken();
                  try {
                    const response = await axios.post(
                      `http://localhost:8081/api/reviews/reply/${selectedReview.id}`,
                      null,
                      {
                        params: { replyText },
                        headers: {
                          Authorization: `Bearer ${userToken}`,
                        },
                      }
                    );

                    if (response.status === 200) {
                      setReviews((prev) =>
                        prev.map((item) =>
                          item.id === selectedReview.id
                            ? {
                                ...item,
                                reply: {
                                  replyText,
                                  createdAt: new Date().toISOString(),
                                },
                              }
                            : item
                        )
                      );

                      setReplyText("");
                      setShowReplyModal(false);
                      setReplySuccess(true);
                      setTimeout(() => setReplySuccess(false), 3000);
                    }
                  } catch (error) {
                    console.error("Phản hồi thất bại:", error);
                    setReplyError(true);
                    setTimeout(() => setReplyError(false), 3000);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Gửi
              </button>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText("");
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {replySuccess && (
        <div
          className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-green-600 bg-white rounded-lg shadow-lg dark:text-green-400 dark:bg-gray-800 z-50"
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 bg-green-100 text-green-500 rounded-lg dark:bg-green-800 dark:text-green-200">
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
          </div>
          <div className="ms-3 text-sm font-normal">
            Phản hồi đã được gửi thành công!
          </div>
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={() => setReplySuccess(false)}
          >
            <svg
              className="w-3 h-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </div>
      )}

      {replyError && (
        <div
          className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-red-600 bg-white rounded-lg shadow-lg dark:text-red-400 dark:bg-gray-800 z-50"
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 bg-red-100 text-red-500 rounded-lg dark:bg-red-800 dark:text-red-200">
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0Zm1 15H9v-2h2v2Zm0-4H9V5h2v6Z" />
            </svg>
          </div>
          <div className="ms-3 text-sm font-normal">
            Gửi phản hồi thất bại. Vui lòng thử lại.
          </div>
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={() => setReplyError(false)}
          >
            <svg
              className="w-3 h-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </div>
      )}

      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-white mt-4">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-white">
          <tr>
            {" "}
            <th scope="col" className="px-6 py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th scope="col" className="px-6 py-3">
              Người đánh giá
            </th>
            <th scope="col" className="px-6 py-3">
              Sản phẩm
            </th>
            <th scope="col" className="px-6 py-3">
              Tiêu đề đánh giá
            </th>
            <th scope="col" className="px-6 py-3">
              Điểm đánh giá
            </th>
            <th scope="col" className="px-6 py-3">
              Phản hồi
            </th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr
              key={review.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedReviewIds.includes(review.id)}
                  onChange={() => handleToggleSelect(review.id)}
                />
              </td>
              <td className="px-6 py-4 dark:text-white">
                {users[review.userId] || "N/A"}{" "}
              </td>
              <td
                className="px-6 py-4 relative dark:text-white"
                onClick={() => handleViewDetail(review.id)}
              >
                <span className="group relative cursor-pointer hover:text-blue-500 hover:underline">
                  {products[review.productId] || "N/A"}
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                    Xem chi tiết đánh giá
                  </span>
                </span>
              </td>
              <td className="px-6 py-4 dark:text-white">
                {review.reviewTitle}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, index) => {
                    const isFullStar = review.rating > index;
                    const isHalfStar = review.rating - index === 0.5;

                    return (
                      <span key={index} className="text-yellow-500">
                        {isFullStar ? (
                          <FaStar />
                        ) : isHalfStar ? (
                          <FaStarHalfAlt />
                        ) : (
                          <FaStar className="text-gray-300" />
                        )}
                      </span>
                    );
                  })}
                </div>
              </td>
              <td className="px-6 py-4">
                {review.reply ? (
                  <span
                    className="inline-block px-2 py-1 text-xs font-semibold rounded 
        bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                  >
                    Đã phản hồi
                  </span>
                ) : (
                  <div className="relative group inline-block cursor-pointer">
                    <span
                      onClick={() => {
                        setSelectedReview(review);
                        setShowReplyModal(true);
                      }}
                      className="inline-block px-2 py-1 text-xs font-semibold rounded 
    bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                    >
                      Chưa phản hồi
                    </span>

                    <div
                      className="absolute -top-9 left-1/2 -translate-x-1/2 z-10
        bg-gray-900 text-white text-xs px-3 py-1 rounded-md shadow-lg
        opacity-0 group-hover:opacity-100 transition-opacity duration-200
        whitespace-nowrap"
                    >
                      Cập nhật trạng thái
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewListTable;
