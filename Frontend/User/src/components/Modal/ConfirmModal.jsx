import React from "react";
import { FaTrashAlt, FaTimesCircle } from "react-icons/fa";

const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-60 z-50 transition-opacity duration-300 opacity-100">
      <div
        className="
        bg-gradient-to-r from-blue-400 via-purple-300 to-pink-300
        dark:from-gray-800 dark:via-gray-700 dark:to-gray-600
        rounded-xl p-10 max-w-sm w-full
        transform transition-transform duration-500 scale-95 hover:scale-100
        shadow-2xl border border-blue-300 dark:border-gray-600
      "
      >
        <h3
          className="
          text-3xl font-extrabold
          text-red-700 dark:text-red-400
          mb-6 flex items-center justify-center gap-3 drop-shadow-md
        "
        >
          <FaTrashAlt className="inline-block" />
          Xóa thông tin
        </h3>
        <p
          className="
          text-gray-800 dark:text-gray-300
          text-center text-lg mb-8 font-medium drop-shadow-sm
        "
        >
          Bạn chắc chắn muốn hành động xóa này? Việc này không thể hoàn tác.
        </p>
        <div className="flex justify-center space-x-8">
          <button
            onClick={onConfirm}
            className="
              bg-red-600 dark:bg-red-700 text-white
              py-3 px-10 rounded-lg font-semibold text-lg
              hover:bg-red-700 dark:hover:bg-red-800
              focus:outline-none focus:ring-4 focus:ring-red-400 dark:focus:ring-red-600
              transition-all duration-300 transform hover:scale-105
              shadow-lg hover:shadow-xl flex items-center justify-center space-x-3
            "
          >
            <FaTrashAlt size={18} />
            <span>Xóa</span>
          </button>
          <button
            onClick={onClose}
            className="
              bg-teal-500 dark:bg-teal-700 text-white
              py-3 px-10 rounded-lg font-semibold text-lg
              hover:bg-teal-600 dark:hover:bg-teal-800
              focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-500
              transition-all duration-300 transform hover:scale-105
              shadow-lg hover:shadow-xl flex items-center justify-center space-x-3
            "
          >
            <FaTimesCircle size={18} />
            <span>Hủy</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
