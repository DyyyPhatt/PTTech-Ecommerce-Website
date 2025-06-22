import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BrandListTable = ({
  brands,
  setBrands,
  selectedBrandIds,
  handleToggleSelect,
  handleSelectAll,
  isAllSelected,
}) => {
  const navigate = useNavigate();
  const [modalImage, setModalImage] = useState(null);

  const handleViewDetail = (id) => {
    navigate(`/brand-detail/${id}`);
  };

  return (
    <div>
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
              Logo
            </th>
            <th scope="col" className="px-6 py-3">
              Tên thương hiệu
            </th>
            <th scope="col" className="px-6 py-3">
              Quốc gia
            </th>
            <th scope="col" className="px-6 py-3">
              Website
            </th>
            <th scope="col" className="px-6 py-3">
              Trạng thái
            </th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr
              key={brand.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedBrandIds.includes(brand.id)}
                  onChange={() => handleToggleSelect(brand.id)}
                />
              </td>
              <td className="px-6 py-4">
                <img
                  className="w-10 h-10 object-contain object-center cursor-pointer"
                  src={brand.logo}
                  alt={brand.name}
                  onClick={() => setModalImage(brand.logo)}
                />
              </td>

              <td
                className="px-6 py-4 relative dark:text-white"
                onClick={() => handleViewDetail(brand.id)}
              >
                <span className="group relative cursor-pointer hover:text-blue-500 hover:underline">
                  {brand.name}
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                    Xem chi tiết danh mục
                  </span>
                </span>
              </td>

              <td className="px-6 py-4 dark:text-white">{brand.country}</td>
              <td className="px-6 py-4">
                <a
                  href={brand.website}
                  className="text-blue-500 hover:underline dark:text-blue-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {brand.website}
                </a>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded font-medium
      ${
        brand.isActive
          ? "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900"
          : "text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900"
      }`}
                >
                  {brand.isActive ? "Đang hiển thị" : "Đã ẩn"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BrandListTable;
