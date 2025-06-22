import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBoxOpen,
  FaCalendarAlt,
  FaTag,
  FaMoneyCheckAlt,
  FaMapMarkedAlt,
  FaCreditCard,
  FaShippingFast,
  FaPaintBrush,
  FaMemory,
  FaHdd,
  FaLaptop,
} from "react-icons/fa";
import useReviews from "../../hooks/useReviews";
import ReviewModal from "../Modal/ReviewModal";
import OrderActionButtons from "./OrderActionButtons";
import OrderTimeline from "./OrderTimeline";
import CancelOrReturnModal from "../Modal/CancelOrReturnModal";
import useOrders from "../../hooks/useOrders";
import useProducts from "../../hooks/useProducts";
import Cookies from "js-cookie";

const OrderCard = ({ order, onCancel, onReview }) => {
  const userId = Cookies.get("userId");
  const { getAllReviews } = useReviews(userId);
  const { initiateVNPayPayment } = useOrders();
  const [allReviews, setAllReviews] = useState([]);
  const [showAllItems, setShowAllItems] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const { fetchProductById } = useProducts();
  const [productDetailsMap, setProductDetailsMap] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      const results = {};
      for (const item of order.items) {
        if (!productDetailsMap[item.productId]) {
          const product = await fetchProductById(item.productId);

          if (product) {
            results[item.productId] = product.productId;
          }
        }
      }
      setProductDetailsMap((prev) => ({ ...prev, ...results }));
    };

    fetchProducts();
  }, [order.items]);

  const [mediaModal, setMediaModal] = useState({
    open: false,
    type: null,
    url: "",
  });

  const openModal = (type, url) => {
    setMediaModal({ open: true, type, url });
  };

  const closeModal = () => {
    setMediaModal({ open: false, type: null, url: "" });
  };

  useEffect(() => {
    const fetchAll = async () => {
      const all = await getAllReviews();
      setAllReviews(all);
    };

    fetchAll();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "Chờ xác nhận":
        return "text-amber-500 dark:text-amber-400";
      case "Chờ lấy hàng":
        return "text-orange-500 dark:text-orange-400";
      case "Đang giao":
        return "text-cyan-600 dark:text-cyan-400";
      case "Đã giao":
        return "text-emerald-600 dark:text-emerald-400";
      case "Đã nhận hàng":
        return "text-blue-500 dark:text-blue-400";
      case "Yêu cầu trả hàng":
        return "text-purple-500 dark:text-purple-400";
      case "Đã trả hàng":
        return "text-gray-700 dark:text-gray-300";
      case "Đã hủy":
        return "text-red-500 dark:text-red-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div
        key={order.id}
        className="bg-gradient-to-br from-white via-indigo-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-6 rounded-xl shadow-md border-l-4 border-indigo-500 hover:shadow-xl transition-shadow duration-300"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <FaBoxOpen className="text-indigo-500" /> Đơn hàng #{order.orderId}
          </h2>
          <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
            <FaCalendarAlt className="text-indigo-400" />
            {formatDate(order.createdAt)}
          </span>
        </div>

        {/* Trạng thái đơn hàng */}
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Trạng thái:{" "}
          <span
            className={`font-semibold ${getStatusColor(order.orderStatus)}`}
          >
            {order.orderStatus}
          </span>
        </p>

        {/* Action buttons */}
        <OrderActionButtons
          order={order}
          setActionType={setActionType}
          setShowActionModal={setShowActionModal}
          setShowReviewModal={setShowReviewModal}
          initiateVNPayPayment={initiateVNPayPayment}
        />

        {/* Chi tiết sản phẩm */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
            <FaTag className="text-pink-500" /> Chi tiết đơn hàng
          </h3>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {order.items.slice(0, 2).map((item, idx) => {
              return (
                <div
                  key={item.productId || idx}
                  className="flex items-center justify-between py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition duration-200"
                >
                  <div className="flex items-center">
                    <Link
                      to={`/product-details/${
                        productDetailsMap[item.productId]
                      }`}
                    >
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover mr-4 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm"
                      />
                    </Link>

                    <div className="flex flex-col ml-4">
                      <Link
                        to={`/product-details/${
                          productDetailsMap[item.productId]
                        }`}
                        className="text-gray-800 dark:text-gray-100 font-semibold text-lg hover:text-indigo-600"
                      >
                        {item.productName}
                      </Link>

                      {item.color && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <FaPaintBrush className="text-indigo-500" />
                          <span>Màu sắc: {item.color}</span>
                        </div>
                      )}
                      {item.size && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <FaLaptop className="text-green-500" />
                          <span>Kích thước: {item.size}</span>
                        </div>
                      )}
                      {item.ram && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <FaMemory className="text-yellow-500" />
                          <span>RAM: {item.ram}</span>
                        </div>
                      )}
                      {item.storage && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <FaHdd className="text-blue-500" />
                          <span>Lưu trữ: {item.storage}</span>
                        </div>
                      )}
                      {item.condition && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <FaBoxOpen className="text-red-500" />
                          <span>Tình trạng: {item.condition}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {item.quantity} x {formatCurrency(item.discountPrice)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Nút xem thêm */}
          {order.items.length > 2 && !showAllItems && (
            <button
              onClick={() => setShowAllItems(true)}
              className="mt-4 text-blue-600 font-semibold"
            >
              Xem thêm
            </button>
          )}

          {/* Nút thu gọn */}
          {showAllItems && (
            <>
              {order.items.slice(2).map((item, idx) => (
                <div
                  key={item.productId || idx}
                  className="flex items-center justify-between py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition duration-200"
                >
                  <div className="flex items-center">
                    <Link to={`/product-details/${item.productId}`}>
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover mr-4 rounded-md border border-gray-300 dark:hover:bg-gray-600 shadow-sm"
                      />
                    </Link>
                    <div className="flex flex-col ml-4">
                      <Link
                        to={`/product-details/${item.productId}`}
                        className="text-gray-800 dark:text-gray-100 font-semibold text-lg hover:text-indigo-600"
                      >
                        {item.productName}
                      </Link>
                      {item.color && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <FaPaintBrush className="text-indigo-500" />
                          <span>Màu sắc: {item.color}</span>
                        </div>
                      )}
                      {item.size && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <FaLaptop className="text-green-500" />
                          <span>Kích thước: {item.size}</span>
                        </div>
                      )}
                      {item.ram && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <FaMemory className="text-yellow-500" />
                          <span>RAM: {item.ram}</span>
                        </div>
                      )}
                      {item.storage && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <FaHdd className="text-blue-500" />
                          <span>Lưu trữ: {item.storage}</span>
                        </div>
                      )}
                      {item.condition && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <FaBoxOpen className="text-red-500" />
                          <span>Tình trạng: {item.condition}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {item.quantity} x {formatCurrency(item.discountPrice)}
                  </span>
                </div>
              ))}

              <button
                onClick={() => setShowAllItems(false)}
                className="mt-4 text-blue-600 dark:text-blue-700 font-semibold"
              >
                Thu gọn
              </button>
            </>
          )}
        </div>

        {/* Giá tiền */}
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
            <FaMoneyCheckAlt className="text-green-500" /> Thông tin thanh toán
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Tổng sản phẩm:
              </span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(order.totalPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Phí vận chuyển:
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                {formatCurrency(order.shippingPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Mã giảm giá:
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                {order.discountCode || "Không có"}
              </span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Số tiền giảm:</span>
              <span>- {formatCurrency(order.discountAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-emerald-600 dark:text-emerald-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(order.finalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Địa chỉ giao hàng */}
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4 text-lg">
            <FaMapMarkedAlt className="text-amber-500 text-xl" /> Thông tin giao
            hàng
          </h4>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                Tên người nhận:
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                {order.receiverName}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                Điện thoại:
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                {order.phoneNumber}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                Địa chỉ:
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                {order.shippingAddress.street}, {order.shippingAddress.communes}
                , {order.shippingAddress.district}
              </span>
            </li>
            <li className="flex justify-between">
              <span></span>
              <span className="text-gray-800 dark:text-gray-200">
                {order.shippingAddress.city}, {order.shippingAddress.country}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                Ghi chú:
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                {order.orderNotes}
              </span>
            </li>
          </ul>
        </div>

        {/* Phương thức thanh toán */}
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4 text-lg">
            <FaCreditCard className="text-blue-400 text-xl" /> Phương thức thanh
            toán
          </h4>
          <div className="space-y-2">
            <div className="rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 text-base flex items-center gap-2">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Phương thức:
                </span>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">
                  {order.paymentMethod}
                </span>
                {order.paymentMethod === "COD" && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                    (Thanh toán khi nhận hàng)
                  </span>
                )}
                {order.paymentMethod === "VNPay" && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                    (Chuyển khoản ngân hàng)
                  </span>
                )}
              </p>

              <p className="text-gray-700 dark:text-gray-300 text-base mt-2 flex items-center gap-2">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Trạng thái:
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-sm font-semibold ${
                    order.paymentStatus === "Đã thanh toán"
                      ? "bg-green-100 dark:bg-green-700/20 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-700/20 text-red-700 dark:text-red-300"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Phương thức giao hàng */}
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-1">
            <FaShippingFast className="text-pink-400" /> Phương thức giao hàng
          </h4>
          <p className="text-gray-600 dark:text-gray-300">
            {order.shippingMethod}
          </p>
        </div>

        {/* Timeline */}
        <OrderTimeline
          order={order}
          formatDate={formatDate}
          mediaModal={mediaModal}
          openModal={openModal}
          closeModal={closeModal}
        />
      </div>
      {showReviewModal && (
        <div className="not-prose">
          <ReviewModal
            order={order}
            onClose={() => setShowReviewModal(false)}
            onSubmit={onReview}
            reviewedProducts={allReviews.map((r) => ({
              orderId: r.orderId,
              productVariantId: r.productVariantId,
            }))}
          />
        </div>
      )}
      {showActionModal && (
        <div className="not-prose">
          <CancelOrReturnModal
            type={actionType}
            onClose={() => setShowActionModal(false)}
            onSubmit={(reason, images, videos) => {
              onCancel(order.id, reason, images, videos, actionType);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OrderCard;
