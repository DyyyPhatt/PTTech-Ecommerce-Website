import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CartListTable = ({ carts, setCarts }) => {
  const [users, setUsers] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState({
    success: false,
    message: "",
  });
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchUsers = async () => {
      const usernames = {};
      for (const cart of carts) {
        if (!usernames[cart.userId]) {
          const username = await fetchUserName(cart.userId);
          usernames[cart.userId] = username;
        }
      }
      setUsers(usernames);
    };

    fetchUsers();
  }, [carts]);

  const handleViewDetail = (id) => {
    navigate(`/cart-detail/${id}`);
  };

  return (
    <div>
      {showSuccessMessage.success && (
        <div
          id="toast-success"
          className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:text-gray-200 dark:bg-gray-800"
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
            <span className="sr-only">Check icon</span>
          </div>
          <div className="ms-3 text-sm font-normal dark:text-white">
            {showSuccessMessage.message}
          </div>
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
            onClick={() =>
              setShowSuccessMessage({ success: false, message: "" })
            }
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg
              className="w-3 h-3"
              aria-hidden="true"
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
          </button>
        </div>
      )}

      <table className="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-white mt-4">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-white">
          <tr>
            <th scope="col" className="px-6 py-3">
              Tên người dùng
            </th>
            <th scope="col" className="px-6 py-3">
              Số lượng sản phẩm
            </th>
            <th scope="col" className="px-6 py-3">
              Tổng giá trị
            </th>
          </tr>
        </thead>
        <tbody>
          {carts
            .filter((cart) => cart.totalItems > 0)
            .map((cart) => (
              <tr
                key={cart.id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td
                  className="px-6 py-4 relative dark:text-white"
                  onClick={() => handleViewDetail(cart.id)}
                >
                  <span className="group relative cursor-pointer hover:text-blue-500 hover:underline">
                    {users[cart.userId] || "N/A"}
                    <span className="absolute top-full ml-8 mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                      Xem chi tiết giỏ hàng
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4">{cart.totalItems}</td>
                <td className="px-6 py-4">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })
                    .format(cart.totalPrice)
                    .replace("VND", "đ")}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default CartListTable;
