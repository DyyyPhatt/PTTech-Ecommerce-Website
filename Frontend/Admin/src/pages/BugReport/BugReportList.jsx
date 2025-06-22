import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StatCard from "../../components/Dashboard/StatCard";
import { FaExclamationTriangle, FaCheck, FaTimes } from "react-icons/fa";
import BugReportListTable from "../../components/BugReport/BugReportListTable";

const BugReportList = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const REPORTS_PER_PAGE = 10;
  const [statusFilter, setStatusFilter] = useState("");
  const [showToast, setShowToast] = useState({ visible: false, message: "" });
  const toast = (message) => {
    setShowToast({ visible: true, message });
    setTimeout(() => setShowToast({ visible: false, message: "" }), 3000);
  };
  const [showSuccessMessage, setShowSuccessMessage] = useState({
    success: false,
    message: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedBugId, setSelectedBugId] = useState(null);
  const [selectedBugIds, setSelectedBugIds] = useState([]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8081/api/bug-reports/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast("Xóa báo lỗi thành công.");
    } catch (err) {
      console.error(err);
      toast("Không thể xóa báo lỗi.");
    }
  };

  const handleConfirmYes = () => {
    if (actionType === "delete") {
      handleDelete(selectedBugId);
    } else if (actionType === "batch-delete") {
      handleBatchDelete();
    }

    setShowConfirmModal(false);
  };

  const handleConfirmNo = () => {
    setShowConfirmModal(false);
  };

  const handleBatchDelete = async () => {
    for (const id of selectedBugIds) {
      await handleDelete(id);
    }
    setSelectedBugIds([]);
  };

  const handleToggleSelect = (id) => {
    setSelectedBugIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allIds = filteredReports.map((r) => r.id);
      setSelectedBugIds(allIds);
    } else {
      setSelectedBugIds([]);
    }
  };

  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("userToken");

  const fetchReports = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/bug-reports", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setReports(res.data);
    } catch (e) {
      console.error("Error fetching bug reports:", e);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value && !searchHistory.includes(value)) {
      setSearchHistory((prev) => [...prev.slice(-4), value]);
    }
  };
  const handleFocus = () => setShowHistory(true);
  const handleBlur = () => setTimeout(() => setShowHistory(false), 150);

  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      r.email?.toLowerCase().includes(q) ||
      r.bugType?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q);

    const matchStatus = statusFilter ? r.status === statusFilter : true;

    return matchSearch && matchStatus;
  });

  const totalReports = filteredReports.length;
  const totalPages = Math.ceil(totalReports / REPORTS_PER_PAGE) || 1;
  const indexOfLast = currentPage * REPORTS_PER_PAGE;
  const currentReports = filteredReports.slice(
    indexOfLast - REPORTS_PER_PAGE,
    indexOfLast
  );

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleAddBug = () => {
    navigate("/add-bug");
  };

  return (
    <>
      {showSuccessMessage.success && (
        <div
          id="toast-success"
          className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-lg"
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200 rounded-lg">
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
          <div className="ms-3 text-sm font-normal">
            {showSuccessMessage.message}
          </div>
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 inline-flex items-center justify-center h-8 w-8"
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
      <div className="mt-4 w-full relative shadow-md sm:rounded-lg">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <StatCard
            title="Tổng báo lỗi"
            value={totalReports}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
        </div>

        <div className="ml-4 flex items-center justify-between flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900">
          <form className="flex items-center space-x-4 w-full max-w-lg mt-3">
            <div className="relative w-full max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.3 6.3a7.5 7.5 0 0 0 10.35 10.35Z"
                />
              </svg>
              <input
                type="search"
                placeholder="Nhập loại lỗi"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="block w-full p-4 pl-10 text-sm border rounded-lg bg-gray-50 border-gray-300 text-gray-900 
             focus:ring-blue-500 focus:border-blue-500 
             dark:bg-gray-700 dark:border-gray-600 dark:text-white 
             dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />

              {showHistory && searchHistory.length > 0 && (
                <div
                  className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded shadow-md z-10 
                  dark:bg-gray-800 dark:border-gray-700"
                >
                  <ul className="text-sm max-h-40 overflow-auto text-gray-900 dark:text-white">
                    {searchHistory.map((item, idx) => (
                      <li
                        key={idx}
                        onMouseDown={() =>
                          handleSearchChange({ target: { value: item } })
                        }
                        className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-3 text-sm border rounded-lg bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Đang chờ</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Đã xử lý</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </form>
          <button
            type="button"
            onClick={handleAddBug}
            className="text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-indigo-700 mr-4"
          >
            Thêm báo lỗi
          </button>
        </div>
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow dark:bg-gray-800">
          <div className="flex justify-end mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setActionType("batch-delete");
                  setShowConfirmModal(true);
                }}
                disabled={selectedBugIds.length === 0}
                className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:focus:ring-red-800 disabled:opacity-50"
              >
                Xóa
              </button>
            </div>
          </div>
          <BugReportListTable
            reports={currentReports}
            setReports={setReports}
            selectedBugIds={selectedBugIds}
            handleToggleSelect={handleToggleSelect}
            handleSelectAll={handleSelectAll}
            isAllSelected={
              selectedBugIds.length === filteredReports.length &&
              filteredReports.length > 0
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
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-l-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 
                     dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:disabled:text-gray-500"
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p}>
                <button
                  onClick={() => changePage(p)}
                  className={`px-4 py-2 border rounded-lg ${
                    currentPage === p
                      ? "bg-blue-500 text-white dark:bg-blue-600"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {p}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-r-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 
                     dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:disabled:text-gray-500"
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

export default BugReportList;
