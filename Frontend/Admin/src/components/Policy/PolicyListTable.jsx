import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PolicyListTable = ({
  policies,
  selectedPolicyIds,
  handleToggleSelect,
  handleSelectAll,
  isAllSelected,
}) => {
  const navigate = useNavigate();
  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const handleViewDetail = (id) => {
    navigate(`/policy-detail/${id}`);
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
              Loại chính sách
            </th>
            <th scope="col" className="px-6 py-3">
              Tiêu đề
            </th>
            <th scope="col" className="px-6 py-3">
              Mô tả
            </th>
            <th scope="col" className="px-6 py-3">
              Trạng thái
            </th>
          </tr>
        </thead>
        <tbody>
          {policies.map((policy) => (
            <tr
              key={policy.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedPolicyIds.includes(policy.id)}
                  onChange={() => handleToggleSelect(policy.id)}
                />
              </td>

              <td
                className="px-6 py-4 cursor-pointer hover:text-blue-500 hover:underline dark:hover:bg-gray-700 dark:text-blue-400"
                onClick={() => handleViewDetail(policy.id)}
              >
                <div className="w-full h-full">{policy.type}</div>
              </td>
              <td className="px-6 py-4 dark:text-white">{policy.title}</td>
              <td className="px-6 py-4 dark:text-white max-w-xs truncate">
                {policy.description}
              </td>

              <td className="px-6 py-4">
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded font-medium
      ${
        policy.isActive
          ? "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900"
          : "text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900"
      }`}
                >
                  {policy.isActive ? "Đang hiển thị" : "Đã ẩn"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PolicyListTable;
