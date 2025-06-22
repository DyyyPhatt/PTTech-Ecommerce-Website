import React from "react";
import {
  FaRegFileAlt,
  FaInfoCircle,
  FaBookOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaHistory,
  FaArrowLeft,
  FaExclamationTriangle,
} from "react-icons/fa";

const PolicyDetail = ({ policy }) => {
  if (!policy) {
    return (
      <>
        <div className="flex justify-center items-center mt-10">
          <div
            className="bg-red-50 border border-red-300 text-center text-red-700 font-semibold text-lg p-6 rounded-xl shadow-2xl w-full sm:w-3/4 md:w-1/2 lg:w-1/3
            dark:bg-red-900 dark:border-red-700 dark:text-red-400
          "
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <FaExclamationTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
              <span>Chính sách không tồn tại.</span>
            </div>
            <p className="text-sm text-gray-600 italic dark:text-gray-400">
              Vui lòng kiểm tra lại liên kết hoặc quay lại trang trước.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 px-6 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2
              dark:from-blue-700 dark:to-blue-900 dark:hover:from-blue-800 dark:hover:to-blue-950
            "
          >
            <FaArrowLeft /> Quay lại
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 dark:bg-neutral-800 dark:text-gray-100">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Tiêu đề chính sách */}
        <h1
          className="text-4xl md:text-5xl font-extrabold text-center text-blue-700 tracking-tight drop-shadow-md flex items-center justify-center gap-3
          dark:text-blue-400
        "
        >
          <FaRegFileAlt className="text-blue-700 dark:text-blue-400" />
          {policy.title}
        </h1>

        {/* Mô tả chính sách */}
        <div
          className="bg-gradient-to-br from-white to-gray-100 border-l-4 border-blue-500 p-6 rounded-xl shadow-md
          dark:from-gray-800 dark:to-gray-900 dark:border-blue-400
        "
        >
          <h2
            className="text-2xl font-semibold text-blue-600 mb-2 flex items-center gap-2
            dark:text-blue-300
          "
          >
            <FaInfoCircle /> Mô tả
          </h2>
          <div
            className="text-gray-800 text-lg leading-relaxed dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: policy.description }}
          ></div>
        </div>

        {/* Nội dung chính sách */}
        <div
          className="bg-gradient-to-br from-white to-gray-100 border-l-4 border-green-500 p-6 rounded-xl shadow-md
          dark:from-gray-800 dark:to-gray-900 dark:border-green-400
        "
        >
          <h2
            className="text-2xl font-semibold text-green-600 mb-2 flex items-center gap-2
            dark:text-green-300
          "
          >
            <FaBookOpen /> Nội dung
          </h2>
          <div
            className="text-gray-800 text-lg leading-relaxed dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: policy.content }}
          />
        </div>

        {/* Trạng thái & ngày tháng */}
        <div
          className="bg-gradient-to-br from-white to-gray-100 border-l-4 border-yellow-500 p-6 rounded-xl shadow-md space-y-4
          dark:from-gray-800 dark:to-gray-900 dark:border-yellow-400
        "
        >
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {/* Nếu cần bật trạng thái, uncomment đoạn này */}
            {/* <div>
              <p className="text-gray-700 font-semibold flex justify-center items-center gap-1 dark:text-gray-300">
                <FaCheckCircle /> Trạng thái
              </p>
              <p
                className={`text-lg font-bold flex justify-center items-center gap-1 ${
                  policy.isActive === true ? "text-green-600" : "text-red-600"
                } dark:text-opacity-80`}
              >
                {policy.isActive === true ? (
                  <FaCheckCircle />
                ) : (
                  <FaTimesCircle />
                )}
                {policy.isActive}
              </p>
            </div> */}

            <div>
              <p className="text-gray-700 font-semibold flex justify-center items-center gap-1 dark:text-gray-300">
                <FaCalendarAlt /> Ngày tạo
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(policy.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-gray-700 font-semibold flex justify-center items-center gap-1 dark:text-gray-300">
                <FaHistory /> Ngày cập nhật
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(policy.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Nút quay lại */}
        <div className="text-center">
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-lg hover:from-purple-600 hover:to-purple-800 transition duration-300 transform hover:scale-105 flex items-center justify-center gap-2
              dark:from-purple-700 dark:to-purple-900 dark:hover:from-purple-800 dark:hover:to-purple-950
            "
          >
            <FaArrowLeft />
            Quay lại trang trước
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetail;
