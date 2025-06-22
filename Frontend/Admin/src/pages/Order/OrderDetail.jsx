import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaBox,
  FaList,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaCreditCard,
  FaFlagCheckered,
  FaClipboardList,
  FaPhoneAlt,
  FaTruck,
  FaRegCheckCircle,
} from "react-icons/fa";
import BackButton from "../../components/BackButton";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [modalImage, setModalImage] = useState(null);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const userToken = getUserToken();

        const orderResponse = await axios.get(
          `http://localhost:8081/api/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        setOrder(orderResponse.data);

        const userResponse = await axios.get(
          `http://localhost:8081/api/users/${orderResponse.data.userId}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        setUser(userResponse.data);
      } catch (error) {
        setError("Không thể tải thông tin đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Đang tải...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Không tìm thấy đơn hàng.
      </div>
    );
  }

  const {
    items,
    totalItems,
    totalPrice,
    shippingPrice,
    finalPrice,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    orderStatus,
    orderNotes,
    phoneNumber,
    isDeleted,
    discountAmount,
    discountCode,
    shippingMethod,
  } = order;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto flex items-center space-x-4">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">
          Chi tiết đơn hàng #{order.orderId}
        </h1>
      </div>
      <div className="max-w-4xl mx-auto flex justify-between mt-4">
        <BackButton path="/order-list" />
        <button
          onClick={() => navigate(`/edit-order/${id}`)}
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
          <span>Chỉnh sửa đơn hàng</span>
        </button>
      </div>
      <div className="max-w-4xl mx-auto mt-4 bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="px-6 py-5 sm:px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-6">
            <FaBox className="text-3xl" />
            <h3 className="text-2xl font-semibold dark:text-white">
              Đơn hàng của {user ? user.username : "Loading..."}
            </h3>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaPhoneAlt className="inline mr-2 text-green-500" />
                Số điện thoại
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {order?.phoneNumber
                  ? order.phoneNumber
                  : "Chưa có số điện thoại"}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaMapMarkerAlt className="inline mr-2 text-blue-500" />
                Địa chỉ giao hàng
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                <div>
                  <strong>Đường: </strong>
                  {shippingAddress.street}
                </div>
                <div>
                  <strong>Xã / Phường: </strong>
                  {shippingAddress.communes}
                </div>
                <div>
                  <strong>Quận / Huyện: </strong>
                  {shippingAddress.district}
                </div>
                <div>
                  <strong>Tỉnh / Thành phố: </strong>
                  {shippingAddress.city}
                </div>
                <div>
                  <strong>Quốc gia: </strong>
                  {shippingAddress.country}
                </div>
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaCreditCard className="inline mr-2 text-indigo-500" />
                Phương thức thanh toán
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {paymentMethod}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaFlagCheckered className="inline mr-2 text-purple-500" />
                Trạng thái thanh toán
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {paymentStatus}
              </dd>
            </div>

            {orderNotes && (
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  <FaClipboardList className="inline mr-2 text-teal-500" />
                  Ghi chú đơn hàng
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {orderNotes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Thông tin đơn hàng
          </h3>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaList className="inline mr-2 text-green-500" />
                Tổng số sản phẩm
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {totalItems}
              </dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaMoneyBillWave className="inline mr-2 text-yellow-500" />
                Tổng giá trị sản phẩm
              </dt>
              <dd className="mt-1 text-sm font-semibold text-blue-600 sm:mt-0 sm:col-span-2">
                {totalPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaMoneyBillWave className="inline mr-2 text-pink-500" />
                Phí vận chuyển
              </dt>
              <dd className="mt-1 text-sm font-semibold text-purple-600 sm:mt-0 sm:col-span-2">
                {shippingPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </dd>
            </div>

            {discountAmount > 0 && (
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  <FaMoneyBillWave className="inline mr-2 text-gray-500" />
                  Số tiền giảm giá
                </dt>
                <dd className="mt-1 text-sm font-semibold text-green-600 sm:mt-0 sm:col-span-2">
                  {discountAmount.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}{" "}
                  - ({discountCode})
                </dd>
              </div>
            )}

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaMoneyBillWave className="inline mr-2 text-blue-500" />
                Tổng tiền
              </dt>
              <dd className="mt-1 text-lg font-bold text-red-600 sm:mt-0 sm:col-span-2">
                {finalPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaTruck className="inline mr-2 text-orange-500" />
                Phương thức giao hàng
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {shippingMethod
                  ? shippingMethod
                  : "Chưa có phương thức giao hàng"}
              </dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaRegCheckCircle className="inline mr-2 text-green-500" />
                Trạng thái đơn hàng
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {isDeleted ? "Đơn hàng đã bị xóa" : orderStatus}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Chi tiết sản phẩm trong đơn hàng
          </h3>
        </div>

        {modalImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setModalImage(null)}
          >
            <img
              src={modalImage}
              alt="Large view"
              className="max-w-full max-h-full rounded shadow-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-5 right-5 text-white text-3xl font-bold"
              onClick={() => setModalImage(null)}
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="py-4 text-center text-gray-500 dark:text-gray-400">
            Không có sản phẩm trong đơn hàng này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-900 shadow-md rounded-lg border border-gray-300 dark:border-gray-700">
              <thead>
                <tr className="text-left bg-gray-100 dark:bg-gray-700">
                  <th className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-white">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-white">
                    Thông tin biến thể
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-white">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-white">
                    Giá gốc
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-white">
                    Giá giảm
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-white">
                    Tổng giá trị
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.productId}
                    className="border-b border-gray-300 dark:border-gray-700"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                          onClick={() => setModalImage(item.productImage)}
                        />

                        <span>{item.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {item.size} | {item.color}
                      {item.ram && ` | RAM: ${item.ram}`}
                      {item.storage && ` | Storage: ${item.storage}`}
                      {item.condition && ` | Condition: ${item.condition}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">
                      {item.originalPrice.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </td>

                    <td
                      className={`px-6 py-4 text-sm font-medium ${
                        item.discountPrice
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {(
                        item.discountPrice ?? item.originalPrice
                      ).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                      {(
                        (item.discountPrice || item.originalPrice) *
                        item.quantity
                      ).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto flex justify-between mt-4">
        <BackButton path="/order-list" />
        <button
          onClick={() => navigate(`/edit-order/${id}`)}
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
          <span>Chỉnh sửa đơn hàng</span>
        </button>
      </div>
    </div>
  );
};

export default OrderDetail;
