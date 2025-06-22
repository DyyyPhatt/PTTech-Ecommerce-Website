import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdsListTable = ({
  ads,
  setAds,
  selectedAdIds,
  handleToggleSelect,
  handleSelectAll,
  isAllSelected,
}) => {
  const navigate = useNavigate();

  const [modalImage, setModalImage] = React.useState(null);

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const userToken = localStorage.getItem("userToken");

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8081/api",
    headers: {
      Authorization: userToken ? `Bearer ${userToken}` : "",
    },
  });

  const handleViewDetail = (id) => {
    navigate(`/ads-detail/${id}`);
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
              Quảng cáo
            </th>
            <th scope="col" className="px-6 py-3">
              Tiêu đề quảng cáo
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
          {ads.map((ad) => (
            <tr
              key={ad.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedAdIds.includes(ad.id)}
                  onChange={() => handleToggleSelect(ad.id)}
                />
              </td>
              <td className="px-6 py-4">
                <img
                  className="w-10 h-10 rounded-full cursor-pointer"
                  src={ad.image}
                  alt={ad.title}
                  onClick={() => setModalImage(ad.image)}
                />

                {modalImage && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setModalImage(null)}
                  >
                    <img
                      src={modalImage}
                      alt="Large view"
                      className="max-w-full max-h-[90vh] rounded-lg shadow-xl"
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
              </td>

              <td
                className="px-6 py-4 relative dark:text-white"
                onClick={() => handleViewDetail(ad.id)}
              >
                <span className="group relative cursor-pointer hover:text-blue-500 hover:underline">
                  {ad.title}
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                    Xem chi tiết quảng cáo
                  </span>
                </span>
              </td>
              <td className="px-6 py-4 dark:text-white">
                {formatDate(ad.startDate)}
              </td>
              <td className="px-6 py-4 dark:text-white">
                {formatDate(ad.endDate)}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded font-medium
      ${
        ad.isActive
          ? "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900"
          : "text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900"
      }`}
                >
                  {ad.isActive ? "Đang hiển thị" : "Đã ẩn"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdsListTable;
