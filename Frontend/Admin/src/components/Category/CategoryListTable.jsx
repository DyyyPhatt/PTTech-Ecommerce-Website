import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";

const getUserToken = () => {
  return localStorage.getItem("userToken");
};

const CategoryListTable = ({
  categories,
  setCategories,
  selectedCategoryIds,
  handleToggleSelect,
  handleSelectAll,
  isAllSelected,
}) => {
  const navigate = useNavigate();
  const [modalImage, setModalImage] = useState(null);

  const handleViewDetail = (id) => navigate(`/category-detail/${id}`);

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
              Hình ảnh
            </th>
            <th scope="col" className="px-6 py-3">
              Tên danh mục
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
          {categories.map((category) => (
            <tr
              key={category.id}
              className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600"
            >
              <td className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(category.id)}
                  onChange={() => handleToggleSelect(category.id)}
                />
              </td>
              <td className="px-6 py-4">
                <img
                  className="w-10 h-10 object-contain object-center cursor-pointer"
                  src={category.image}
                  alt={category.name}
                  onClick={() => setModalImage(category.image)}
                />
              </td>

              <td
                className="px-6 py-4 relative dark:text-white"
                onClick={() => handleViewDetail(category.id)}
              >
                <span className="group relative cursor-pointer hover:text-blue-500 hover:underline">
                  {category.name}
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                    Xem chi tiết thương hiệu
                  </span>
                </span>
              </td>
              <td className="px-6 py-4 dark:text-white max-w-xs truncate">
                {category.description}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded font-medium
      ${
        category.isActive
          ? "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900"
          : "text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900"
      }`}
                >
                  {category.isActive ? "Đang hiển thị" : "Đã ẩn"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

CategoryListTable.propTypes = {
  categories: PropTypes.array.isRequired,
  setCategories: PropTypes.func.isRequired,
};

export default CategoryListTable;
