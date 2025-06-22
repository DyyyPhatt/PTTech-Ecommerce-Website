import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAddBugReport from "../../hooks/BugReport/useAddBugReport";
import {
  FaBug,
  FaEnvelope,
  FaInfoCircle,
  FaImage,
  FaVideo,
} from "react-icons/fa";
import BackButton from "../BackButton";

const AddBugReportForm = () => {
  const {
    bugReport,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
  } = useAddBugReport();

  const navigate = useNavigate();

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        navigate("/bug-list");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage, navigate]);

  return (
    <div>
      {" "}
      <div className="mb-4">
        <BackButton path="/bug-list" />
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
            <div className="ml-3 text-sm font-normal dark:text-white">
              Thêm báo lỗi thất bại. Vui lòng thử lại!
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:bg-gray-700 dark:text-green-200"
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
              Thêm báo lỗi thành công.
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="bugType"
            className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
          >
            <FaBug className="mr-2 text-red-500" />
            Loại lỗi
          </label>
          <select
            id="bugType"
            name="bugType"
            value={bugReport.bugType}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5"
            required
          >
            <option value="">- Chọn loại lỗi -</option>
            <option value="Lỗi hiển thị sản phẩm">Lỗi hiển thị sản phẩm</option>
            <option value="Lỗi dữ liệu sản phẩm">Lỗi dữ liệu sản phẩm</option>
            <option value="Lỗi tìm kiếm và lọc sản phẩm">
              Lỗi tìm kiếm và lọc sản phẩm
            </option>
            <option value="Lỗi giỏ hàng và thanh toán">
              Lỗi giỏ hàng và thanh toán
            </option>
            <option value="Lỗi tài khoản người dùng">
              Lỗi tài khoản người dùng
            </option>
            <option value="Lỗi bảo mật và quyền truy cập">
              Lỗi bảo mật và quyền truy cập
            </option>
            <option value="Lỗi hiển thị trên thiết bị hoặc trình duyệt cụ thể">
              Lỗi hiển thị trên thiết bị hoặc trình duyệt cụ thể
            </option>
            <option value="Lỗi tốc độ tải và hiệu năng">
              Lỗi tốc độ tải và hiệu năng
            </option>
            <option value="Lỗi đơn hàng và xử lý hậu cần">
              Lỗi đơn hàng và xử lý hậu cần
            </option>
            <option value="Lỗi liên kết nội bộ và chuyển hướng">
              Lỗi liên kết nội bộ và chuyển hướng
            </option>
            <option value="Lỗi popup, banner hoặc quảng cáo">
              Lỗi popup, banner hoặc quảng cáo
            </option>
            <option value="Lỗi khác">Lỗi khác</option>
          </select>
          {errors.bugType && (
            <span className="text-red-500 text-sm">{errors.bugType}</span>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
          >
            <FaInfoCircle className="mr-2 text-yellow-500" />
            Mô tả lỗi
          </label>
          <textarea
            id="description"
            name="description"
            value={bugReport.description}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5"
            placeholder="Mô tả chi tiết lỗi gặp phải"
            required
          />
          {errors.description && (
            <span className="text-red-500 text-sm">{errors.description}</span>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
          >
            <FaEnvelope className="mr-2 text-blue-500" />
            Email liên hệ (tuỳ chọn)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={bugReport.email}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 text-sm rounded-lg block w-full p-2.5"
            placeholder="Email để chúng tôi có thể liên hệ"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label
            htmlFor="imageFiles"
            className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
          >
            <FaImage className="mr-2 text-purple-500" />
            Ảnh minh họa (có thể chọn nhiều)
          </label>
          <input
            type="file"
            id="imageFiles"
            name="imageFiles"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 text-sm rounded-lg block w-full p-2"
          />
        </div>

        {/* Video Upload */}
        <div>
          <label
            htmlFor="videoFiles"
            className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
          >
            <FaVideo className="mr-2 text-indigo-500" />
            Video (có thể chọn nhiều)
          </label>
          <input
            type="file"
            id="videoFiles"
            name="videoFiles"
            multiple
            accept="video/*"
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600 text-sm rounded-lg block w-full p-2"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Đang gửi...
              </>
            ) : (
              "Gửi báo lỗi"
            )}
          </button>
        </div>
      </form>
      <div className="mt-4">
        <BackButton path="/bug-list" />
      </div>
    </div>
  );
};

export default AddBugReportForm;
