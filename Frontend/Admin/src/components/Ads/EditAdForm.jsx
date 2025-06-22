import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useEditAd from "../../hooks/Ads/useEditAd";
import BackButton from "../BackButton";
import {
  FaTag,
  FaImage,
  FaLink,
  FaFileAlt,
  FaCalendarAlt,
} from "react-icons/fa";

const EditAdForm = () => {
  const { id } = useParams();
  const {
    ad,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
    getAdById,
    handleImageUpload,
  } = useEditAd(id);

  const [modalImage, setModalImage] = React.useState(null);

  useEffect(() => {
    if (id) {
      getAdById();
    }
  }, [id]);

  return (
    <>
      {" "}
      <div className="mb-4">
        <BackButton path="/ads-list" />
      </div>
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
              Chỉnh sửa quảng cáo thất bại. Vui lòng thử lại!
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
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
              Chỉnh sửa quảng cáo thành công.
            </div>
          </div>
        )}

        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="title"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaTag className="mr-2 text-indigo-500" />
              Tiêu Đề Quảng Cáo
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={ad.title || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Tiêu đề quảng cáo"
              required
            />
            {errors?.title && (
              <span className="text-red-500 text-sm">{errors.title}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="image"
              className="block mb-2 text-sm dark:text-white font-medium text-gray-900 flex items-center"
            >
              <FaImage className="mr-2 text-orange-500" />
              Ảnh quảng cáo
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
            {ad.image && (
              <div className="mt-4">
                <img
                  src={ad.image}
                  alt="Image"
                  className="w-24 h-24 object-contain rounded-lg cursor-pointer"
                  onClick={() => setModalImage(ad.image)}
                />
              </div>
            )}

            {modalImage && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setModalImage(null)}
              >
                <img
                  src={modalImage}
                  alt="Large view"
                  className="max-w-full max-h-[90vh] rounded-lg shadow-lg"
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

            {errors?.image && (
              <span className="text-red-500 text-sm">{errors.image}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="adType"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaTag className="mr-2 text-yellow-500" />
              Loại quảng cáo
            </label>
            <select
              id="adType"
              name="adType"
              value={ad.adType}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="main">Chính</option>
              <option value="secondary">Phụ</option>
            </select>

            {errors?.adType && (
              <span className="text-red-500 text-sm">{errors.adType}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="link"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaLink className="mr-2 text-blue-500" />
              Liên Kết
            </label>
            <input
              type="url"
              id="link"
              name="link"
              value={ad.link || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Liên kết quảng cáo"
              required
            />
            {errors?.link && (
              <span className="text-red-500 text-sm">{errors.link}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaFileAlt className="mr-2 text-purple-500" />
              Mô Tả
            </label>
            <textarea
              id="description"
              name="description"
              value={ad.description || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Mô tả quảng cáo"
              required
            />
            {errors?.description && (
              <span className="text-red-500 text-sm">{errors.description}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="startDate"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaCalendarAlt className="mr-2 text-green-500" />
              Ngày Bắt Đầu
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={ad.startDate || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
            {errors?.startDate && (
              <span className="text-red-500 text-sm">{errors.startDate}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaCalendarAlt className="mr-2 text-red-500" />
              Ngày Kết Thúc
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={ad.endDate || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            {errors?.endDate && (
              <span className="text-red-500 text-sm">{errors.endDate}</span>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isSubmitting ? "Đang chỉnh sửa..." : "Cập nhật quảng cáo"}
          </button>
        </div>
      </form>
      <div className="mt-4">
        <BackButton path="/ads-list" />
      </div>
    </>
  );
};

export default EditAdForm;
