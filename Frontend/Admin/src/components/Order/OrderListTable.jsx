import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrderListTable = ({
  orders,
  setOrders,
  selectedOrderIds,
  handleToggleSelect,
  handleSelectAll,
  isAllSelected,
}) => {
  const [users, setUsers] = useState([]);

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
      for (const order of orders) {
        if (!usernames[order.userId]) {
          const username = await fetchUserName(order.userId);
          usernames[order.userId] = username;
        }
      }
      setUsers(usernames);
    };

    fetchUsers();
  }, [orders]);

  const handleViewDetail = (id) => {
    navigate(`/order-detail/${id}`);
  };

  return (
    <div>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-white mt-4">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-white">
          <tr>
            <th scope="col" className="px-6 py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th scope="col" className="px-6 py-3">
              Mã đơn hàng
            </th>
            <th scope="col" className="px-6 py-3">
              Tên khách hàng
            </th>
            <th scope="col" className="px-6 py-3">
              Số sản phẩm
            </th>
            <th scope="col" className="px-6 py-3">
              Tổng tiền
            </th>
            <th scope="col" className="px-6 py-3">
              Phương thức thanh toán
            </th>
            <th scope="col" className="px-6 py-3">
              Trạng thái đơn hàng
            </th>
          </tr>
        </thead>
        <tbody>
          {(orders && Array.isArray(orders) ? orders : []).map((order) => (
            <tr
              key={order.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedOrderIds.includes(order.id)}
                  onChange={() => handleToggleSelect(order.id)}
                />
              </td>
              <td
                className="px-6 py-4 relative dark:text-white"
                onClick={() => handleViewDetail(order.id)}
              >
                <span className="group relative cursor-pointer hover:text-blue-500 hover:underline">
                  {order.orderId}
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                    Xem chi tiết đặt hàng
                  </span>
                </span>
              </td>
              <td className="px-6 py-4 dark:text-white">
                {users[order.userId] || "N/A"}
              </td>
              <td className="px-6 py-4 dark:text-white">{order.totalItems}</td>

              <td className="px-6 py-4 dark:text-white">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(order.totalPrice)}
              </td>
              <td className="px-6 py-4 dark:text-white">
                {order.paymentMethod}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded 
    ${getStatusColor(order.orderStatus)} 
    dark:text-white`}
                >
                  {order.orderStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderListTable;

const getStatusColor = (status) => {
  switch (status) {
    case "Chờ xác nhận":
      return "bg-yellow-100 text-yellow-800";
    case "Chờ lấy hàng":
      return "bg-indigo-100 text-indigo-800";
    case "Đang giao":
      return "bg-blue-100 text-blue-800";
    case "Đã giao":
      return "bg-emerald-100 text-emerald-800";
    case "Yêu cầu trả hàng":
      return "bg-orange-100 text-orange-800";
    case "Đã trả hàng":
      return "bg-purple-100 text-purple-800";
    case "Đã hủy":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
