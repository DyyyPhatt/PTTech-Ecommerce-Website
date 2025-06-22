import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const useOrders = (userId) => {
  const token = Cookies.get("accessToken");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch orders by userId
  const fetchOrders = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8081/api/orders/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
      setError("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  // Gọi khi khởi tạo
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Create a new order
  const createOrder = async (orderData, continueWithAvailableItems = false) => {
    setActionLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(
        "http://localhost:8081/api/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            continueWithAvailableItems,
          },
        }
      );

      setOrders((prev) => [response.data, ...prev]);
      setSuccess(true);
      await fetchOrders();
      return { success: true, data: response.data };
    } catch (err) {
      if (err.response?.status === 409) {
        // Sản phẩm hết hàng
        return {
          success: false,
          outOfStock: true,
          message: err.response.data?.message || "Một số sản phẩm đã hết hàng.",
        };
      }

      console.error("Lỗi khi tạo đơn hàng:", err);
      setError("Không thể tạo đơn hàng.");
      return {
        success: false,
        outOfStock: false,
        message: "Không thể tạo đơn hàng.",
      };
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel an order
  const cancelOrder = async (orderId, reason) => {
    setActionLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:8081/api/orders/cancel/${orderId}`,
        null,
        {
          params: { cancellationReason: reason },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? response.data : order))
      );
      await fetchOrders();
      return response.data;
    } catch (err) {
      console.error("Lỗi khi huỷ đơn hàng:", err);
      setError("Không thể huỷ đơn hàng.");
    } finally {
      setActionLoading(false);
    }
  };

  // Request return
  const requestReturn = async (orderId, reason, images = [], videos = []) => {
    setActionLoading(true);
    setError(null);

    const formData = new FormData();

    try {
      formData.append("returnReason", reason);

      images.forEach((image) => {
        if (image instanceof File) {
          formData.append("images", image);
        } else {
          console.warn("Item in images is not a File:", image);
        }
      });

      videos.forEach((video) => {
        if (video instanceof File) {
          formData.append("videos", video);
        } else {
          console.warn("Item in videos is not a File:", video);
        }
      });

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
    } catch (e) {
      console.error("Lỗi khi tạo FormData:", e);
      setError("Lỗi khi xử lý dữ liệu trả hàng.");
      setActionLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8081/api/orders/${orderId}/request-return`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? response.data : order))
      );

      await fetchOrders();
      return response.data;
    } catch (err) {
      if (err.response) {
        console.error(
          "Lỗi trả về từ server:",
          err.response.data,
          err.response.status
        );
        setError(
          err.response.data?.message || "Không thể gửi yêu cầu trả hàng."
        );
      } else {
        console.error("Lỗi khi yêu cầu trả hàng:", err.message);
        setError("Không thể gửi yêu cầu trả hàng.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const initiateVNPayPayment = async (orderId) => {
    setActionLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(
        `http://localhost:8081/api/orders/vnpay/${orderId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(true);
      await fetchOrders();
      return response.data;
    } catch (err) {
      console.error("Lỗi khi tạo URL thanh toán VNPay:", err);
      setError("Không thể tạo đường dẫn thanh toán VNPay.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVNPayReturn = async (queryParams) => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "http://localhost:8081/api/orders/vnpay/return",
        {
          params: queryParams,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedOrderId = queryParams.vnp_TxnRef;
      if (updatedOrderId) {
        const orderResp = await axios.get(
          `http://localhost:8081/api/orders/${updatedOrderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders((prev) =>
          prev.map((order) =>
            order.id === updatedOrderId ? orderResp.data : order
          )
        );
      }

      await fetchOrders();
      return response.data;
    } catch (err) {
      console.error("Lỗi khi xử lý trả về VNPay:", err);
      setError("Xử lý trả về VNPay thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVNPayIPN = async (params) => {
    setActionLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:8081/api/orders/vnpay/ipn",
        params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchOrders();
      return response.data;
    } catch (err) {
      console.error("Lỗi khi xử lý IPN VNPay:", err);
      setError("Xử lý IPN VNPay thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    orders,
    loading,
    actionLoading,
    error,
    success,
    fetchOrders,
    createOrder,
    cancelOrder,
    requestReturn,
    initiateVNPayPayment,
    handleVNPayReturn,
    handleVNPayIPN,
  };
};

export default useOrders;
