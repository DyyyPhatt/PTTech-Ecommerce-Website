import React from "react";
import { FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PaymentFailed = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate("/orders");
  };

  const handleViewOrders = () => {
    navigate("/orders");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white dark:from-gray-800 dark:to-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl max-w-md text-center animate-fade-in border dark:border-gray-700">
        <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-6 drop-shadow-lg" />
        <h2 className="text-4xl font-extrabold text-red-700 dark:text-red-400 mb-4">
          Thanh toán thất bại
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Rất tiếc, quá trình thanh toán qua VNPay đã không thành công. Vui lòng
          thử lại hoặc liên hệ bộ phận hỗ trợ nếu cần trợ giúp.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleTryAgain}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-full shadow-md transition-all duration-300"
          >
            Thử lại
          </button>
          <button
            onClick={handleViewOrders}
            className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200 font-semibold py-3 px-8 rounded-full shadow-md transition-all duration-300"
          >
            Xem đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
