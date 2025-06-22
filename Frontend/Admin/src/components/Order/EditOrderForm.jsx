import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useEditOrder from "../../hooks/Order/useEditOrder";
import BackButton from "../BackButton";
import useUsers from "../../hooks/Order/useUsers";
import useProducts from "../../hooks/Order/useProducts";
import useBrands from "../../hooks/Order/useBrands";
import useCategories from "../../hooks/Order/useCategories";
import {
  FaBuilding,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaTag,
  FaCreditCard,
  FaClipboardList,
  FaMoneyBillWave,
  FaTruck,
  FaRegCheckCircle,
} from "react-icons/fa";

const EditOrderForm = () => {
  const { id } = useParams();
  const {
    order,
    setOrder,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    provinces,
    districts,
    communes,
    handleChange,
    handleSubmit,
    handleProvinceChange,
    handleDistrictChange,
    handleCommuneChange,
    confirmReturn,
    rejectReturn,
    cancelOrder,
    requestReturn,
  } = useEditOrder(id);
  const navigate = useNavigate();

  const { users, loading: loadingUsers } = useUsers();
  const { products, loading: loadingProducts } = useProducts();
  const { brands, loading: loadingBrands } = useBrands();
  const { categories, loading: loadingCategories } = useCategories();
  const [cancelReasonInput, setCancelReasonInput] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCancelClick = () => {
    if (!cancelReasonInput.trim()) {
      alert("Vui lòng nhập lý do hủy đơn.");
      return;
    }
    cancelOrder(cancelReasonInput);
    setCancelReasonInput("");
  };

  const handleRejectReturnClick = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối trả hàng.");
      return;
    }

    try {
      const result = await rejectReturn(rejectReason);
      setOrder(result);
      setRejectReason("");
    } catch (error) {
      console.error("Từ chối trả hàng thất bại:", error.message);
    }
  };

  useEffect(() => {
    if (showSuccessMessage) {
      setTimeout(() => {
        navigate("/order-list");
      }, 30000000);
    }
  }, [showSuccessMessage, navigate]);

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [userSearch, setUserSearch] = useState("");

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const product = products.find((product) => product.id === productId);
    setSelectedProduct(product);
    setSelectedVariant(null);
    setUnitPrice(product.pricing.current);
  };

  const handleVariantSelect = (e) => {
    const variantId = e.target.value;
    const variant = selectedProduct.variants.find(
      (v) => v.variantId === variantId
    );
    setSelectedVariant(variant);
  };

  const handleQuantityChange = (e) => {
    const inputQuantity = parseInt(e.target.value, 10);
    if (inputQuantity > selectedVariant.stock) {
      alert(`Số lượng không thể lớn hơn ${selectedVariant.stock}`);
      setQuantity(selectedVariant.stock);
    } else {
      setQuantity(inputQuantity);
    }
  };

  const handleAddProduct = () => {
    if (!selectedVariant || quantity <= 0) {
      alert("Invalid quantity or variant selected.");
      return;
    }

    if (quantity > selectedVariant?.stock) {
      alert(`Số lượng không thể lớn hơn ${selectedVariant.stock}`);
      return;
    }

    const computedTotalPrice = selectedProduct.pricing.current * quantity;

    const existingProductIndex = order?.items.findIndex(
      (item) =>
        item.productId === selectedProduct.id &&
        item.variantId === selectedVariant.variantId
    );

    if (existingProductIndex !== -1) {
      const updatedItems = [...order?.items];
      updatedItems[existingProductIndex].quantity += quantity;
      updatedItems[existingProductIndex].totalPrice =
        updatedItems[existingProductIndex].quantity *
        updatedItems[existingProductIndex].discountPrice;

      setOrder((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    } else {
      const newProduct = {
        productId: selectedProduct.id,
        variantId: selectedVariant.variantId,
        brandId: selectedProduct.brandId,
        categoryId: selectedProduct.categoryId,
        discountPrice: selectedProduct.pricing.current,
        originalPrice: selectedProduct.pricing.original,
        quantity,
        totalPrice: computedTotalPrice,
        productName: selectedProduct.name,
        color: selectedVariant.color,
        hexCode: selectedVariant.hexCode,
        size: selectedVariant.size,
        ram: selectedVariant.ram,
        storage: selectedVariant.storage,
        condition: selectedVariant.condition,
        productImage: selectedProduct.images[0] || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setOrder((prev) => ({
        ...prev,
        items: [...prev.items, newProduct],
      }));
    }

    setSelectedVariant(null);
    setQuantity(1);
    setUnitPrice(0);
  };

  const handleRemoveProduct = (index) => {
    const updatedItems = order?.items.filter((_, i) => i !== index);
    setOrder((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleShowProductSelection = () => {
    setShowProductSelection(true);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
    setUnitPrice(0);
  };

  const orderStatusList = [
    "Chờ xác nhận",
    "Chờ lấy hàng",
    "Đang giao",
    "Đã giao",
    "Yêu cầu trả hàng",
    "Đã trả hàng",
    "Đã hủy",
  ];

  const currentStatusIndex = order?.orderStatus
    ? orderStatusList.indexOf(order?.orderStatus)
    : -1;

  const availableStatuses =
    currentStatusIndex === -1
      ? orderStatusList
      : orderStatusList.slice(currentStatusIndex);

  return (
    <>
      <div className="mb-4">
        <BackButton path="/order-list" />
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        {showErrorMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-white bg-red-500 rounded-lg shadow-lg"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-white bg-red-400 rounded-lg">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0Zm1 14h-2v-2h2v2Zm0-4h-2V6h2v4Z" />
              </svg>
            </div>
            <div className="ml-3 text-sm font-normal">
              Cập nhật đơn hàng thất bại. Vui lòng thử lại!
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white dark:bg-gray-700 rounded-lg shadow-lg"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200 rounded-lg">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            </div>
            <div className="ml-3 text-sm font-normal">
              Cập nhật đơn hàng thành công.
            </div>
          </div>
        )}

        <div className="border-b pb-4 mb-6">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Thông tin người đặt
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-3">
            <div>
              <label
                htmlFor="userId"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
              >
                <FaBuilding className="mr-2 text-blue-500" /> Người đặt hàng
              </label>

              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-2"
                placeholder="Nhập tên người dùng..."
              />

              <select
                name="userId"
                value={order?.userId}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                <option value="">Chọn người dùng</option>
                {loadingUsers ? (
                  <option>Đang tải...</option>
                ) : (
                  users
                    .filter((user) =>
                      user.username
                        .toLowerCase()
                        .includes(userSearch.toLowerCase())
                    )
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
              >
                <FaPhoneAlt className="mr-2 text-teal-500" /> Số điện thoại
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={order?.phoneNumber || ""}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Số điện thoại"
                required
              />
            </div>

            <div>
              <label
                htmlFor="shippingAddress.city"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
              >
                <FaMapMarkerAlt className="mr-2 text-purple-500" /> Tỉnh thành
              </label>
              <select
                id="shippingAddress.city"
                name="shippingAddress.city"
                value={order?.shippingAddress.city || ""}
                onChange={handleProvinceChange}
                className="bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="">Chọn tỉnh thành</option>
                {provinces.length === 0 ? (
                  <option disabled>Đang tải tỉnh thành...</option>
                ) : (
                  provinces.map((province) => (
                    <option key={province.id} value={province.full_name}>
                      {province.full_name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="shippingAddress.district"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
              >
                <FaMapMarkerAlt className="mr-2 text-purple-500" /> Quận huyện
              </label>
              <select
                id="shippingAddress.district"
                name="shippingAddress.district"
                value={order?.shippingAddress.district || ""}
                onChange={handleDistrictChange}
                className="bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="">Chọn quận huyện</option>
                {districts.length === 0 ? (
                  <option disabled>Đang tải quận huyện...</option>
                ) : (
                  districts.map((district) => (
                    <option key={district.id} value={district.full_name}>
                      {district.full_name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="shippingAddress.communes"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
              >
                <FaMapMarkerAlt className="mr-2 text-purple-500" /> Phường xã
              </label>
              <select
                id="shippingAddress.communes"
                name="shippingAddress.communes"
                value={order?.shippingAddress.communes || ""}
                onChange={handleCommuneChange}
                className="bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="">Chọn phường xã</option>
                {communes.length === 0 ? (
                  <option disabled>Đang tải phường xã...</option>
                ) : (
                  communes.map((commune) => (
                    <option key={commune.id} value={commune.full_name}>
                      {commune.full_name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="shippingAddress.street"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
              >
                <FaMapMarkerAlt className="mr-2 text-purple-500" /> Số nhà, tên
                đường
              </label>
              <input
                type="text"
                id="shippingAddress.street"
                name="shippingAddress.street"
                value={order?.shippingAddress.street || ""}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Số nhà, tên đường"
                required
              />

              {errors.shippingAddress?.street && (
                <span className="text-red-500 text-sm">
                  {errors.shippingAddress.street}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="paymentMethod"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
              >
                <FaCreditCard className="mr-2 text-indigo-500" /> Phương thức
                thanh toán
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={order?.paymentMethod || ""}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                <option value="">Chọn phương thức thanh toán</option>
                <option value="COD">COD</option>
                <option value="VNPay">VNPay</option>
              </select>
              {errors.paymentMethod && (
                <span className="text-red-500 text-sm">
                  {errors.paymentMethod}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="orderNotes"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
              >
                <FaClipboardList className="mr-2 text-indigo-500" />
                Ghi chú đơn hàng
              </label>
              <textarea
                id="orderNotes"
                name="orderNotes"
                value={order?.orderNotes || ""}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Ghi chú cho đơn hàng"
              />
              {errors.orderNotes && (
                <span className="text-red-500 text-sm">
                  {errors.orderNotes}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="discountCode"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
              >
                <FaMoneyBillWave className="inline mr-2 text-gray-500" />
                Mã giảm giá
              </label>
              <textarea
                id="discountCode"
                name="discountCode"
                value={order?.discountCode || ""}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Ghi chú cho đơn hàng (Không bắt buộc)"
              />
              {errors.discountCode && (
                <span className="text-red-500 text-sm">
                  {errors.discountCode}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="shippingMethod"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
              >
                <FaTruck className="inline mr-2 text-orange-500" />
                Phương thức giao hàng
              </label>
              <select
                id="shippingMethod"
                name="shippingMethod"
                value={order?.shippingMethod || ""}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                <option value="">Chọn phương thức giao hàng</option>
                <option value="Giao hàng nhanh">Giao hàng nhanh</option>
                <option value="Giao hàng tiết kiệm">Giao hàng tiết kiệm</option>
                <option value="Giao hàng hỏa tốc">Giao hàng hỏa tốc</option>
              </select>
              {errors.shippingMethod && (
                <span className="text-red-500 text-sm">
                  {errors.shippingMethod}
                </span>
              )}
            </div>
          </div>
          <div className="order-status-section">
            <label
              htmlFor="orderStatus"
              className="block mb-2 mt-4 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaRegCheckCircle className="inline mr-2 text-green-500" />
              Trạng thái đơn hàng
            </label>

            <select
              id="orderStatus"
              name="orderStatus"
              value={order?.orderStatus || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            >
              <option value="">Chọn trạng thái đơn hàng</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            {errors.orderStatus && (
              <span className="text-red-500 text-sm">{errors.orderStatus}</span>
            )}

            {order?.orderStatus === "Đã hủy" && order?.cancellationReason && (
              <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                <strong>Lý do hủy đơn:</strong> {order?.cancellationReason}
              </div>
            )}

            {order?.orderStatus === "Đã hủy" && !order?.cancellationReason && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-white">
                  Nhập lý do hủy đơn
                </label>
                <textarea
                  value={cancelReasonInput}
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                  placeholder="Nhập lý do..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  onClick={handleCancelClick}
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Xác nhận hủy đơn hàng
                </button>
              </div>
            )}

            {order?.orderStatus === "Yêu cầu trả hàng" && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-700 dark:text-white">
                  <strong>Lý do trả hàng:</strong> {order?.returnReason}
                </p>
                <button
                  onClick={confirmReturn}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Chấp nhận trả hàng
                </button>
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-white">
                    Lý do từ chối trả hàng
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Nhập lý do từ chối..."
                  />
                  <button
                    type="button"
                    onClick={handleRejectReturnClick}
                    className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Từ chối trả hàng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-b pb-4 mb-6">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Thông tin đơn hàng
          </h3>

          <div className="border-b pb-4 mb-6">
            <button
              type="button"
              onClick={handleShowProductSelection}
              className="text-white bg-blue-500 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 mt-4"
            >
              Chọn sản phẩm cho đơn hàng
            </button>

            {showProductSelection && (
              <>
                {/* Input tìm kiếm sản phẩm */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm rounded-lg p-2.5 w-full mt-4"
                  placeholder="Nhập tên sản phẩm để tìm..."
                />

                {/* Dropdown chọn sản phẩm theo kết quả lọc */}
                <select
                  name="productId"
                  onChange={handleProductSelect}
                  className="border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm rounded-lg p-2.5 w-full mt-2"
                  required
                >
                  <option value="">Chọn sản phẩm</option>
                  {loadingProducts ? (
                    <option>Đang tải...</option>
                  ) : (
                    products
                      ?.filter((product) =>
                        product.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))
                  )}
                </select>

                {selectedProduct && (
                  <>
                    <div className="mt-4">
                      <label className="text-sm font-bold dark:text-white">
                        Chọn biến thể
                      </label>
                      <select
                        name="variantId"
                        onChange={handleVariantSelect}
                        className="border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm rounded-lg p-2.5 w-full mt-2"
                        required
                      >
                        <option value="">Chọn biến thể</option>
                        {selectedProduct?.variants?.map((variant) => {
                          const variantDescription = [
                            variant.color,
                            variant.size,
                            variant.ram,
                            variant.storage,
                            variant.stock,
                          ]
                            .filter((val) => val && val !== "")
                            .join(" - ");

                          return (
                            <option
                              key={variant.variantId}
                              value={variant.variantId}
                            >
                              {variantDescription}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {selectedVariant && (
                      <>
                        <div className="mt-4">
                          <label className="text-sm font-bold dark:text-white">
                            Giá đã giảm
                          </label>
                          <input
                            type="text"
                            value={new Intl.NumberFormat("vi-VN").format(
                              selectedProduct.pricing.current || 0
                            )}
                            readOnly
                            className="border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm rounded-lg p-2.5 w-full mt-2"
                          />
                        </div>

                        <div className="mt-4">
                          <label className="text-sm font-bold dark:text-white">
                            Số lượng
                          </label>
                          <input
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm rounded-lg p-2.5 w-full mt-2"
                            placeholder="Số lượng"
                            min="1"
                            max={selectedVariant?.stock}
                          />
                          {quantity > selectedVariant?.stock && (
                            <span className="text-red-500 text-sm mt-2 block">
                              Số lượng không thể lớn hơn{" "}
                              {selectedVariant?.stock}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleAddProduct}
                          className="text-white bg-blue-500 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 mt-4"
                        >
                          Thêm sản phẩm vào đơn hàng
                        </button>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <div className="border-b pb-4 mb-6">
            <label className="text-lg font-bold uppercase text-gray-900 dark:text-white">
              Sản phẩm đã chọn
            </label>
            {order?.items.length > 0 ? (
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white">
                        Tên sản phẩm
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white">
                        Biến thể
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white">
                        Thương hiệu
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white">
                        Danh mục
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white">
                        Số lượng
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white">
                        Giá đã giảm
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-300">
                        Giá gốc
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white">
                        Tổng giá trị
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-white">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order?.items.map((item, index) => {
                      const brand = brands.find((b) => b.id === item.brandId);
                      const category = categories.find(
                        (c) => c.id === item.categoryId
                      );

                      return (
                        <tr key={index} className="text-center dark:text-white">
                          <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                            {item.productName}
                          </td>
                          <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                            {[
                              item.color,
                              item.size,
                              item.ram,
                              item.condition,
                              item.storage,
                            ]
                              .filter(Boolean)
                              .join(" - ") || "N/A"}
                          </td>
                          <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                            {brand ? brand.name : "N/A"}
                          </td>
                          <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                            {category ? category.name : "N/A"}
                          </td>
                          <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.discountPrice)}
                          </td>
                          <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-300">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.originalPrice)}
                          </td>
                          <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 font-bold text-lg text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.totalPrice || 0)}
                          </td>

                          <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(index)}
                              className="text-white bg-red-500 hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-1.5"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 font-bold text-right dark:text-white"
                      >
                        Tổng giá trị:
                      </td>
                      <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 font-bold text-xl text-red-600 dark:text-red-400">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          order?.items.reduce(
                            (total, item) =>
                              total + item.quantity * item.discountPrice,
                            0
                          )
                        )}
                      </td>

                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="dark:text-white">Chưa có sản phẩm nào được chọn.</p>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Cập nhật đơn hàng
          </button>
        </div>
      </form>
      <div className="mt-4">
        <BackButton path="/order-list" />
      </div>
    </>
  );
};

export default EditOrderForm;
