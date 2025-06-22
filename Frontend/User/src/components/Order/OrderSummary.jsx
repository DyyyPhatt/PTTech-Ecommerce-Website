import React, { useMemo, useState } from "react";
import { FaCreditCard, FaRegEdit, FaGift } from "react-icons/fa";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useOrders from "../../hooks/useOrders";
import useDiscountCodes from "../../hooks/useDiscountCodes";
import DiscountCodesModal from "../Modal/DiscountCodesModal";
import OutOfStockModal from "../Modal/OutOfStockModal";

const OrderSummary = ({
  cartItems,
  discountCode,
  discountApplied,
  discountAmount,
  discountMessage,
  userInfo,
  shippingAddress,
  onDiscountChange,
  onDiscountSubmit,
  onUserInfoChange,
  onAddressClick,
  onCheckout,
  formatPrice,
  onRemoveItem,
}) => {
  const navigate = useNavigate();
  const token = Cookies.get("accessToken");
  const userId = Cookies.get("userId");
  const { createOrder, initiateVNPayPayment } = useOrders(userId);
  const [outOfStockModalOpen, setOutOfStockModalOpen] = React.useState(false);
  const [outOfStockMessage, setOutOfStockMessage] = React.useState(""); // lưu message trả về
  const [pendingOrderData, setPendingOrderData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const {
    discountCodes,
    loading: loadingCodes,
    error: errorCodes,
  } = useDiscountCodes();

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

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!token || !userId) {
      showToast("Vui lòng đăng nhập để đặt hàng!", "error");
      navigate(`/login`);
      return;
    }

    if (cartItems.length === 0) {
      showToast("Giỏ hàng trống!", "error");
      return;
    }

    try {
      setIsLoading(true);

      const orderData = {
        userId: userId,
        items: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          brandId: item.brandId,
          categoryId: item.categoryId,
          discountPrice: item.discountPrice,
          originalPrice: item.originalPrice,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          productName: item.productName,
          color: item.color,
          hexCode: item.hexCode,
          size: item.size,
          ram: item.ram,
          storage: item.storage,
          condition: item.condition,
          productImage: item.productImage,
        })),
        totalItems: cartItems.length,
        totalPrice: cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
        shippingPrice: shippingFee,
        discountCode,
        discountAmount,
        finalPrice: finalPrice,
        receiverName: userInfo.name,
        phoneNumber: userInfo.phoneNumber,
        shippingAddress: {
          street: shippingAddress.street,
          communes: shippingAddress.commune.name,
          district: shippingAddress.district.name,
          city: shippingAddress.province.name,
          country: shippingAddress.country,
        },
        paymentMethod: userInfo.paymentMethod,
        shippingMethod: userInfo.shippingMethod,
        orderNotes: userInfo.orderNotes || "",
      };

      const result = await createOrder(orderData, false);

      if (result?.outOfStock && result?.message) {
        setOutOfStockMessage(result.message);
        setPendingOrderData(orderData);
        setOutOfStockModalOpen(true);
        return;
      }

      if (result.success) {
        await handleOrderSuccess(result.data);
      } else {
        showToast("Đặt hàng thất bại, vui lòng thử lại.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Có lỗi xảy ra khi đặt hàng.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderSuccess = async (createdOrder) => {
    for (const item of cartItems) {
      await onRemoveItem(item.productId, item.variantId);
    }
    window.dispatchEvent(new Event("guest_cart_updated"));

    if (createdOrder.paymentMethod === "VNPay") {
      const response = await initiateVNPayPayment(createdOrder.orderId);
      if (response) {
        window.location.href = response;
      } else {
        showToast("Không thể khởi tạo thanh toán VNPay.", "error");
        navigate(`/payment-failed/${createdOrder.orderId}`);
      }
      return;
    }

    navigate(`/order-success/${createdOrder.orderId}`);
  };

  const handleOutOfStockConfirm = async () => {
    setOutOfStockModalOpen(false);
    try {
      setIsLoading(true);
      const result = await createOrder(pendingOrderData, true);
      if (result.success) {
        await handleOrderSuccess(result.data);
      } else {
        showToast("Không thể tạo đơn hàng.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Đặt hàng thất bại khi tiếp tục.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutOfStockCancel = () => {
    setOutOfStockModalOpen(false);
    setPendingOrderData(null);
    setOutOfStockMessage("");
  };

  const HCM = "Thành phố Hồ Chí Minh";
  const nearbyHCM = [
    "Tỉnh Bình Dương",
    "Tỉnh Đồng Nai",
    "Tỉnh Long An",
    "Tỉnh Tây Ninh",
  ];
  const majorCities = [
    "Thành phố Hà Nội",
    "Thành phố Đà Nẵng",
    "Thành phố Hải Phòng",
    "Thành phố Cần Thơ",
  ];

  const hasValidAddress = !!(
    shippingAddress &&
    shippingAddress.street &&
    shippingAddress.commune?.name &&
    shippingAddress.district?.name &&
    shippingAddress.province?.name &&
    shippingAddress.country
  );

  const isNotHCM = shippingAddress?.province?.name !== HCM;

  const subtotal = cartItems.reduce(
    (total, item) => total + item.totalPrice,
    0
  );

  const shippingFee = useMemo(() => {
    if (
      !shippingAddress ||
      !shippingAddress.province?.name ||
      !userInfo.shippingMethod
    )
      return 0;

    const province = shippingAddress.province.name;
    const method = userInfo.shippingMethod;
    const isHCM = province === HCM;
    const isNearby = nearbyHCM.includes(province);
    const isMajorCity = majorCities.includes(province);

    if (method === "Giao hàng hỏa tốc" && !isHCM) return 0;

    if (isHCM) {
      if (method === "Giao hàng hỏa tốc") {
        return subtotal >= 5_000_000 ? 0 : 20000;
      }
      if (method === "Giao hàng nhanh") {
        return subtotal >= 4_000_000 ? 0 : 15000;
      }
      if (method === "Giao hàng tiết kiệm") {
        return subtotal >= 4_000_000 ? 0 : 12000;
      }
    }

    if (isNearby || isMajorCity) {
      if (method === "Giao hàng nhanh") {
        return subtotal >= 7_000_000 ? 0 : 25000;
      }
      if (method === "Giao hàng tiết kiệm") {
        return subtotal >= 6_000_000 ? 0 : 20000;
      }
    }

    if (method === "Giao hàng nhanh") {
      return subtotal >= 10_000_000 ? 0 : 35000;
    }
    if (method === "Giao hàng tiết kiệm") {
      return subtotal >= 8_000_000 ? 0 : 30000;
    }

    return 0;
  }, [shippingAddress, subtotal, userInfo.shippingMethod]);

  const amountRemainingForFreeShipping = useMemo(() => {
    if (shippingFee === 0 || !userInfo.shippingMethod) return 0;

    const requiredAmountForFreeShipping = {
      "Giao hàng hỏa tốc": 5000000,
      "Giao hàng nhanh": 4000000,
      "Giao hàng tiết kiệm": 4000000,
    };

    const requiredAmount =
      requiredAmountForFreeShipping[userInfo.shippingMethod];
    if (requiredAmount) {
      return Math.max(0, requiredAmount - subtotal);
    }

    return 0;
  }, [shippingFee, subtotal, userInfo.shippingMethod]);

  const finalPrice = subtotal - discountAmount + shippingFee;

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-6">
          Tóm tắt đơn hàng
        </h2>

        {/* Mã giảm giá */}
        <div className="mb-6">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={discountCode}
              onChange={onDiscountChange}
              placeholder="Nhập mã giảm giá"
              className="flex-grow px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         placeholder-gray-400 dark:placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <button
              type="button"
              onClick={onDiscountSubmit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Áp dụng
            </button>
          </div>
          {discountMessage && (
            <p
              className={`mt-1 text-sm ${
                discountApplied ? "text-green-500" : "text-red-500"
              }`}
            >
              {discountMessage}
            </p>
          )}
          <div className="text-right mt-2">
            <button
              type="button"
              onClick={() => setIsDiscountModalOpen(true)}
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-150"
            >
              <FaGift />
              Mã giảm giá khả dụng
            </button>
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="border-t pt-4 mb-6 text-gray-700 dark:text-gray-300">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Tạm tính</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discountApplied && (
            <div className="flex justify-between text-green-500 mb-2">
              <span className="font-medium">Giảm giá</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div
            className={`flex justify-between mb-2 ${
              shippingFee === 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            <span className="font-medium">Phí vận chuyển</span>
            <span>
              {!hasValidAddress
                ? "Chọn địa chỉ"
                : !userInfo.shippingMethod
                ? "Chọn phương thức giao hàng"
                : shippingFee === 0
                ? "Miễn phí"
                : `+${formatPrice(shippingFee)}`}
            </span>
          </div>

          {shippingFee > 0 && amountRemainingForFreeShipping > 0 && (
            <div className="flex justify-between text-orange-600 font-medium">
              <span>Cần</span>
              <span>
                {formatPrice(amountRemainingForFreeShipping)} để được miễn phí
                vận chuyển
              </span>
            </div>
          )}

          <div className="flex justify-between font-bold text-lg mt-3 text-indigo-700 dark:text-indigo-400">
            <span>Tổng cộng</span>
            <span>{formatPrice(finalPrice)}</span>
          </div>
        </div>

        {/* Form thanh toán */}
        <div className="border-t pt-4 mb-6 text-gray-700 dark:text-gray-300">
          <h4 className="text-2xl font-semibold text-red-600 dark:text-red-500 mb-4">
            Thông tin người nhận
          </h4>
          <form onSubmit={onCheckout}>
            <div className="space-y-4 mb-6 text-sm">
              <input
                type="text"
                name="name"
                value={userInfo.name}
                onChange={onUserInfoChange}
                placeholder="Họ và tên"
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:ring-indigo-500 transition-all"
                required
              />
              <input
                type="tel"
                name="phoneNumber"
                value={userInfo.phoneNumber || ""}
                onChange={onUserInfoChange}
                placeholder="Số điện thoại"
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:ring-indigo-500 transition-all"
                required
              />
              <div className="flex flex-col gap-3">
                {shippingAddress && (
                  <div className="text-sm text-gray-800 dark:text-gray-200 bg-indigo-50 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 shadow-sm rounded-lg p-4 space-y-1">
                    <p className="font-medium text-indigo-600 dark:text-indigo-400">
                      {shippingAddress.street}
                    </p>
                    <p>
                      {shippingAddress.commune.name},{" "}
                      {shippingAddress.district.name}
                    </p>
                    <p>
                      {shippingAddress.province.name}, {shippingAddress.country}
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={onAddressClick}
                  className="text-indigo-600 dark:text-indigo-400 underline text-sm flex items-center gap-1 ml-auto hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  <FaRegEdit />
                  {shippingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
                </button>
              </div>

              {/* Phương thức thanh toán */}
              <div>
                <label className="block font-medium mb-2">
                  Phương thức thanh toán
                </label>
                <select
                  name="paymentMethod"
                  value={userInfo.paymentMethod || ""}
                  onChange={onUserInfoChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                             focus:ring-indigo-500 transition-all"
                  required
                  disabled={!hasValidAddress}
                >
                  <option value="">-- Chọn phương thức --</option>
                  <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                  <option value="VNPay">Chuyển khoản ngân hàng (VNPay)</option>
                </select>
              </div>

              {/* Phương thức giao hàng */}
              <div>
                <label className="block font-medium mb-2">
                  Phương thức giao hàng
                </label>
                <select
                  name="shippingMethod"
                  value={userInfo.shippingMethod || ""}
                  onChange={onUserInfoChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                             focus:ring-indigo-500 transition-all"
                  required
                  disabled={!hasValidAddress}
                >
                  <option value="">-- Chọn phương thức --</option>
                  <option value="Giao hàng nhanh">Giao hàng nhanh</option>
                  <option value="Giao hàng tiết kiệm">
                    Giao hàng tiết kiệm
                  </option>
                  <option value="Giao hàng hỏa tốc" disabled={isNotHCM}>
                    Giao hàng hỏa tốc
                  </option>
                </select>
              </div>

              {/* Ghi chú đơn hàng */}
              <textarea
                name="orderNotes"
                value={userInfo.orderNotes || ""}
                onChange={onUserInfoChange}
                placeholder="Ghi chú đơn hàng (nếu có)"
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:ring-indigo-500 transition-all"
                rows="2"
              ></textarea>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className={`w-full px-6 py-3 font-semibold rounded-lg transition-all shadow-lg flex justify-center items-center gap-2 ${
                isLoading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <FaCreditCard className="inline-block" />
                  <span>Thanh toán</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      <DiscountCodesModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        discountCodes={discountCodes}
        loading={loadingCodes}
        error={errorCodes}
        onApplyCode={(code) => {
          onDiscountChange({ target: { value: code } });
          setIsDiscountModalOpen(false);
        }}
      />
      <OutOfStockModal
        isOpen={outOfStockModalOpen}
        message={outOfStockMessage}
        onConfirm={handleOutOfStockConfirm}
        onCancel={handleOutOfStockCancel}
        totalItems={cartItems.length}
      />
    </div>
  );
};

export default OrderSummary;
