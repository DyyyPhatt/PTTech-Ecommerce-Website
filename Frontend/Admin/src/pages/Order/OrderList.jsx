import React, { useState, useEffect } from "react";
import OrderListTable from "../../components/Order/OrderListTable";
import useOrderSearch from "../../hooks/Order/useOrderSearch";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/Dashboard/StatCard";
import axios from "axios";
import { FaExclamationTriangle, FaCheck, FaTimes } from "react-icons/fa";
import OrderStatusPieChart from "../../components/Order/OrderStatusPieChart";

const OrderList = () => {
  const {
    searchQuery,
    handleSearchChange,
    searchHistory,
    showHistory,
    handleFocus,
    handleBlur,
  } = useOrderSearch();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [users, setUsers] = useState({});
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const openChartModal = () => setIsChartModalOpen(true);
  const closeChartModal = () => setIsChartModalOpen(false);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");

  const handlePaymentMethodChange = (e) => {
    setPaymentMethodFilter(e.target.value);
  };

  const navigate = useNavigate();
  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const [showSuccessMessage, setShowSuccessMessage] = useState({
    success: false,
    message: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  const handleDelete = async (id) => {
    const userToken = getUserToken();
    try {
      const response = await axios.delete(
        `http://localhost:8081/api/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      console.log("Delete response:", response);
      if (response.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== id)
        );
        setShowSuccessMessage({
          success: true,
          message: "Xóa Đơn đặt hàng thành công.",
        });
        setTimeout(
          () => setShowSuccessMessage({ success: false, message: "" }),
          3000
        );
      } else {
        console.error("Lỗi khi xóa đơn hàng:", response);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      setShowSuccessMessage({
        success: false,
        message: "Xóa Đơn đặt hàng thất bại. Vui lòng thử lại.",
      });
      setTimeout(
        () => setShowSuccessMessage({ success: false, message: "" }),
        3000
      );
    }
  };

  const handleConfirmYes = () => {
    if (actionType === "delete") {
      handleDelete(selectedOrderId);
    } else if (actionType === "batch-delete") {
      handleBatchDelete();
    }

    setShowConfirmModal(false);
  };

  const handleConfirmNo = () => {
    setShowConfirmModal(false);
  };

  const handleBatchDelete = async () => {
    for (const id of selectedOrderIds) {
      await handleDelete(id);
    }
    setSelectedOrderIds([]);
  };

  const handleToggleSelect = (id) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allIds = filteredOrders.map((inventory) => inventory.id);
      setSelectedOrderIds(allIds);
    } else {
      setSelectedOrderIds([]);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = getUserToken();
        const response = await axios.get("http://localhost:8081/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

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
        const id = order.userId;
        if (!usernames[id]) {
          const username = await fetchUserName(id);
          usernames[id] = username;
        }
      }
      setUsers(usernames);
    };

    if (orders.length > 0) {
      fetchUsers();
    }
  }, [orders]);

  const searchedOrders = orders.filter((order) => {
    const orderId = order.orderId?.toLowerCase() || "";
    const username = users[order.userId]?.toLowerCase() || "";

    return (
      orderId.includes(searchQuery.toLowerCase()) ||
      username.includes(searchQuery.toLowerCase())
    );
  });

  const filteredOrders = searchedOrders.filter((order) => {
    const matchStatus = statusFilter
      ? order.orderStatus === statusFilter
      : true;
    const matchPayment =
      paymentMethodFilter !== ""
        ? order.paymentMethod === paymentMethodFilter
        : true;

    return matchStatus && matchPayment;
  });

  const totalOrders = filteredOrders.length;

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleAddOrder = () => {
    navigate("/add-order");
  };

  const handleExportExcel = async () => {
    try {
      const token = getUserToken();
      const response = await axios.get(
        "http://localhost:8081/api/orders/export-excel",
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
      link.download = "orders.xlsx";
      link.click();
    } catch (error) {
      console.error("Error exporting file:", error);
    }
  };

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const calculateOrderStatusCount = (status) => {
    return filteredOrders.filter((order) => order.orderStatus === status)
      .length;
  };

  const awaitingConfirmation = calculateOrderStatusCount("Chờ xác nhận");
  const awaitingPickup = calculateOrderStatusCount("Chờ lấy hàng");
  const shipping = calculateOrderStatusCount("Đang giao");
  const delivered = calculateOrderStatusCount("Đã giao");
  const cancelled = calculateOrderStatusCount("Đã hủy");
  const requestreturned = calculateOrderStatusCount("Yêu cầu trả hàng");
  const returned = calculateOrderStatusCount("Đã trả hàng");

  const pieData = [
    { name: "Chờ xác nhận", value: awaitingConfirmation },
    { name: "Chờ lấy hàng", value: awaitingPickup },
    { name: "Đang giao", value: shipping },
    { name: "Đã giao", value: delivered },
    { name: "Đã hủy", value: cancelled },
    { name: "Yêu cầu trả hàng", value: requestreturned },
    { name: "Đã trả hàng", value: returned },
  ];

  const getPageNumbers = (currentPage, totalPages) => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <>
      {showSuccessMessage.success && (
        <div
          id="toast-success"
          className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:text-white dark:bg-gray-800"
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
      )}{" "}
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
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Xác nhận hành động
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Bạn có chắc chắn muốn thực hiện hành động này không? Hành động
                không thể hoàn tác.
              </p>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleConfirmYes}
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
      {isChartModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
          onClick={closeChartModal}
        >
          <div
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeChartModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <OrderStatusPieChart data={pieData} />
          </div>
        </div>
      )}
      <div className="mt-4 relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-4">
          <StatCard
            title="Tổng đơn hàng"
            value={totalOrders}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
          <StatCard
            title="Chờ xác nhận"
            value={awaitingConfirmation}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
          <StatCard
            title="Chờ lấy hàng"
            value={awaitingPickup}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
          <StatCard
            title="Đang giao"
            value={shipping}
            className="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
          <StatCard
            title="Đã giao"
            value={delivered}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
          <StatCard
            title="Đã hủy"
            value={cancelled}
            className="bg-gradient-to-r from-gray-500 to-gray-700 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
          <StatCard
            title="Yêu cầu trả hàng"
            value={requestreturned}
            className="bg-gradient-to-r from-fuchsia-600 to-rose-400 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
          <StatCard
            title="Đã trả hàng"
            value={returned}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
        </div>
        <div className="flex items-center justify-between flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900">
          <div className="flex mt-4 flex-wrap md:flex-nowrap gap-4 items-center bg-white dark:bg-gray-900 p-4 rounded-md shadow-sm">
            <div className="relative w-full md:w-1/2">
              <input
                type="search"
                id="search"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Nhập tên khách hàng"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 20 20"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>

              {/* Lịch sử tìm kiếm */}
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

            {/* Lọc theo trạng thái */}
            <select
              id="status"
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full md:w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Chờ lấy hàng">Chờ lấy hàng</option>
              <option value="Đang giao">Đang giao</option>
              <option value="Đã giao">Đã giao</option>
              <option value="Đã hủy">Đã hủy</option>
              <option value="Yêu cầu trả hàng">Yêu cầu trả hàng</option>
              <option value="Đã trả hàng">Trả hàng</option>
            </select>

            {/* Lọc theo phương thức thanh toán */}
            <select
              id="paymentMethod"
              value={paymentMethodFilter}
              onChange={handlePaymentMethodChange}
              className="w-full md:w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Tất cả phương thức</option>
              <option value="COD">COD</option>
              <option value="VNPay">VNPay</option>
            </select>
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
              onClick={openChartModal}
              className="text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-orange-700 mr-4 mt-3"
            >
              Xem biểu đồ
            </button>
            <button
              type="button"
              onClick={handleAddOrder}
              className="text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-indigo-700 mr-4"
            >
              Thêm đơn đặt hàng
            </button>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow dark:bg-gray-800">
          <div className="flex justify-end mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setActionType("batch-delete");
                  setShowConfirmModal(true);
                }}
                disabled={selectedOrderIds.length === 0}
                className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:focus:ring-red-800 disabled:opacity-50"
              >
                Xóa
              </button>
            </div>
          </div>
          <OrderListTable
            statusFilter={statusFilter}
            orders={paginatedOrders}
            setOrders={setOrders}
            selectedOrderIds={selectedOrderIds}
            handleToggleSelect={handleToggleSelect}
            handleSelectAll={handleSelectAll}
            isAllSelected={
              selectedOrderIds.length === filteredOrders.length &&
              filteredOrders.length > 0
            }
            handleDelete={handleDelete}
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
                className="px-4 py-2 rounded-l-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Previous
              </button>
            </li>

            {getPageNumbers(currentPage, totalPages).map((page, index) => (
              <li key={index}>
                {page === "..." ? (
                  <span className="px-4 py-2 border border-transparent cursor-default dark:text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-lg ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    } dark:border-gray-600`}
                  >
                    {page}
                  </button>
                )}
              </li>
            ))}

            <li>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-r-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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

export default OrderList;
