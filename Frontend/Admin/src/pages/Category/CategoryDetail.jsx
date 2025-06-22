import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaList, FaInfoCircle, FaTag, FaBullseye } from "react-icons/fa";
import BackButton from "../../components/BackButton";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) {
    return "Ngày không hợp lệ";
  }
  return new Intl.DateTimeFormat("vi-VN").format(date);
};

const CategoryDetail = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [parentCategoryName, setParentCategoryName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoryDetail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8081/api/categories/${id}`
        );
        setCategory(response.data);

        if (response.data.parentCategoryId) {
          const parentResponse = await axios.get(
            `http://localhost:8081/api/categories/${response.data.parentCategoryId}`
          );
          setParentCategoryName(parentResponse.data.name);
        }
      } catch (error) {
        setError("Không thể tải thông tin danh mục.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategoryDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-blue-600">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Không tìm thấy danh mục.</div>
      </div>
    );
  }

  const {
    name,
    description,
    parentCategoryId,
    image,
    tags,
    isActive,
    isDeleted,
    createdAt,
    updatedAt,
  } = category;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto flex justify-center items-center space-x-4">
        <h1 className="text-3xl font-semibold text-gray-800 text-center dark:text-white">
          Chi tiết danh mục
        </h1>
      </div>

      <div className="max-w-4xl mx-auto mt-8 bg-white overflow-hidden shadow-lg rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-6 py-5 sm:px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-6">
            <img
              className="w-16 h-16 object-contain object-center"
              src={image}
              alt={name}
            />
            <div>
              <h3 className="text-3xl font-semibold">{name}</h3>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:p-0 dark:border-gray-700">
          <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaInfoCircle className="inline mr-2 text-orange-500" />
                Mô tả
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-white">
                {description}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaList className="inline mr-2 text-green-500" />
                Danh mục cha
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-white">
                {parentCategoryId
                  ? parentCategoryName || "Đang tải tên danh mục cha..."
                  : "Không có"}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaTag className="inline mr-2 text-yellow-500" />
                Tags
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-white">
                {tags && tags.length > 0 ? tags.join(", ") : "Không có tag"}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaBullseye className="inline mr-2 text-green-500" />
                Trạng thái
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-white">
                {isActive ? (
                  <span className="text-green-500 font-semibold">Hiển thị</span>
                ) : (
                  <span className="text-red-500 font-semibold">Ẩn</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex justify-between mt-4">
        <BackButton path="/category-list" />
        <button
          onClick={() => navigate(`/edit-category/${id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
            />
          </svg>
          <span>Chỉnh sửa danh mục</span>
        </button>
      </div>
    </div>
  );
  
};

export default CategoryDetail;
