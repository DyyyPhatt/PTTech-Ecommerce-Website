import React from "react";
import {
  FaCreditCard,
  FaShippingFast,
  FaMoneyBillAlt,
  FaClipboardCheck,
  FaFilter,
} from "react-icons/fa";

const OrderFilter = ({ onFilterChange }) => {
  return (
    <div className="mb-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
        <FaFilter className="text-blue-500 text-2xl" />
        Bộ lọc tìm kiếm
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Phương thức thanh toán",
            icon: <FaCreditCard />,
            name: "paymentMethod",
            options: [
              { value: "", label: "Tất cả" },
              { value: "VNPay", label: "Thẻ tín dụng (VNPay)" },
              { value: "COD", label: "Thanh toán khi nhận hàng" },
            ],
            style:
              "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-200",
          },
          {
            label: "Trạng thái thanh toán",
            icon: <FaMoneyBillAlt />,
            name: "paymentStatus",
            options: [
              { value: "", label: "Tất cả" },
              { value: "Đã thanh toán", label: "Đã thanh toán" },
              { value: "Chưa thanh toán", label: "Chưa thanh toán" },
            ],
            style:
              "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-700 dark:text-green-200",
          },
          {
            label: "Phương thức giao hàng",
            icon: <FaShippingFast />,
            name: "shippingMethod",
            options: [
              { value: "", label: "Tất cả" },
              { value: "Giao hàng nhanh", label: "Giao hàng nhanh" },
              { value: "Giao hàng tiết kiệm", label: "Giao hàng tiết kiệm" },
              { value: "Giao hàng hỏa tốc", label: "Giao hàng hỏa tốc" },
            ],
            style:
              "bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200",
          },
          {
            label: "Trạng thái đơn hàng",
            icon: <FaClipboardCheck />,
            name: "orderStatus",
            options: [
              { value: "", label: "Tất cả" },
              { value: "Chờ xác nhận", label: "Chờ xác nhận" },
              { value: "Chờ lấy hàng", label: "Chờ lấy hàng" },
              { value: "Đang giao", label: "Đang giao" },
              { value: "Đã giao", label: "Đã giao" },
              { value: "Đã nhận hàng", label: "Đã nhận hàng" },
              { value: "Yêu cầu trả hàng", label: "Yêu cầu trả hàng" },
              { value: "Đã trả hàng", label: "Đã trả hàng" },
              { value: "Từ chối trả hàng", label: "Từ chối trả hàng" },
              { value: "Đã hủy", label: "Đã hủy" },
            ],
            style:
              "bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-200",
          },
        ].map((filter) => (
          <div
            key={filter.name}
            className={`flex flex-col p-4 rounded-lg shadow-sm border ${filter.style}`}
          >
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              {filter.icon} {filter.label}
            </label>
            <select
              className="p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => onFilterChange(filter.name, e.target.value)}
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderFilter;
