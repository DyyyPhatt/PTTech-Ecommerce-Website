import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAddOrder from "../../hooks/Order/useAddOrder";
import BackButton from "../BackButton";
import useUsers from "../../hooks/Order/useUsers";
import useProducts from "../../hooks/Order/useProducts";
import useBrands from "../../hooks/Order/useBrands";
import useCategories from "../../hooks/Order/useCategories";

import {
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCreditCard,
  FaClipboardList,
  FaMoneyBillWave,
  FaTruck,
} from "react-icons/fa";

const AddOrderForm = () => {
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
  } = useAddOrder();
  const navigate = useNavigate();

  const { users, loading: loadingUsers } = useUsers();
  const { products, loading: loadingProducts } = useProducts();
  const { brands, loading: loadingBrands } = useBrands();
  const { categories, loading: loadingCategories } = useCategories();

  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productToAdd, setProductToAdd] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    if (showSuccessMessage) {
      setTimeout(() => {
        navigate("/order-list");
      }, 3000);
    }
  }, [showSuccessMessage, navigate]);

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

    setShowProductSelection(false);

    const existingProductIndex = selectedProducts.findIndex(
      (item) =>
        item.productId === selectedProduct.id &&
        item.variantId === selectedVariant.variantId
    );

    if (existingProductIndex !== -1) {
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingProductIndex].quantity += quantity;
      updatedProducts[existingProductIndex].totalPrice =
        updatedProducts[existingProductIndex].quantity *
        updatedProducts[existingProductIndex].discountPrice;

      setSelectedProducts(updatedProducts);
      setOrder((prev) => ({
        ...prev,
        items: updatedProducts,
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

      setSelectedProducts((prev) => [...prev, newProduct]);
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
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleShowProductSelection = () => {
    setShowProductSelection(true);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
    setUnitPrice(0);
  };

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
              Thêm đơn hàng thất bại. Vui lòng thử lại!
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white dark:bg-gray-900 dark:text-white rounded-lg shadow-lg"
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
              Thêm đơn hàng thành công.
            </div>
          </div>
        )}

        <div className="border-b border-gray-300 dark:border-gray-700 pb-4 mb-6">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Thông tin người đặt
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Người đặt hàng
              </label>

              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-2"
                placeholder="Nhập tên người dùng..."
              />

              <select
                name="userId"
                value={order.userId}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                <option value="" className="text-gray-900 dark:text-white">
                  Chọn người dùng
                </option>
                {loadingUsers ? (
                  <option className="text-gray-900 dark:text-white">
                    Đang tải...
                  </option>
                ) : (
                  users
                    .filter((user) =>
                      user.username
                        .toLowerCase()
                        .includes(userSearch.toLowerCase())
                    )
                    .map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                        className="text-gray-900 dark:text-white"
                      >
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
                value={order.phoneNumber || ""}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Số điện thoại"
                required
              />
              {errors.phoneNumber && (
                <span className="text-red-500 text-sm">
                  {errors.phoneNumber}
                </span>
              )}
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
                value={order.shippingAddress.city || ""}
                onChange={handleProvinceChange}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option className="text-gray-900 dark:text-white" value="">
                  Chọn tỉnh thành
                </option>
                {provinces.length === 0 ? (
                  <option disabled className="text-gray-900 dark:text-white">
                    Đang tải tỉnh thành...
                  </option>
                ) : (
                  provinces.map((province) => (
                    <option
                      key={province.id}
                      value={province.full_name}
                      className="text-gray-900 dark:text-white"
                    >
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
                value={order.shippingAddress.district || ""}
                onChange={handleDistrictChange}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option className="text-gray-900 dark:text-white" value="">
                  Chọn quận huyện
                </option>
                {districts.length === 0 ? (
                  <option disabled className="text-gray-900 dark:text-white">
                    Đang tải quận huyện...
                  </option>
                ) : (
                  districts.map((district) => (
                    <option
                      key={district.id}
                      value={district.full_name}
                      className="text-gray-900 dark:text-white"
                    >
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
                value={order.shippingAddress.communes || ""}
                onChange={handleCommuneChange}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option className="text-gray-900 dark:text-white" value="">
                  Chọn phường xã
                </option>
                {communes.length === 0 ? (
                  <option disabled className="text-gray-900 dark:text-white">
                    Đang tải phường xã...
                  </option>
                ) : (
                  communes.map((commune) => (
                    <option
                      key={commune.id}
                      value={commune.full_name}
                      className="text-gray-900 dark:text-white"
                    >
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
                value={order.shippingAddress.street || ""}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
                value={order.paymentMethod || ""}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                <option className="text-gray-900 dark:text-white" value="">
                  Chọn phương thức thanh toán
                </option>
                <option className="text-gray-900 dark:text-white" value="COD">
                  COD
                </option>
                <option className="text-gray-900 dark:text-white" value="VNPay">
                  VNPay
                </option>
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
                value={order.orderNotes || ""}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Ghi chú cho đơn hàng (Không bắt buộc)"
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
                value={order.discountCode || ""}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Mã giảm giá cho đơn hàng (Không bắt buộc)"
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
                value={order.shippingMethod || ""}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                <option className="text-gray-900 dark:text-white" value="">
                  Chọn phương thức giao hàng
                </option>
                <option
                  className="text-gray-900 dark:text-white"
                  value="Giao hàng nhanh"
                >
                  Giao hàng nhanh
                </option>
                <option
                  className="text-gray-900 dark:text-white"
                  value="Giao hàng tiết kiệm"
                >
                  Giao hàng tiết kiệm
                </option>
                <option
                  className="text-gray-900 dark:text-white"
                  value="Giao hàng hỏa tốc"
                >
                  Giao hàng hỏa tốc
                </option>
              </select>
              {errors.shippingMethod && (
                <span className="text-red-500 text-sm">
                  {errors.shippingMethod}
                </span>
              )}
            </div>
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
                {/* Ô nhập tên sản phẩm */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 w-full mt-4 bg-gray-50 dark:bg-gray-700"
                  placeholder="Nhập tên sản phẩm..."
                />

                {/* Select sản phẩm (dựa trên searchQuery) */}
                <select
                  name="productId"
                  onChange={handleProductSelect}
                  className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 w-full mt-2 bg-gray-50 dark:bg-gray-700"
                  required
                >
                  <option className="text-gray-900 dark:text-white" value="">
                    Chọn sản phẩm
                  </option>
                  {loadingProducts ? (
                    <option className="text-gray-900 dark:text-white">
                      Đang tải...
                    </option>
                  ) : (
                    products
                      ?.filter((product) =>
                        product.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                          className="text-gray-900 dark:text-white"
                        >
                          {product.name}
                        </option>
                      ))
                  )}
                </select>

                {/* Nếu đã chọn sản phẩm */}
                {selectedProduct && (
                  <>
                    <div className="mt-4">
                      <label className="text-sm font-bold text-gray-900 dark:text-white">
                        Chọn biến thể
                      </label>
                      <select
                        name="variantId"
                        onChange={handleVariantSelect}
                        className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 w-full mt-2 bg-gray-50 dark:bg-gray-700"
                        required
                      >
                        <option
                          className="text-gray-900 dark:text-white"
                          value=""
                        >
                          Chọn biến thể
                        </option>
                        {selectedProduct?.variants?.map((variant) => {
                          const variantDescription = [
                            variant.color,
                            variant.size,
                            variant.ram,
                            variant.storage,
                            variant.stock,
                          ]
                            .filter((value) => value && value !== "")
                            .join(" - ");

                          return (
                            <option
                              key={variant.variantId}
                              value={variant.variantId}
                              className="text-gray-900 dark:text-white"
                            >
                              {variantDescription}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Nếu đã chọn biến thể */}
                    {selectedVariant && (
                      <>
                        <div className="mt-4">
                          <label className="text-sm font-bold text-gray-900 dark:text-white">
                            Giá đã giảm
                          </label>
                          <input
                            type="text"
                            value={new Intl.NumberFormat("vi-VN").format(
                              selectedProduct.pricing?.current || 0
                            )}
                            readOnly
                            className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 w-full mt-2 bg-gray-50 dark:bg-gray-700"
                          />
                        </div>

                        <div className="mt-4">
                          <label className="text-sm font-bold text-gray-900 dark:text-white">
                            Số lượng
                          </label>
                          <input
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 w-full mt-2 bg-gray-50 dark:bg-gray-700"
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
            {selectedProducts.length > 0 ? (
              <div className="overflow-x-auto mt-4">
                {/* Bọc bảng với div có cuộn ngang */}
                <table className="min-w-full table-auto border-collapse border border-gray-300 dark:border-gray-600 dark:bg-gray-800">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        Tên sản phẩm
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        Biến thể
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        Thương hiệu
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        Danh mục
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        Số lượng
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-red-600 dark:text-red-400">
                        Giá đã giảm
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        Giá gốc
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 font-semibold text-lg text-green-600 dark:text-green-400">
                        Tổng giá trị
                      </th>
                      <th className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((item, index) => {
                      const brand = brands.find((b) => b.id === item.brandId);
                      const category = categories.find(
                        (c) => c.id === item.categoryId
                      );

                      return (
                        <tr
                          key={index}
                          className="text-center text-gray-900 dark:text-white"
                        >
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
                              .filter((value) => value !== "")
                              .join(" - ") || "N/A"}{" "}
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
                          <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-red-600 dark:text-red-400">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.discountPrice)}
                          </td>
                          <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.originalPrice)}
                          </td>
                          <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 font-semibold text-lg text-green-600 dark:text-green-400">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.totalPrice || 0)}{" "}
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
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 font-bold text-right text-gray-900 dark:text-white"
                      >
                        Tổng giá trị:
                      </td>
                      <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 font-bold text-xl text-red-600 dark:text-red-400">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          selectedProducts.reduce(
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
              <p className="text-gray-900 dark:text-white">
                Chưa có sản phẩm nào được chọn.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {isSubmitting ? "Đang thêm..." : "Thêm đơn hàng"}
          </button>
        </div>
      </form>
      <div className="mt-4">
        <BackButton path="/order-list" />
      </div>
    </>
  );
};

export default AddOrderForm;
