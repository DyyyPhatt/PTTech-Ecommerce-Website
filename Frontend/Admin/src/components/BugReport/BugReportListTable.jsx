import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const BugReportListTable = ({
  reports,
  setReports,
  selectedBugIds,
  handleToggleSelect,
  handleSelectAll,
  isAllSelected,
}) => {
  const [showToast, setShowToast] = useState({ visible: false, message: "" });
  const [confirm, setConfirm] = useState({ visible: false, reportId: null });
  const [statusModal, setStatusModal] = useState({
    visible: false,
    reportId: null,
    newStatus: "PENDING",
    adminNote: "",
  });

  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("userToken");

  const toast = (message) => {
    setShowToast({ visible: true, message });
    setTimeout(() => setShowToast({ visible: false, message: "" }), 3000);
  };

  const statusBadge = {
    PENDING: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    RESOLVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  const statusLabel = {
    PENDING: "Đang chờ",
    IN_PROGRESS: "Đang xử lý",
    RESOLVED: "Đã xử lý",
    REJECTED: "Từ chối",
  };

  const statusOrder = {
    PENDING: 0,
    IN_PROGRESS: 1,
    RESOLVED: 2,
    REJECTED: 3,
  };

  const handleViewDetail = (id) => {
    navigate(`/bug-detail/${id}`);
  };

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

  const submitStatus = async () => {
    const { reportId, newStatus, adminNote } = statusModal;
    try {
      const res = await axios.put(
        `http://localhost:8081/api/bug-reports/${reportId}`,
        { status: newStatus, adminNote },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setReports((prev) => prev.map((r) => (r.id === reportId ? res.data : r)));
      setStatusModal({
        visible: false,
        reportId: null,
        newStatus: "PENDING",
        adminNote: "",
      });
      toast("Cập nhật trạng thái thành công.");
    } catch (err) {
      console.error(err);
      toast("Không thể cập nhật trạng thái.");
    }
  };

  return (
    <div className="relative">
      {showToast.visible && (
        <div className="fixed top-4 right-4 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-gray-700 dark:text-white z-50 animate-fade-in">
          <svg
            className="w-5 h-5 text-green-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0a12 12 0 1 0 12 12A12.013 12.013 0 0 0 12 0Zm5.707 9.207-6 6a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 1.414-1.414L11 13.086l5.293-5.293a1 1 0 1 1 1.414 1.414Z" />
          </svg>
          <span className="text-sm font-medium">{showToast.message}</span>
        </div>
      )}

      {/* Status Modal */}
      {statusModal.visible && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-40"
          onClick={() =>
            setStatusModal({
              visible: false,
              reportId: null,
              newStatus: "PENDING",
              adminNote: "",
            })
          }
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl space-y-5 transform transition-all duration-300 scale-100 hover:scale-[1.01]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              🚀 Cập nhật trạng thái
            </h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trạng thái mới
              </label>
              <select
                value={statusModal.newStatus}
                onChange={(e) =>
                  setStatusModal((prev) => ({
                    ...prev,
                    newStatus: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(statusOrder)
                  .filter(
                    ([status, order]) =>
                      order >= statusOrder[statusModal.initialStatus]
                  )
                  .map(([status]) => (
                    <option key={status} value={status}>
                      {statusLabel[status]}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ghi chú (admin)
              </label>
              <textarea
                rows={3}
                value={statusModal.adminNote}
                onChange={(e) =>
                  setStatusModal((prev) => ({
                    ...prev,
                    adminNote: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Nhập ghi chú nếu cần..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                onClick={() =>
                  setStatusModal({
                    visible: false,
                    reportId: null,
                    newStatus: "PENDING",
                    adminNote: "",
                  })
                }
              >
                Huỷ
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={submitStatus}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirm.visible && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-40"
          onClick={() => setConfirm({ visible: false, reportId: null })}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Xác nhận xoá báo lỗi
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Thao tác này sẽ xoá mềm báo lỗi cùng các file media. Bạn có chắc
              chắn?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded"
                onClick={() => setConfirm({ visible: false, reportId: null })}
              >
                Huỷ
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => {
                  handleDelete(confirm.reportId);
                  setConfirm({ visible: false, reportId: null });
                }}
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mt-4">
        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th scope="col" className="px-6 py-3">
              Loại lỗi
            </th>
            <th scope="col" className="px-6 py-3">
              Mô tả
            </th>

            <th scope="col" className="px-6 py-3">
              Trạng thái
            </th>
            <th scope="col" className="px-6 py-3">
              Ngày tạo
            </th>
          </tr>
        </thead>

        <tbody>
          {reports.map((report) => (
            <tr
              key={report.id}
              className="border-b bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <td className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedBugIds.includes(report.id)}
                  onChange={() => handleToggleSelect(report.id)}
                />
              </td>
              <td
                className="px-6 py-4 relative dark:text-white"
                onClick={() => handleViewDetail(report.id)}
              >
                <span className="group relative cursor-pointer hover:text-blue-500 hover:underline">
                  {report.bugType}
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                    Xem chi tiết lỗi
                  </span>
                </span>
              </td>

              <td
                className="px-4 py-2 truncate max-w-xs text-gray-900 dark:text-white"
                title={report.description}
              >
                {report.description.slice(0, 60)}...
              </td>

              <td className="px-4 py-2">
                <div
                  className="relative group cursor-pointer w-fit"
                  onClick={() =>
                    setStatusModal({
                      visible: true,
                      reportId: report.id,
                      newStatus: report.status,
                      initialStatus: report.status,
                    })
                  }
                >
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      statusBadge[report.status]
                    }`}
                  >
                    {statusLabel[report.status]}
                  </span>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    Cập nhật trạng thái
                  </span>
                </div>
              </td>

              <td className="px-4 py-2 text-gray-900 dark:text-white">
                {dayjs(report.createdAt).format("DD/MM/YYYY")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BugReportListTable;
