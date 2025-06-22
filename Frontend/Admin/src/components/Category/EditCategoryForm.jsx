import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useEditCategory from "../../hooks/Category/useEditCategory";
import BackButton from "../BackButton";
import { Select, Tag } from "antd";
import { FaTag, FaImage, FaList, FaInfoCircle } from "react-icons/fa";

const { Option } = Select;

const EditCategoryForm = () => {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };
  const {
    formData,
    errors,
    isSubmitting,
    showSuccessMessage,
    getCategoryById,
    showErrorMessage,
    handleInputChange,
    handleSubmit,
    handleCategoryChange,
    handleImageUpload,
  } = useEditCategory(id);

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
        console.log("Categories Data:", categoriesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (id) {
      getCategoryById();
    }
  }, [id]);

  return (
    <>
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
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0Zm1 14h-2v-2h2v2Zm0-4h-2V6h2v4Z" />
              </svg>
            </div>
            <div className="ml-3 text-sm font-normal">
              Chỉnh sửa danh mục thất bại. Vui lòng thử lại!
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200 rounded-lg">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            </div>
            <div className="ml-3 text-sm font-normal">
              Chỉnh sửa danh mục thành công.
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
              value={formData.parentCategoryId}
              onChange={(value) => handleCategoryChange(value)}
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
              {categories && categories.length > 0 ? (
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
            <div className="flex items-center space-x-4">
              <input
                type="file"
                id="image"
                name="image"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            {formData.image && (
              <img
                src={formData.image}
                alt="Image"
                className="w-20 h-20 object-contain rounded-lg mt-5"
              />
            )}
            {errors?.image && (
              <span className="text-red-500 text-sm">{errors.image}</span>
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
              value={formData.tags || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tags"
              required
            />
            {errors?.tags && (
              <span className="text-red-500 text-sm">{errors.tags}</span>
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Mô tả về danh mục"
            required
          />
          {errors?.description && (
            <span className="text-red-500 text-sm">{errors.description}</span>
          )}
        </div>

        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật danh mục"}
          </button>
        </div>
      </form>

      <div className="mt-4">
        <BackButton path="/category-list" />
      </div>
    </>
  );
};

export default EditCategoryForm;
