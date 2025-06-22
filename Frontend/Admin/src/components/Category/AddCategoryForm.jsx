import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAddCategory from "../../hooks/Category/useAddCategory";
import { FaTag, FaImage, FaList, FaInfoCircle } from "react-icons/fa";
import BackButton from "../BackButton";
import { Select, Tag, Input } from "antd";
const { Option } = Select;

const getUserToken = () => {
  return localStorage.getItem("userToken");
};

const AddCategoryForm = () => {
  const [categories, setCategories] = useState([]);

  const {
    formData,
    previewImage,
    errors,
    isSubmitting,
    uploading,
    showSuccessMessage,
    showErrorMessage,
    handleInputChange,
    handleCategoryChange,
    handleSubmit,
  } = useAddCategory();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const userToken = getUserToken();
      try {
        const categoriesResponse = await fetch(
          "http://localhost:8081/api/categories",
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (showSuccessMessage) {
      setTimeout(() => {
        navigate("/category-list");
      }, 3000);
    }
  }, [showSuccessMessage, navigate]);

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6"
      >
        {showErrorMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-white bg-red-500 rounded-lg shadow-lg"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-white bg-red-400 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0Zm1 14h-2v-2h2v2Zm0-4h-2V6h2v4Z" />
              </svg>
            </div>
            <div className="ml-3 text-sm font-normal">
              Thêm danh mục thất bại. Vui lòng thử lại!
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            </div>
            <div className="ml-3 text-sm font-normal">
              Thêm danh mục thành công.
            </div>
          </div>
        )}

        <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaTag className="mr-2 text-indigo-500" />
              Tên danh mục
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
              placeholder="Tên danh mục"
              required
            />
            {errors?.name && (
              <span className="text-red-500 text-sm">{errors.name}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="parentCategoryId"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaList className="mr-2 text-green-500" />
              Danh mục cha
            </label>
            <Select
              style={{ width: "100%", height: "42px" }}
              placeholder="Chọn danh mục cha"
              value={formData.parentCategoryId || undefined}
              onChange={handleCategoryChange}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              tagRender={(props) => {
                const { label, value, closable, onClose } = props;
                return (
                  <Tag
                    color="blue"
                    closable={closable}
                    onClose={onClose}
                    style={{ marginRight: 3 }}
                  >
                    {label}
                  </Tag>
                );
              }}
            >
              {categories?.length > 0 ? (
                categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))
              ) : (
                <Option disabled>Không có danh mục nào</Option>
              )}
            </Select>
          </div>

          <div>
            <label
              htmlFor="image"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaImage className="mr-2 text-purple-500" />
              Hình ảnh danh mục
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleInputChange}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
            />
            {uploading && (
              <p className="text-blue-500 text-sm">Đang tải ảnh lên...</p>
            )}
            {errors?.image && (
              <p className="text-red-500 text-sm">{errors.image}</p>
            )}
            {previewImage && (
              <div className="mt-4">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 dark:text-white"
            >
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags.join(", ")}
              onChange={handleInputChange}
              placeholder="Nhập tags, cách nhau bằng dấu phẩy"
              className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.tags && (
              <p className="text-red-500 text-sm">{errors.tags}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
          >
            <FaInfoCircle className="mr-2 text-orange-500" />
            Mô tả
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={handleInputChange}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
            placeholder="Mô tả về danh mục"
          />
          {errors?.description && (
            <span className="text-red-500 text-sm">{errors.description}</span>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          >
            {isSubmitting ? "Đang thêm..." : "Thêm danh mục"}
          </button>
        </div>
      </form>

      <div className="mt-4">
        <BackButton path="/category-list" />
      </div>
    </div>
  );
};

export default AddCategoryForm;
