import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FaHome, FaShoppingCart } from "react-icons/fa";
import Breadcrumb from "../components/Breadcrumb";
import CartItem from "../components/Item/CartItem";
import AddressModal from "../components/Modal/AddressModal";
import OrderSummary from "../components/Order/OrderSummary";
import { getGuestCart, saveGuestCart } from "../utils/cartUtils";
import useCart from "../hooks/useCart";
import useUser from "../hooks/useUsers";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import useDiscountCodes from "../hooks/useDiscountCodes";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [tempAddress, setTempAddress] = useState({
    street: "",
    province: { name: "", code: "" },
    district: { name: "", code: "" },
    commune: { name: "", code: "" },
    country: "Việt Nam",
  });
  const [itemLoading, setItemLoading] = useState({});
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const {
    discountCodes,
    loading: loadingDiscounts,
    error: errorDiscounts,
  } = useDiscountCodes();

  const userId = Cookies.get("userId");
  const { user, loading, error } = useUser(userId);
  const isLoggedIn = !!Cookies.get("accessToken");
  const {
    cart,
    fetchCart,
    syncGuestCartToServer,
    increaseQuantity,
    decreaseQuantity,
    removeItem: removeItemAPI,
  } = useCart(userId);
  const [isSynced, setIsSynced] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location]);

  useEffect(() => {
    if (cart?.items) {
      setCartItems(cart?.items);
    }
  }, [cart]);

  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.username || "",
        phoneNumber: user.phoneNumber || "",
        address: "",
      });

      if (user.address) {
        setShippingAddress({
          street: user.address.street || "",
          province: { name: user.address.city || "", code: "" },
          district: { name: user.address.district || "", code: "" },
          commune: { name: user.address.communes || "", code: "" },
          country: user.address.country || "Việt Nam",
        });
        setTempAddress({
          street: user.address.street || "",
          province: { name: user.address.city || "", code: "" },
          district: { name: user.address.district || "", code: "" },
          commune: { name: user.address.communes || "", code: "" },
          country: user.address.country || "Việt Nam",
        });
      }
    }
  }, [user]);

  useEffect(() => {
    const initializeCart = async () => {
      setIsLoadingCart(true);
      try {
        if (isLoggedIn && userId && !isSynced) {
          const guestCart = getGuestCart();
          if (guestCart?.items?.length > 0) {
            await syncGuestCartToServer(guestCart.items);
            await fetchCart();
            setIsSynced(true);
          } else {
            await fetchCart();
          }
        } else {
          const guestCart = getGuestCart();
          setCartItems(guestCart.items || []);
        }
      } catch (error) {
        console.error("Lỗi khi load giỏ hàng:", error);
      } finally {
        setIsLoadingCart(false);
      }
    };

    initializeCart();
  }, [isLoggedIn, userId, isSynced, fetchCart, syncGuestCartToServer]);

  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountMessage, setDiscountMessage] = useState("");
  const [userInfo, setUserInfo] = useState({
    name: "",
    phoneNumber: "",
    address: "",
  });

  const handleSelectChange = (productId, variantId, checked) => {
    const key = `${productId}-${variantId}`;
    if (checked) {
      setSelectedItems((prev) => [...prev, key]);
    } else {
      setSelectedItems((prev) => prev.filter((k) => k !== key));
    }
  };

  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(`${item.productId}-${item.variantId}`)
  );

  const updateQuantity = async (productId, variantId, change) => {
    setItemLoading((prev) => ({
      ...prev,
      [`${productId}-${variantId}`]: true,
    }));
    try {
      if (isLoggedIn && cart?.id) {
        if (change > 0) {
          await increaseQuantity(cart.id, productId, variantId);
          showToast("Đã tăng số lượng sản phẩm", "success");
        } else {
          await decreaseQuantity(cart.id, productId, variantId);
          showToast("Đã giảm số lượng sản phẩm", "success");
        }
        await fetchCart();
      } else {
        setCartItems((prevItems) => {
          const updatedItems = prevItems.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? {
                  ...item,
                  quantity: Math.max(1, item.quantity + change),
                  totalPrice:
                    Math.max(1, item.quantity + change) *
                    (item.discountPrice || item.originalPrice),
                  updatedAt: new Date(),
                }
              : item
          );

          const updatedCart = {
            items: updatedItems,
            totalItems: updatedItems.length,
            totalPrice: updatedItems.reduce(
              (sum, item) => sum + item.totalPrice,
              0
            ),
            isDeleted: false,
          };

          saveGuestCart(updatedCart);
          return updatedItems;
        });
      }
    } catch (err) {
      showToast("Lỗi cập nhật số lượng", "error");
      console.error(err);
    } finally {
      setItemLoading((prev) => {
        const newState = { ...prev };
        delete newState[`${productId}-${variantId}`];
        return newState;
      });
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeItem = async (productId, variantId) => {
    setItemLoading((prev) => ({
      ...prev,
      [`${productId}-${variantId}`]: true,
    }));
    try {
      if (isLoggedIn && cart?.id) {
        await removeItemAPI(cart.id, productId, variantId);
        await fetchCart();
        showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success");
      } else {
        setCartItems((prevItems) => {
          const updatedItems = prevItems.filter(
            (item) =>
              item.productId !== productId || item.variantId !== variantId
          );

          const updatedCart = {
            items: updatedItems,
            totalItems: updatedItems.reduce(
              (sum, item) => sum + item.quantity,
              0
            ),
            totalPrice: updatedItems.reduce(
              (sum, item) => sum + item.totalPrice,
              0
            ),
            isDeleted: false,
          };

          saveGuestCart(updatedCart);
          window.dispatchEvent(new Event("guest_cart_updated"));
          return updatedItems;
        });
      }
    } catch (err) {
      showToast("Lỗi khi xóa sản phẩm", "error");
      console.error(err);
    } finally {
      setItemLoading((prev) => {
        const newState = { ...prev };
        delete newState[`${productId}-${variantId}`];
        return newState;
      });
    }
  };

  const discountAmount = useMemo(() => {
    if (!discountApplied || !appliedDiscount) return 0;

    const subtotal = cartItems.reduce(
      (total, item) => total + item.totalPrice,
      0
    );

    let discount = 0;
    if (appliedDiscount.discountType === "percentage") {
      discount = subtotal * (appliedDiscount.discountValue / 100);

      if (
        appliedDiscount.maxDiscountAmount &&
        discount > appliedDiscount.maxDiscountAmount
      ) {
        discount = appliedDiscount.maxDiscountAmount;
      }
    } else if (appliedDiscount.discountType === "fixed") {
      discount = appliedDiscount.discountValue;
    }

    return Math.min(discount, subtotal);
  }, [cartItems, appliedDiscount, discountApplied]);

  const calculateTotal = () => {
    const subtotal = selectedCartItems.reduce(
      (total, item) => total + item.totalPrice,
      0
    );
    return (subtotal - discountAmount).toFixed(2);
  };

  const handleDiscountSubmit = (e) => {
    e.preventDefault();

    const codeInput = discountCode.trim().toLowerCase();
    const code = discountCodes.find((c) => c.code.toLowerCase() === codeInput);

    if (!code) {
      setDiscountApplied(false);
      setDiscountMessage("Mã giảm giá không tồn tại.");
      return;
    }

    const now = new Date();

    if (code.isDeleted) {
      setDiscountApplied(false);
      setDiscountMessage("Mã giảm giá này đã bị xóa.");
      return;
    }

    if (!code.isActive) {
      setDiscountApplied(false);
      setDiscountMessage("Mã giảm giá này hiện không hoạt động.");
      return;
    }

    if (new Date(code.startDate) > now) {
      setDiscountApplied(false);
      setDiscountMessage("Mã giảm giá chưa bắt đầu có hiệu lực.");
      return;
    }

    if (new Date(code.endDate) < now) {
      setDiscountApplied(false);
      setDiscountMessage("Mã giảm giá đã hết hạn.");
      return;
    }

    if (code.usedByUsers?.includes(userId)) {
      setDiscountApplied(false);
      setDiscountMessage("Bạn đã sử dụng mã giảm giá này trước đó.");
      return;
    }

    if (code.usageLimit && code.usageCount >= code.usageLimit) {
      setDiscountApplied(false);
      setDiscountMessage("Mã giảm giá đã đạt đến số lượt sử dụng tối đa.");
      return;
    }

    const cartProductIds = cartItems.map((item) => item.productId);
    const cartCategoryIds = cartItems.map((item) => item.categoryId);

    const appliesToAll =
      (!code.applicableProducts || code.applicableProducts.length === 0) &&
      (!code.applicableCategories || code.applicableCategories.length === 0);

    const hasApplicableProducts =
      code.applicableProducts?.some((id) => cartProductIds.includes(id)) ||
      false;

    const hasApplicableCategories =
      code.applicableCategories?.some((id) => cartCategoryIds.includes(id)) ||
      false;

    const isApplicable =
      appliesToAll || hasApplicableProducts || hasApplicableCategories;

    if (!isApplicable) {
      setDiscountApplied(false);
      setDiscountMessage(
        "Mã giảm giá không áp dụng cho bất kỳ sản phẩm hoặc danh mục nào trong giỏ hàng của bạn."
      );
      return;
    }

    setDiscountApplied(true);
    setAppliedDiscount(code);
    setDiscountMessage(`Đã áp dụng mã giảm giá "${code.code}" thành công!`);
  };

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    console.log("Thanh toán", {
      selectedCartItems,
      userInfo,
      total: calculateTotal(),
    });
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setTempAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressObjectChange = (newAddressPart) => {
    setTempAddress(newAddressPart);
  };

  const confirmAddress = () => {
    setShippingAddress(tempAddress);
    setShowAddressModal(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const showToast = (message, type = "info") => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: FaHome },
    { label: "Giỏ hàng", href: "/cart", icon: FaShoppingCart },
  ];

  return (
    <>
      <ToastContainer />
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex justify-center items-center bg-gradient-to-br from-gray-100 to-blue-50 p-6 md:p-12 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-center mb-10 text-blue-600 tracking-tight dark:text-blue-400">
            Giỏ hàng
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {isLoadingCart ? (
                <div className="flex justify-center items-center h-40">
                  <div className="flex items-center space-x-2">
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="#1C64F2"
                      />
                    </svg>
                    <span className="text-gray-600 text-xl font-medium dark:text-gray-300">
                      Đang tải giỏ hàng...
                    </span>
                  </div>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center bg-white rounded-lg shadow p-10 dark:bg-gray-800">
                  <FaShoppingCart className="text-6xl text-gray-400 mb-4 dark:text-gray-400" />
                  <h2 className="text-2xl font-semibold text-gray-700 mb-2 dark:text-gray-200">
                    Giỏ hàng của bạn đang trống
                  </h2>
                  <p className="text-gray-500 mb-6 dark:text-gray-400">
                    Hãy thêm sản phẩm vào giỏ để tiến hành thanh toán.
                  </p>
                  <a
                    href="/"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200"
                  >
                    Tiếp tục mua sắm
                  </a>
                </div>
              ) : (
                <>
                  {/* Chọn tất cả / Bỏ chọn tất cả */}
                  <label
                    htmlFor="selectAllCheckbox"
                    className="
                      flex items-center mb-5
                      cursor-pointer
                      select-none
                      text-gray-800
                      text-lg font-semibold
                      hover:text-blue-600
                      transition-colors duration-200
                      user-select-none
                      group
                      dark:text-gray-200
                      dark:hover:text-blue-400
                    "
                  >
                    <input
                      id="selectAllCheckbox"
                      type="checkbox"
                      className="
                        w-6 h-6 mr-3
                        text-blue-600
                        border-gray-300
                        rounded-md
                        shadow-sm
                        focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                        hover:border-blue-500
                        transition duration-200
                        cursor-pointer
                        group-hover:border-blue-600
                        dark:border-gray-600
                        dark:bg-gray-700
                        dark:focus:ring-blue-400
                      "
                      checked={
                        selectedItems.length ===
                          cartItems.filter((item) => item.stock > 0).length &&
                        cartItems.filter((item) => item.stock > 0).length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(
                            cartItems
                              .filter((item) => item.stock > 0)
                              .map(
                                (item) => `${item.productId}-${item.variantId}`
                              )
                          );
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                    <span className="pointer-events-none">
                      {selectedItems.length === cartItems.length
                        ? "Bỏ chọn tất cả"
                        : "Chọn tất cả sản phẩm"}
                    </span>
                  </label>

                  {/* Danh sách sản phẩm có checkbox */}
                  {cartItems.map((item) => {
                    const itemKey = `${item.productId}-${item.variantId}`;
                    const isChecked = selectedItems.includes(itemKey);
                    const isOutOfStock = item.stock === 0;

                    return (
                      <div
                        key={itemKey}
                        className="flex items-start gap-4 dark:text-gray-200"
                      >
                        <input
                          type="checkbox"
                          className={`
                          w-6 h-6
                          text-blue-600
                          border-gray-300
                          rounded-md
                          shadow-sm
                          focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                          hover:border-blue-500
                          transition
                          duration-200
                          cursor-pointer
                          dark:border-gray-600
                          dark:bg-gray-700
                          dark:focus:ring-blue-400
                          ${
                            isOutOfStock
                              ? "cursor-not-allowed opacity-50 hover:border-gray-300"
                              : ""
                          }
                        `}
                          checked={isChecked}
                          disabled={isOutOfStock}
                          onChange={(e) =>
                            handleSelectChange(
                              item.productId,
                              item.variantId,
                              e.target.checked
                            )
                          }
                        />

                        <div className="flex-1">
                          <CartItem
                            item={item}
                            onQuantityChange={updateQuantity}
                            onRemove={removeItem}
                            darkMode
                          />
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Tóm tắt đơn hàng */}
            <OrderSummary
              cartItems={cartItems.filter((item) =>
                selectedItems.includes(`${item.productId}-${item.variantId}`)
              )}
              discountCode={discountCode}
              discountApplied={discountApplied}
              discountAmount={discountAmount}
              discountMessage={discountMessage}
              userInfo={userInfo}
              shippingAddress={shippingAddress}
              onDiscountChange={(e) => setDiscountCode(e.target.value)}
              onDiscountSubmit={handleDiscountSubmit}
              onUserInfoChange={handleUserInfoChange}
              onAddressClick={() => setShowAddressModal(true)}
              onCheckout={handleCheckout}
              onRemoveItem={removeItem}
              formatPrice={formatPrice}
              darkMode
            />
          </div>
        </div>
      </div>

      {/* Modal địa chỉ */}
      {showAddressModal && (
        <AddressModal
          tempAddress={tempAddress}
          onChangeInput={handleAddressInputChange}
          onChangeSelect={handleAddressObjectChange}
          onClose={() => setShowAddressModal(false)}
          onConfirm={confirmAddress}
          darkMode
        />
      )}
    </>
  );
};

export default CartPage;
