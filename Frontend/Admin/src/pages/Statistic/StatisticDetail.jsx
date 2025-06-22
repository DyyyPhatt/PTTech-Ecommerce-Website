import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  FaLink,
  FaInfoCircle,
  FaBullseye,
  FaCalendarAlt,
  FaStar,
  FaStarHalfAlt,
} from "react-icons/fa";
import BackButton from "../../components/BackButton";

const getUserToken = () => {
  return localStorage.getItem("userToken");
};

const StatisticDetail = () => {
  const { id } = useParams();
  const [statistic, setStatistic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userToken = getUserToken();

    const fetchStatisticById = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8081/api/statistics/${id}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        setStatistic(response.data);
      } catch (error) {
        setError("Không thể tải thông tin thống kê.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStatisticById();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-blue-600">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!statistic) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Không tìm thấy thống kê.</div>
      </div>
    );
  }

  const {
    date,
    totalOrders,
    totalItemsSold,
    totalRevenue,
    totalDiscounts,
    totalShippingCosts,
    topSellingProducts,
    customerFeedback,
    averageOrderValue,
    highestOrderValue,
    lowestOrderValue,
    totalOrdersByPaymentMethod,
    totalOrdersByStatus,
    totalOrdersByShippingMethod,
  } = statistic;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-6 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto flex justify-center items-center space-x-4">
        <h1 className="text-3xl font-semibold text-center">
          Chi Tiết Thống Kê
        </h1>
      </div>

      <div className="max-w-4xl mx-auto flex justify-start mt-8">
        <BackButton path="/statistic-list" />
      </div>

      <div className="max-w-4xl mx-auto mt-4 bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="px-6 py-5 sm:px-6 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-semibold">{`Thống Kê Ngày ${new Date(
                date
              ).toLocaleDateString()}`}</h3>
              <p className="mt-2 text-sm text-gray-200 dark:text-gray-300 flex items-center">
                <FaCalendarAlt className="inline mr-1" />
                {new Date(date).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 dark:border-gray-700 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-300 dark:sm:divide-gray-700">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-600 dark:text-white flex items-center">
                <FaBullseye className="inline mr-2 text-green-500" />
                Tổng Đơn Hàng
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                {totalOrders}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-600 dark:text-white flex items-center">
                <FaBullseye className="inline mr-2 text-blue-500" />
                Tổng Sản Phẩm Bán Ra
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                {totalItemsSold}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-600 dark:text-white flex items-center">
                <FaBullseye className="inline mr-2 text-yellow-500" />
                Tổng Doanh Thu
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })
                  .format(totalRevenue)
                  .replace("VND", "đ")}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-600 dark:text-white flex items-center">
                <FaInfoCircle className="inline mr-2 text-purple-500" />
                Tổng Giảm Giá
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })
                  .format(totalDiscounts)
                  .replace("VND", "đ")}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-600 dark:text-white flex items-center">
                <FaBullseye className="inline mr-2 text-green-500" />
                Sản Phẩm Bán Chạy
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                <ul className="space-y-2">
                  {topSellingProducts.map((product) => (
                    <li
                      key={product.productId}
                      className="flex justify-between"
                    >
                      <span>{product.productName}</span>
                      <span>x{product.quantitySold}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-600 dark:text-white flex items-center">
                <FaInfoCircle className="inline mr-2 text-orange-500" />
                Phản Hồi Khách Hàng
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, index) => {
                    const rating = customerFeedback.averageRating;
                    const fullStars = Math.floor(rating);
                    const hasHalfStar = rating - fullStars >= 0.5;

                    if (index < fullStars) {
                      return <FaStar key={index} className="text-yellow-400" />;
                    } else if (index === fullStars && hasHalfStar) {
                      return (
                        <FaStarHalfAlt
                          key={index}
                          className="text-yellow-400"
                        />
                      );
                    } else {
                      return (
                        <FaStar
                          key={index}
                          className="text-gray-400 dark:text-gray-600"
                        />
                      );
                    }
                  })}
                  <span className="ml-2 text-sm">
                    {customerFeedback.averageRating.toFixed(1)}/5
                  </span>
                </div>
                <br />
                Tổng số đánh giá: {customerFeedback.totalReviews}
                <br />
                Đánh giá tích cực: {customerFeedback.positiveReviews}
                <br />
                Đánh giá tiêu cực: {customerFeedback.negativeReviews}
              </dd>
            </div>

            {totalOrders > 0 && (
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                  <FaInfoCircle className="inline mr-2 text-red-500" />
                  Chi Tiết Đơn Hàng
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                  Giá trị đơn hàng trung bình:{" "}
                  {averageOrderValue.toLocaleString()}
                  <br />
                  Giá trị đơn hàng cao nhất:{" "}
                  {highestOrderValue.toLocaleString()}
                  <br />
                  Giá trị đơn hàng thấp nhất:{" "}
                  {lowestOrderValue.toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex justify-start mt-4">
        <BackButton path="/statistic-list" />
      </div>
    </div>
  );
};

export default StatisticDetail;
