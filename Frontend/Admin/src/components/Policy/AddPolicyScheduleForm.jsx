import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAddPolicySchedule from "../../hooks/Policy/useAddPolicySchedule";
import BackButton from "../BackButton";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  FaListAlt,
  FaPen,
  FaInfoCircle,
  FaFileAlt,
  FaClock,
} from "react-icons/fa";

const AddPolicyScheduleForm = () => {
  const {
    policy,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
    convertUtcToLocalFormat,
  } = useAddPolicySchedule();
  const navigate = useNavigate();

  useEffect(() => {
    if (showSuccessMessage) {
      setTimeout(() => {
        navigate("/policy-list");
      }, 3000);
    }
  }, [showSuccessMessage, navigate]);

  const handleQuillChange = (value) => {
    handleChange({ target: { name: "content", value } });
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
  ];

  return (
    <>
      <div className="mb-4">
        <BackButton path="/policy-list" />
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
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
              Đặt lịch chính sách thất bại. Vui lòng thử lại!
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white dark:bg-gray-900 rounded-lg shadow-lg"
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
            <div className="ml-3 text-sm font-normal dark:text-white">
              Đặt lịch chính sách thành công.
            </div>
          </div>
        )}

        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="type"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaListAlt className="mr-2 text-blue-500" />
              Loại Chính Sách
            </label>
            <input
              type="text"
              id="type"
              name="type"
              value={policy.type || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Loại chính sách"
              required
            />
            {errors?.type && (
              <span className="text-red-500 text-sm">{errors.type}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="title"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaPen className="mr-2 text-yellow-500" />
              Tiêu Đề
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={policy.title || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Tiêu đề chính sách"
              required
            />
            {errors?.title && (
              <span className="text-red-500 text-sm">{errors.title}</span>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white flex items-center"
          >
            <FaInfoCircle className="mr-2 text-orange-500" />
            Mô Tả
          </label>
          <textarea
            id="description"
            name="description"
            value={policy.description || ""}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Mô tả chính sách"
            required
          />
          {errors?.description && (
            <span className="text-red-500 text-sm">{errors.description}</span>
          )}
        </div>

        <div>
          <label
            htmlFor="content"
            className="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white flex items-center"
          >
            <FaFileAlt className="mr-2 text-green-500" />
            Nội Dung Chính Sách
          </label>
          <ReactQuill
            value={policy.content || ""}
            onChange={handleQuillChange}
            modules={quillModules}
            formats={quillFormats}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Nội dung chính sách"
            required
          />
          {errors?.content && (
            <span className="text-red-500 text-sm">{errors.content}</span>
          )}
        </div>

        <div>
          <label
            htmlFor="scheduledDate"
            className="block mt-6 mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
          >
            <FaClock className="mr-2 text-purple-500" />
            Thời gian lên lịch
          </label>
          <input
            type="datetime-local"
            id="scheduledDate"
            name="scheduledDate"
            value={convertUtcToLocalFormat(policy.scheduledDate) || ""}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
          />
          {errors.scheduledDate && (
            <span className="text-red-500 text-sm">{errors.scheduledDate}</span>
          )}
        </div>

        <div className="flex mt-6 justify-center">
          <button
            type="submit"
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isSubmitting ? "Đang thêm..." : "Đặt lịch chính sách"}
          </button>
        </div>
      </form>
      <div className="mt-4">
        <BackButton path="/policy-list" />
      </div>
    </>
  );
};

export default AddPolicyScheduleForm;
