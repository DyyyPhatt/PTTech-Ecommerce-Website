import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaHome, FaHistory } from "react-icons/fa";
import Breadcrumb from "../components/Breadcrumb";
import Pagination from "../components/Pagination";
import OrderFilter from "../components/Order/OrderFilter";
import OrderCard from "../components/Order/OrderCard";
import useOrders from "../hooks/useOrders";
import useReviews from "../hooks/useReviews";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";

const OrderHistoryPage = () => {
  const userId = Cookies.get("userId");
  const token = Cookies.get("accessToken");
  const { orders, fetchOrders, cancelOrder, requestReturn, handleVNPayReturn } =
    useOrders(userId);
  const { addReview, updateReview, uploadImage } = useReviews();
  const [actionLoading, setActionLoading] = useState(false);

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

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    paymentMethod: "",
    paymentStatus: "",
    shippingMethod: "",
    orderStatus: "",
  });

  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  const ordersPerPage = 2;
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const filteredOrders = sortedOrders.filter((order) => {
    return (
      (!filters.paymentMethod ||
        order.paymentMethod === filters.paymentMethod) &&
      (!filters.paymentStatus ||
        order.paymentStatus === filters.paymentStatus) &&
      (!filters.shippingMethod ||
        order.shippingMethod === filters.shippingMethod) &&
      (!filters.orderStatus || order.orderStatus === filters.orderStatus)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const vnp_ResponseCode = query.get("vnp_ResponseCode");
    const vnp_TransactionStatus = query.get("vnp_TransactionStatus");
    const vnp_TxnRef = query.get("vnp_TxnRef");

    if (vnp_ResponseCode && vnp_TransactionStatus && vnp_TxnRef) {
      const handleReturn = async () => {
        setActionLoading(true);
        try {
          const responseMessage = await handleVNPayReturn({
            vnp_ResponseCode,
            vnp_TransactionStatus,
            vnp_TxnRef,
          });

          showToast(responseMessage, "success");

          window.history.replaceState({}, document.title, "/orders");

          await fetchOrders();
        } catch (err) {
          console.error("Lỗi khi xử lý trả về VNPay:", err);
          showToast("Xử lý VNPay thất bại.", "error");
        } finally {
          setActionLoading(false);
        }
      };

      handleReturn();
    }
  }, [location.search]);

  const handleCancelOrReturn = async (
    orderId,
    reason,
    images,
    videos,
    type
  ) => {
    setActionLoading(true);
    try {
      if (type === "cancel") {
        await cancelOrder(orderId, reason);
        showToast("Hủy đơn hàng thành công", "success");
      } else if (type === "return") {
        await requestReturn(orderId, reason, images, videos);
        showToast("Yêu cầu hoàn hàng đã được gửi", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Thao tác thất bại. Vui lòng thử lại.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (data) => {
    setActionLoading(true);
    try {
      const { images, ...reviewInfo } = data;

      const reviewData = {
        ...reviewInfo,
        images: [],
      };

      const reviewResponse = await addReview(reviewData);

      let uploadedImageUrls = [];

      if (images && images.length > 0) {
        for (const file of images) {
          const uploadedImage = await uploadImage(reviewResponse.id, file);
          uploadedImageUrls.push(uploadedImage);
        }
      }

      const updatedReviewData = {
        ...reviewData,
        images: uploadedImageUrls,
      };

      await updateReview(reviewResponse.id, updatedReviewData);

      showToast("Đánh giá đã được gửi thành công!", "success");
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);

      let errorMsg = "Gửi đánh giá thất bại. Vui lòng thử lại.";

      if (error.response && error.response.data && error.response.data.error) {
        errorMsg = error.response.data.error;
      }

      showToast(errorMsg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <ToastContainer />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/", icon: FaHome },
          { label: "Lịch sử đơn hàng", href: "/orders", icon: FaHistory },
        ]}
      />

      <div className="flex justify-center bg-gray-100 dark:bg-neutral-800 p-4 md:p-8 min-h-screen">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
            Lịch sử đơn hàng
          </h1>

          <OrderFilter onFilterChange={handleFilterChange} darkMode />

          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">
              Không có đơn hàng nào.
            </p>
          ) : (
            <div className="space-y-6">
              {currentOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={handleCancelOrReturn}
                  onReview={handleSubmitReview}
                  darkMode
                />
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            darkMode
          />
        </div>
      </div>
    </>
  );
};

export default OrderHistoryPage;
