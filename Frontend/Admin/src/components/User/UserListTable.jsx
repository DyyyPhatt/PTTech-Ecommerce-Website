import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserListTable = ({
  users,
  selectedUserIds,
  handleToggleSelect,
  handleSelectAll,
  isAllSelected,
}) => {
  const navigate = useNavigate();
  const [modalImage, setModalImage] = useState(null);

  const roleMapping = {
    ADMIN: "Quản trị viên",
    MANAGER: "Quản lý",
    CUSTOMER: "Khách hàng",
    CUSTOMER_SUPPORT: "Hỗ trợ khách hàng",
    INVENTORY_MANAGER: "Quản lý kho",
    MARKETING: "Chuyên viên marketing",
  };

  const userToken = localStorage.getItem("userToken");

  const handleViewDetail = (id) => {
    navigate(`/user-detail/${id}`);
  };

  return (
    <div>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-white mt-4">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-white">
          <tr>
            <th className="px-6 py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th scope="col" className="px-6 py-3">
              Thông tin
            </th>
            <th scope="col" className="px-6 py-3">
              Vai trò
            </th>
            <th scope="col" className="px-6 py-3">
              Trạng thái
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user.id)}
                  onChange={() => handleToggleSelect(user.id)}
                />
              </td>
              <th
                scope="row"
                className="hover:text-blue-500 cursor-pointer hover:underline flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                onClick={() => handleViewDetail(user.id)}
              >
                <img
                  className="w-10 h-10 rounded-full cursor-pointer"
                  src={user.avatar}
                  alt={user.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalImage(user.avatar);
                  }}
                />

                <div className="ps-3">
                  <div className="text-base font-semibold dark:text-white group relative w-fit">
                    {user.username}
                    <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                      Xem chi tiết người dùng
                    </span>
                  </div>

                  <div className="font-normal text-gray-500 dark:text-white">
                    {user.email}
                  </div>
                  <div className="font-normal text-gray-500 dark:text-white">
                    {user.phoneNumber}
                  </div>
                </div>
              </th>

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

              <td className="px-6 py-4">
                {Array.isArray(user.roles) ? (
                  user.roles.map((role, index) => (
                    <div key={index}>
                      <div>
                        <strong className="dark:text-white">
                          {roleMapping[role.roleName] || role.roleName}
                        </strong>
                      </div>
                    </div>
                  ))
                ) : (
                  <span>{roleMapping[user.roles] || user.roles}</span>
                )}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded font-medium
      ${
        user.isBlocked
          ? "text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900"
          : "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900"
      }`}
                >
                  {user.isBlocked ? "Đã chặn" : "Đang hiển thị"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserListTable;
