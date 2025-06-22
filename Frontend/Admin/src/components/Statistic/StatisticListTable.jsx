import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const StatisticListTable = ({ statistics }) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState({
    success: false,
    message: "",
  });
  const navigate = useNavigate();

  const handleViewDetail = (id) => {
    navigate(`/statistic-detail/${id}`);
  };

  return (
    <div>
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
          <div className="ms-3 text-sm font-normal dark:text-gray-100">
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

      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-300 mt-4">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
          <tr>
            <th scope="col" className="px-6 py-3">
              Ngày
            </th>
            <th scope="col" className="px-6 py-3">
              Tổng đơn hàng
            </th>
            <th scope="col" className="px-6 py-3">
              Tổng sản phẩm bán ra
            </th>
            <th scope="col" className="px-6 py-3">
              Tổng doanh thu
            </th>
          </tr>
        </thead>
        <tbody>
          {statistics.map((statistic) => (
            <tr
              key={statistic.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td
                className="px-6 py-4 cursor-pointer hover:text-blue-500 hover:underline dark:hover:bg-gray-700 dark:text-blue-400"
                onClick={() => handleViewDetail(statistic.id)}
              >
                <div className="w-full h-full group relative">
                  <span>{new Date(statistic.date).toLocaleDateString()}</span>

                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                    Xem chi tiết thống kê
                  </span>
                </div>
              </td>

              <td className="px-6 py-4 dark:text-gray-100">
                {statistic.totalOrders}
              </td>
              <td className="px-6 py-4 dark:text-gray-100">
                {statistic.totalItemsSold}
              </td>
              <td className="px-6 py-4 dark:text-gray-100">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })
                  .format(statistic.totalRevenue)
                  .replace("₫", "đ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatisticListTable;
