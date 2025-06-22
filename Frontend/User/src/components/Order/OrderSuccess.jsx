import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const navigate = useNavigate();

  const handleViewOrders = () => {
    navigate("/orders");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl max-w-md text-center animate-fade-in border dark:border-gray-700">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6 drop-shadow-lg" />
        <h2 className="text-4xl font-extrabold text-green-700 dark:text-green-400 mb-4">
          Đặt hàng thành công!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Cảm ơn bạn đã mua hàng tại cửa hàng của chúng tôi. Đơn hàng của bạn đã
          được tiếp nhận và đang được xử lý. Chúng tôi sẽ liên hệ nếu cần thêm
          thông tin.
        </p>
        <button
          onClick={handleViewOrders}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-md transition-all duration-300"
        >
          Xem đơn hàng
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
