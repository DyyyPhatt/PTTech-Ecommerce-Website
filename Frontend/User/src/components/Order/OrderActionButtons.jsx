import { useState } from "react";
import { FaTimesCircle, FaStar, FaCreditCard } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import VNPayConfirmModal from "../Modal/VNPayConfirmModal";

const OrderActionButtons = ({
  order,
  setActionType,
  setShowActionModal,
  setShowReviewModal,
  initiateVNPayPayment,
}) => {
  const status = order.orderStatus;
  const paymentMethod = order.paymentMethod;
  const paymentStatus = order.paymentStatus;
  const navigate = useNavigate();

  const [showVNPayModal, setShowVNPayModal] = useState(false);

  const showToast = (message, type = "info") => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleVNPayConfirm = async () => {
    try {
      const data = await initiateVNPayPayment(order.orderId);
      if (data) {
        window.location.href = data;
      } else {
        showToast("Không thể khởi tạo thanh toán VNPay.", "error");
        navigate(`/payment-failed/${order.orderId}`);
      }
    } catch (err) {
      showToast("Đã xảy ra lỗi khi thanh toán.", "error");
      navigate(`/payment-failed/${order.orderId}`);
    }
  };

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {(status === "Chờ xác nhận" || status === "Chờ lấy hàng") && (
        <button
          onClick={() => {
            setActionType("cancel");
            setShowActionModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow hover:from-red-600 hover:to-red-700 transition-all duration-200 dark:shadow-md dark:hover:from-red-600 dark:hover:to-red-700"
        >
          <FaTimesCircle />
          Hủy đơn
        </button>
      )}

      {(status === "Đã giao" || status === "Đã nhận hàng") && (
        <>
          <button
            onClick={() => {
              setActionType("return");
              setShowActionModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow hover:from-red-600 hover:to-red-700 transition-all duration-200 dark:shadow-md dark:hover:from-red-600 dark:hover:to-red-700"
          >
            <FaTimesCircle />
            Yêu cầu trả hàng
          </button>

          <button
            onClick={() => setShowReviewModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition-all duration-200 dark:shadow-md dark:hover:from-blue-600 dark:hover:to-blue-700"
          >
            <FaStar />
            Đánh giá
          </button>
        </>
      )}

      {paymentMethod === "VNPay" &&
        (paymentStatus === "Chưa thanh toán" ||
          paymentStatus === "Khách hủy giao dịch" ||
          paymentStatus === "Nghi ngờ gian lận") && (
          <button
            onClick={() => setShowVNPayModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-all duration-200 dark:shadow-md dark:hover:from-green-600 dark:hover:to-green-700"
          >
            <FaCreditCard />
            Thanh toán VNPay
          </button>
        )}

      <VNPayConfirmModal
        open={showVNPayModal}
        onClose={() => setShowVNPayModal(false)}
        onConfirm={handleVNPayConfirm}
      />
    </div>
  );
};

export default OrderActionButtons;
