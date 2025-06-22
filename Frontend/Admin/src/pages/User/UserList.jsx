import React, { useState, useEffect } from "react";
import UserListTable from "../../components/User/UserListTable";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useUserSearch from "../../hooks/User/useUserSearch";
import StatCard from "../../components/Dashboard/StatCard";
import { FaExclamationTriangle, FaCheck, FaTimes } from "react-icons/fa";

const UserList = () => {
  const {
    searchQuery,
    handleSearchChange,
    searchHistory,
    showHistory,
    handleFocus,
    handleBlur,
  } = useUserSearch();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [filterOption, setFilterOption] = useState("all-A-Z");
  const [selectedRole, setSelectedRole] = useState("all");
  const [roles, setRoles] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const [showSuccessMessage, setShowSuccessMessage] = useState({
    success: false,
    message: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [blockReason, setBlockReason] = useState("");
  const [actionType, setActionType] = useState("");
  const userToken = localStorage.getItem("userToken");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  };

  const handleToggleSelect = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allIds = sortedUsers.map((user) => user.id);
      setSelectedUserIds(allIds);
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-user/${id}`);
  };

  const fetchUsers = async () => {
    const response = await axios.get(
      "http://localhost:8081/api/users",
      axiosConfig
    );
    const usersWithAvatar = response.data.map((user) => ({
      ...user,
      previousAvatar: user.avatar,
    }));
    setUsers(usersWithAvatar);
  };

  const handleDelete = async (id) => {
    try {
      const userToDelete = users.find((user) => user.id === id);
      const avatarUrl = userToDelete?.previousAvatar || userToDelete?.avatar;

      const isDefaultAvatar =
        avatarUrl === "http://localhost:8081/images/default-avatar.png";

      const isServerAvatar = avatarUrl?.startsWith(
        "http://localhost:8081/images/"
      );

      if (isServerAvatar && !isDefaultAvatar) {
        try {
          await axios.delete(
            `http://localhost:8081/api/users/delete-avatar/${id}`,
            axiosConfig
          );
        } catch (error) {
          console.warn(
            "Không thể xóa avatar, tiếp tục xóa user:",
            error.message
          );
        }
      }

      await axios.delete(`http://localhost:8081/api/users/${id}`, axiosConfig);

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));

      setShowSuccessMessage({
        success: true,
        message: "Xóa người dùng thành công.",
      });

      setTimeout(
        () => setShowSuccessMessage({ success: false, message: "" }),
        3000
      );
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
    }
  };

  const handleToggleVisibility = async (id, isBlocked) => {
    try {
      const endpoint = isBlocked
        ? `http://localhost:8081/api/users/unblock/${id}`
        : `http://localhost:8081/api/users/block/${id}?blockReason=${encodeURIComponent(
            blockReason
          )}`;

      await axios.put(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, isBlocked: !isBlocked } : user
        )
      );

      setShowSuccessMessage({
        success: true,
        message: isBlocked
          ? "Bỏ chặn Người dùng thành công."
          : "Chặn Người dùng thành công.",
      });

      setTimeout(
        () => setShowSuccessMessage({ success: false, message: "" }),
        3000
      );
    } catch (error) {
      console.error("Error toggling user visibility:", error);
    }
  };

  const handleBatchDelete = async () => {
    for (const id of selectedUserIds) {
      await handleDelete(id);
    }
    setSelectedUserIds([]);
  };

  const handleBatchToggleVisibility = async () => {
    const selectedUsers = users.filter((user) =>
      selectedUserIds.includes(user.id)
    );
    for (const user of selectedUsers) {
      await handleToggleVisibility(user.id, user.isBlocked);
    }
  };

  const handleConfirmYes = () => {
    if (actionType === "delete") {
      handleDelete(selectedUserId);
    } else if (actionType === "toggle") {
      const user = users.find((u) => u.id === selectedUserId);
      const isBlocked = user?.isBlocked || false;
      handleToggleVisibility(
        selectedUserId,
        isBlocked,
        isBlocked ? "" : blockReason
      );
    } else if (actionType === "edit") {
      handleEdit(selectedUserId);
    } else if (actionType === "batch-delete") {
      handleBatchDelete();
    } else if (actionType === "batch-toggle") {
      handleBatchToggleVisibility();
    }

    setShowConfirmModal(false);
    setBlockReason("");
  };

  const handleConfirmNo = () => {
    setShowConfirmModal(false);
  };

  const handleBlockReasonChange = (event) => {
    setBlockReason(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = getUserToken();
      const response = await axios.get("http://localhost:8081/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const usersData = response.data;
      setUsers(usersData);

      const uniqueRoles = [
        ...new Set(
          usersData.flatMap((user) => user.roles.map((role) => role.roleName))
        ),
      ];
      setRoles(["all", ...uniqueRoles]);
    };

    fetchData();
  }, []);

  const roleMapping = {
    ADMIN: "Quản trị viên",
    MANAGER: "Quản lý",
    CUSTOMER: "Khách hàng",
    CUSTOMER_SUPPORT: "Hỗ trợ khách hàng",
    INVENTORY_MANAGER: "Quản lý kho",
    MARKETING: "Chuyên viên marketing",
  };

  const navigate = useNavigate();

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const handleAddUser = () => {
    navigate("/add-user");
  };

  const handleExportExcel = async () => {
    try {
      const token = getUserToken();
      const response = await axios.get(
        "http://localhost:8081/api/users/export-excel",
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "users.xlsx";
      link.click();
    } catch (error) {
      console.error("Error exporting file:", error);
    }
  };

  const searchedUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsers = users.length;

  const filteredUsers = searchedUsers.filter((user) => {
    if (filterOption === "false") return user.isBlocked;
    if (filterOption === "true") return !user.isBlocked;
    return true;
  });

  const roleFilteredUsers = filteredUsers.filter((user) => {
    if (selectedRole === "all") return true;
    return user.roles.some((role) => role.roleName === selectedRole);
  });

  const sortedUsers = roleFilteredUsers.sort((a, b) => {
    if (
      filterOption === "all-A-Z" ||
      filterOption === "false-A-Z" ||
      filterOption === "true-A-Z"
    ) {
      return a.username.localeCompare(b.username);
    }
    if (
      filterOption === "all-Z-A" ||
      filterOption === "false-Z-A" ||
      filterOption === "true-Z-A"
    ) {
      return b.username.localeCompare(a.username);
    }
    return 0;
  });

  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const getPageNumbers = (currentPage, totalPages) => {
    const pageNumbers = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      if (currentPage > 3) {
        pageNumbers.push("left-ellipsis");
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push("right-ellipsis");
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <>
      {showSuccessMessage.success && (
        <div
          id="toast-success"
          className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:text-gray-400 dark:bg-gray-800"
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
            className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
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

      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={handleConfirmNo}
        >
          <div
            className="relative bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-lg border-t-4 border-yellow-400 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-yellow-100 p-4 rounded-full mb-4">
                <FaExclamationTriangle className="text-yellow-500 text-3xl" />
              </div>

              {actionType === "delete" && (
                <>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    Xác nhận xóa người dùng
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Bạn có chắc chắn muốn xóa người dùng này không? Hành động
                    không thể hoàn tác.
                  </p>
                </>
              )}

              {actionType === "batch-delete" && (
                <>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    Xác nhận xóa nhiều người dùng
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Bạn có chắc chắn muốn xóa {selectedUserIds.length} người
                    dùng đã chọn không? Hành động không thể hoàn tác.
                  </p>
                </>
              )}

              {actionType === "toggle" &&
              users.find((user) => user.id === selectedUserId)?.isBlocked ? (
                <>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    Bỏ chặn người dùng?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Bạn có chắc chắn muốn bỏ chặn người dùng này không?
                  </p>
                </>
              ) : actionType === "toggle" ? (
                <>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    Chặn người dùng
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    Vui lòng nhập lý do chặn người dùng này:
                  </p>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={handleBlockReasonChange}
                    className="mt-2 p-2 border border-gray-300 rounded-md w-full dark:bg-gray-700 dark:text-white"
                    placeholder="Lý do block"
                  />
                </>
              ) : null}

              {actionType === "batch-toggle" &&
                (() => {
                  const selectedUsers = users.filter((user) =>
                    selectedUserIds.includes(user.id)
                  );
                  const hasUsersToBlock = selectedUsers.some(
                    (user) => !user.isBlocked
                  );

                  return (
                    <>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        Xác nhận chặn / bỏ chặn nhiều người dùng
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        Bạn có chắc chắn muốn thực hiện hành động chặn hoặc bỏ
                        chặn cho {selectedUserIds.length} người dùng đã chọn?
                      </p>

                      {hasUsersToBlock && (
                        <>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                            Vui lòng nhập lý do để chặn người dùng:
                          </p>
                          <input
                            type="text"
                            value={blockReason}
                            onChange={handleBlockReasonChange}
                            className="mt-2 p-2 border border-gray-300 rounded-md w-full dark:bg-gray-700 dark:text-white"
                            placeholder="Lý do block"
                          />
                        </>
                      )}
                    </>
                  );
                })()}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleConfirmYes}
                disabled={
                  (actionType === "toggle" &&
                    !users.find((u) => u.id === selectedUserId)?.isBlocked &&
                    !blockReason.trim()) ||
                  (actionType === "batch-toggle" &&
                    users
                      .filter((u) => selectedUserIds.includes(u.id))
                      .some((u) => !u.isBlocked) &&
                    !blockReason.trim())
                }
                className="px-6 py-3 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition duration-200 flex items-center gap-2 shadow-lg"
              >
                <FaCheck />
                Có, tiếp tục
              </button>

              <button
                onClick={handleConfirmNo}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition duration-200 flex items-center gap-2 shadow-lg"
              >
                <FaTimes />
                Không, hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <StatCard
            title="Tổng Người Dùng"
            value={totalUsers}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
          <StatCard
            title="Tổng Chặn"
            value={users.filter((user) => user.isBlocked).length}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
          <StatCard
            title="Tổng Hiển Thị"
            value={users.filter((user) => !user.isBlocked).length}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
        </div>

        <div className="flex items-center justify-between flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-4 w-full max-w-lg mt-3">
            <form className="flex items-center space-x-4 w-full">
              <label
                htmlFor="search"
                className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
              >
                Tìm kiếm
              </label>
              <div className="relative w-full max-w-xs">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  id="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder:text-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Nhập tên người dùng"
                  required
                />

                {showHistory && searchHistory.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded shadow-md z-10 dark:bg-gray-800 dark:border-gray-700">
                    <ul className="text-sm">
                      {searchHistory.map((item, index) => (
                        <li
                          key={index}
                          onMouseDown={() =>
                            handleSearchChange({ target: { value: item } })
                          }
                          className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </form>
            <div className="flex items-center space-x-4 mt-4 mb-4">
              <select
                className="block p-2.5 w-35 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
              >
                <option value="all-A-Z">A-Z</option>
                <option value="all-Z-A">Z-A</option>
                <option value="false">Bị chặn</option>
                <option value="true">Hiển thị</option>
              </select>

              <select
                className="block p-2.5 w-40 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role === "all"
                      ? "Tất cả vai trò"
                      : roleMapping[role] || role}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={handleExportExcel}
              className="text-white bg-pink-500 hover:bg-pink-600 focus:ring-4 focus:ring-pink-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-pink-700 mr-4 mt-3"
            >
              Xuất file
            </button>
            <button
              type="button"
              onClick={handleAddUser}
              className="text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-indigo-700 mr-4"
            >
              Thêm người dùng
            </button>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow dark:bg-gray-800">
          <div className="flex justify-end mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setActionType("batch-toggle");
                  setShowConfirmModal(true);
                }}
                disabled={selectedUserIds.length === 0}
                className="text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:focus:ring-yellow-800 disabled:opacity-50"
              >
                Chặn / Bỏ chặn
              </button>
              <button
                onClick={() => {
                  setActionType("batch-delete");
                  setShowConfirmModal(true);
                }}
                disabled={selectedUserIds.length === 0}
                className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:focus:ring-red-800 disabled:opacity-50"
              >
                Xóa
              </button>
            </div>
          </div>
          <UserListTable
            users={currentUsers}
            setUsers={setUsers}
            selectedUserIds={selectedUserIds}
            handleToggleSelect={handleToggleSelect}
            handleSelectAll={handleSelectAll}
            isAllSelected={
              selectedUserIds.length === sortedUsers.length &&
              sortedUsers.length > 0
            }
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <nav aria-label="Page navigation">
          <ul className="flex items-center space-x-1 text-sm">
            <li>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-l-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50
                     dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Previous
              </button>
            </li>

            {getPageNumbers(currentPage, totalPages).map((page, idx) => {
              if (page === "left-ellipsis" || page === "right-ellipsis") {
                return (
                  <li
                    key={page + idx}
                    className="px-2 select-none text-gray-700 dark:text-white"
                  >
                    ...
                  </li>
                );
              }
              return (
                <li key={page}>
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-lg
                ${
                  currentPage === page
                    ? "bg-blue-500 text-white dark:bg-blue-600"
                    : "text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                }
                dark:border-gray-600
              `}
                  >
                    {page}
                  </button>
                </li>
              );
            })}

            <li>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-r-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50
                     dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default UserList;
