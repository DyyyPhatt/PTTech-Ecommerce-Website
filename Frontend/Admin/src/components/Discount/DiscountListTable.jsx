import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DiscountListTable = ({
  discounts,
  setDiscounts,
  selectedDiscountIds,
  handleToggleSelect,
  handleSelectAll,
  isAllSelected,
}) => {
  const navigate = useNavigate();
  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const handleViewDetail = (id) => {
    navigate(`/discount-detail/${id}`);
  };

  return (
    <div>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mt-4">
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
              Mã giảm giá
            </th>
            <th scope="col" className="px-6 py-3">
              Mô tả
            </th>
            <th scope="col" className="px-6 py-3">
              Loại giảm giá
            </th>
            <th scope="col" className="px-6 py-3">
              Giá trị giảm giá
            </th>
            <th scope="col" className="px-6 py-3">
              Ngày bắt đầu
            </th>
            <th scope="col" className="px-6 py-3">
              Ngày kết thúc
            </th>
            <th scope="col" className="px-6 py-3">
              Trạng thái
            </th>
          </tr>
        </thead>
        <tbody>
          {discounts.map((discount) => (
            <tr
              key={discount.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedDiscountIds.includes(discount.id)}
                  onChange={() => handleToggleSelect(discount.id)}
                />
              </td>
              <td
                className="px-6 py-4 relative dark:text-white"
                onClick={() => handleViewDetail(discount.id)}
              >
                <span className="group relative cursor-pointer hover:text-blue-500 hover:underline">
                  {discount.code}
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                    Xem chi tiết mã giảm giá
                  </span>
                </span>
              </td>
              <td
                className="truncate max-w-[200px]"
                title={discount.description}
              >
                {discount.description}
              </td>
              <td className="px-6 py-4 text-gray-900 dark:text-white">
                {discount.discountType === "percentage"
                  ? "Phần trăm"
                  : "Số tiền"}
              </td>
              <td className="px-6 py-4 text-gray-900 dark:text-white">
                {discount.discountType === "percentage"
                  ? `${discount.discountValue}%`
                  : new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })
                      .format(discount.discountValue)
                      .replace("VND", "đ")}
              </td>
              <td className="px-6 py-4 text-gray-900 dark:text-white">
                {new Date(discount.startDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-gray-900 dark:text-white">
                {new Date(discount.endDate).toLocaleDateString()}
              </td>{" "}
              <td className="px-6 py-4">
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded font-medium
      ${
        discount.isActive
          ? "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900"
          : "text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900"
      }`}
                >
                  {discount.isActive ? "Đang hiển thị" : "Đã ẩn"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiscountListTable;
