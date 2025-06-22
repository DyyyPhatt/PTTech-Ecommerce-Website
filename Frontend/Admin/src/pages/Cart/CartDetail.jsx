import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaBox, FaList, FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";
import BackButton from "../../components/BackButton";

const CartDetail = () => {
  const { id } = useParams();
  const [cart, setCart] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };
  const userToken = getUserToken();
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const fetchCartDetail = async () => {
      try {
        const cartResponse = await axios.get(
          `http://localhost:8081/api/carts/${id}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        setCart(cartResponse.data);

        const userResponse = await axios.get(
          `http://localhost:8081/api/users/${cartResponse.data.userId}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        setUser(userResponse.data);
      } catch (error) {
        setError("Không thể tải thông tin giỏ hàng.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCartDetail();
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

  if (!cart) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Không tìm thấy giỏ hàng.
      </div>
    );
  }

  const { items, totalItems, totalPrice, isDeleted, createdAt, updatedAt } =
    cart;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto flex justify-center items-center space-x-4">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white text-center">
          Chi tiết giỏ hàng
        </h1>
      </div>
      <div className="max-w-4xl mx-auto flex justify-start mt-4">
        <BackButton path="/cart-list" />
      </div>
      <div className="max-w-4xl mx-auto mt-4 bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="px-6 py-5 sm:px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-6">
            <FaBox className="text-3xl" />
            <h3 className="text-2xl font-semibold">
              Giỏ hàng của {user ? user.username : "Loading..."}
            </h3>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-white">
                <FaList className="inline mr-2 text-blue-500" />
                Tổng số sản phẩm
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {totalItems}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-white">
                <FaMoneyBillWave className="inline mr-2 text-yellow-500" />
                Tổng giá trị
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {totalPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Chi tiết giỏ hàng
            </h3>
          </div>

          {items.length === 0 ? (
            <div className="py-4 text-center text-gray-500 dark:text-white">
              Chưa có sản phẩm trong giỏ hàng.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-300 dark:border-gray-700">
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
                      Giá đã giảm
                    </th>
                    <th className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-white">
                      Tổng giá trị
                    </th>
                  </tr>
                </thead>
                {modalImage && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setModalImage(null)}
                  >
                    <img
                      src={modalImage}
                      alt="Large view"
                      className="max-w-full max-h-[90vh] rounded-lg shadow-xl"
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
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.productId}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            onClick={() => setModalImage(item.productImage)}
                            className="w-16 cursor-pointer h-16 object-cover rounded-lg"
                          />
                          <span>{item.productName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-white">
                        {[item.size, item.color]
                          .filter(Boolean)
                          .concat(
                            item.ram ? [`RAM: ${item.ram}`] : [],
                            item.storage ? [`Storage: ${item.storage}`] : [],
                            item.condition
                              ? [`Condition: ${item.condition}`]
                              : []
                          )
                          .join(" | ")}
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
      </div>

      <div className="max-w-4xl mx-auto flex justify-start mt-4">
        <BackButton path="/cart-list" />
      </div>
    </div>
  );
};

export default CartDetail;
