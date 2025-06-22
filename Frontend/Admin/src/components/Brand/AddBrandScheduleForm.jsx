import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAddBrandSchedule from "../../hooks/Brand/useAddBrandSchedule";
import {
  FaLink,
  FaImage,
  FaGlobe,
  FaInfoCircle,
  FaCalendarAlt,
} from "react-icons/fa";

import BackButton from "../BackButton";

const AddBrandScheduleForm = () => {
  const {
    schedule,
    previewLogo,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
    convertUtcToLocalFormat,
  } = useAddBrandSchedule();
  const navigate = useNavigate();

  useEffect(() => {
    if (showSuccessMessage) {
      setTimeout(() => {
        navigate("/brand-list");
      }, 3000);
    }
  }, [showSuccessMessage, navigate]);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800"
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
              Thêm lịch tạo thương hiệu thất bại. Vui lòng thử lại!
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:bg-gray-900 dark:text-white"
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
              Đặt lịch tạo thương hiệu thành công.
            </div>
          </div>
        )}

        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaInfoCircle className="mr-2 text-indigo-500" />
              Tên thương hiệu
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={schedule.name || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Tên thương hiệu"
              required
            />
            {errors.name && (
              <span className="text-red-500 dark:text-red-400 text-sm">
                {errors.name}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="website"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaLink className="mr-2 text-green-500" />
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={schedule.website || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Website thương hiệu"
            />
            {errors.website && (
              <span className="text-red-500 dark:text-red-400 text-sm">
                {errors.website}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaInfoCircle className="mr-2 text-yellow-500" />
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={schedule.description || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Mô tả về thương hiệu"
              required
            />
            {errors.description && (
              <span className="text-red-500 dark:text-red-400 text-sm">
                {errors.description}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="country"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaGlobe className="mr-2 text-blue-500" />
              Quốc gia
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={schedule.country || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Quốc gia"
            />
            {errors.country && (
              <span className="text-red-500 dark:text-red-400 text-sm">
                {errors.country}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="logo"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaImage className="mr-2 text-purple-500" />
              Logo thương hiệu
            </label>
            <input
              type="file"
              id="logo"
              name="logo"
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
            {errors.logo && (
              <p className="text-red-500 dark:text-red-400 text-sm">
                {errors.logo}
              </p>
            )}

            {previewLogo && (
              <div className="mt-4">
                <img
                  src={previewLogo}
                  alt="Logo Preview"
                  className="w-25 h-25 object-contain rounded-lg"
                />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="scheduledDate"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaCalendarAlt className="mr-2 text-red-500" />
              Đặt lịch
            </label>
            <input
              type="datetime-local"
              id="scheduledDate"
              name="scheduledDate"
              value={convertUtcToLocalFormat(schedule.scheduledDate) || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              required
            />

            {errors.scheduledDate && (
              <span className="text-red-500 dark:text-red-400 text-sm">
                {errors.scheduledDate}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isSubmitting ? "Đang tạo lịch..." : "Đặt lịch thương hiệu"}
          </button>
        </div>
      </form>
      <div className="mt-4">
        <BackButton path="/brand-list" />
      </div>
    </>
  );
};

export default AddBrandScheduleForm;
