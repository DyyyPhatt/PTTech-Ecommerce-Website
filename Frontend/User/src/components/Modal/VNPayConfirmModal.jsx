import React from "react";
import { FaCreditCard, FaTimes } from "react-icons/fa";

const VNPayConfirmModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-4">
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
        {/* Close icon top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          aria-label="Close modal"
        >
          <FaTimes size={20} />
        </button>

        <FaCreditCard className="mx-auto mb-4 text-green-600 dark:text-green-400 text-5xl animate-pulse" />

        <h2 className="text-2xl font-extrabold mb-4 text-gray-900 dark:text-white">
          Xác nhận thanh toán VNPay
        </h2>

        <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed">
          Bạn có chắc chắn muốn thanh toán đơn hàng này qua VNPay không?
        </p>

        <div className="flex justify-center gap-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Hủy
          </button>

          <button
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 dark:hover:bg-green-500 transition shadow-md"
          >
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default VNPayConfirmModal;
