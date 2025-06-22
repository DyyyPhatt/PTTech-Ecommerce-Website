import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useEditDiscount from "../../hooks/Discount/useEditDiscount";
import BackButton from "../BackButton";
import { useParams } from "react-router-dom";
import {
  FaTag,
  FaDollarSign,
  FaMoneyBill,
  FaInfoCircle,
  FaShoppingCart,
  FaTags,
  FaGift,
  FaLock,
  FaCalendarAlt,
  FaCalendarTimes,
} from "react-icons/fa";
import { Select, Tag } from "antd";
const { Option } = Select;
const getUserToken = () => {
  return localStorage.getItem("userToken");
};
const EditDiscountForm = ({ initialDiscount }) => {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const {
    discount,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
    handleCategoryChange,
    handleProductChange,
    getDiscountById,
  } = useEditDiscount(id);

  function formatNumber(num) {
    if (num === null || num === undefined) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function parseNumber(str) {
    return Number(str.replace(/\./g, "")) || 0;
  }

  useEffect(() => {
    const fetchCategories = async () => {
      const userToken = getUserToken();
      try {
        const categoriesResponse = await fetch(
          "http://localhost:8081/api/categories",
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        const categoriesData = await categoriesResponse.json();
        console.log("Categories Data:", categoriesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsResponse = await fetch(
          "http://localhost:8081/api/products?sortBy=name&sortOrder=asc"
        );
        const productsData = await productsResponse.json();
        console.log("Products Data:", productsData);
        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (id) {
      getDiscountById();
    }
  }, [id]);

  return (
    <>
      <div className="mb-4">
        <BackButton path="/discount-list" />
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800"
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
              Sửa mã giảm giá thất bại. Vui lòng thử lại!
            </div>
          </div>
        )}
        {showSuccessMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:bg-gray-700 dark:text-white"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
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
              Sửa mã giảm giá thành công.
            </div>
          </div>
        )}
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="code"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaTag className="mr-2 text-indigo-500 dark:text-indigo-400" />
              Mã giảm giá
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={discount.code || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Mã giảm giá"
              required
            />
            {errors?.code && (
              <span className="text-red-500 text-sm">{errors.code}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaInfoCircle className="mr-2 text-orange-500 dark:text-orange-400" />
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={discount.description || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Mô tả mã giảm giá"
              required
            />
            {errors?.description && (
              <span className="text-red-500 text-sm">{errors.description}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="discountType"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaMoneyBill className="mr-2 text-orange-500 dark:text-orange-400" />
              Loại giảm giá
            </label>
            <select
              id="discountType"
              name="discountType"
              value={discount.discountType}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="percentage">Theo phần trăm</option>
              <option value="fixed">Theo số tiền</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="discountValue"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaDollarSign className="mr-2 text-green-500 dark:text-green-400" />
              Giá trị giảm giá
            </label>
            <input
              type="text"
              id="discountValue"
              name="discountValue"
              value={formatNumber(discount.discountValue)}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "discountValue",
                    value: parseNumber(e.target.value),
                  },
                })
              }
              className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Giá trị giảm giá"
              required
            />
            {errors?.discountValue && (
              <span className="text-red-500 text-sm">
                {errors.discountValue}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="minimumPurchaseAmount"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaShoppingCart className="mr-2 text-blue-500 dark:text-blue-400" />
              Số tiền mua tối thiểu
            </label>
            <input
              type="text"
              id="minimumPurchaseAmount"
              name="minimumPurchaseAmount"
              value={formatNumber(discount.minimumPurchaseAmount)}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "minimumPurchaseAmount",
                    value: parseNumber(e.target.value),
                  },
                })
              }
              className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Số tiền mua tối thiểu"
            />
            {errors?.minimumPurchaseAmount && (
              <span className="text-red-500 text-sm">
                {errors.minimumPurchaseAmount}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="maxDiscountAmount"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaShoppingCart className="mr-2 text-red-500 dark:text-red-400" />
              Số tiền giảm tối đa
            </label>
            <input
              type="text"
              id="maxDiscountAmount"
              name="maxDiscountAmount"
              value={formatNumber(discount.maxDiscountAmount)}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "maxDiscountAmount",
                    value: parseNumber(e.target.value),
                  },
                })
              }
              className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Số tiền giảm tối đa"
            />
            {errors?.maxDiscountAmount && (
              <span className="text-red-500 text-sm">
                {errors.maxDiscountAmount}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="appliesTo"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaGift className="mr-2 text-pink-500 dark:text-pink-400" />
              Loại áp dụng
            </label>
            <select
              id="appliesTo"
              name="appliesTo"
              value={discount.appliesTo}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="products">Sản phẩm</option>
              <option value="shipping">Phí giao hàng</option>
              <option value="both">Cả hai</option>
            </select>
            {errors?.appliesTo && (
              <span className="text-red-500 text-sm">{errors.appliesTo}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="usageLimit"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaLock className="mr-2 text-red-500 dark:text-red-400" />
              Số lần sử dụng tối đa
            </label>
            <input
              type="number"
              id="usageLimit"
              name="usageLimit"
              value={discount.usageLimit || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Số lần sử dụng tối đa"
            />
            {errors?.usageLimit && (
              <span className="text-red-500 text-sm">{errors.usageLimit}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="startDate"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaCalendarAlt className="mr-2 text-teal-500 dark:text-teal-400" />
              Ngày bắt đầu
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={discount.startDate || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
            {errors?.startDate && (
              <span className="text-red-500 text-sm">{errors.startDate}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-white flex items-center"
            >
              <FaCalendarTimes className="mr-2 text-purple-500 dark:text-purple-400" />
              Ngày kết thúc
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={discount.endDate || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
            {errors?.endDate && (
              <span className="text-red-500 text-sm">{errors.endDate}</span>
            )}
          </div>
        </div>
        <div>
          <label className="block dark:text-white mt-6 mb-2 text-sm font-medium text-gray-800 flex items-center">
            <FaTags className="mr-2 text-indigo-500" />
            Danh mục áp dụng
          </label>

          <button
            type="button"
            onClick={() => {
              const allCategoryIds = categories.map((category) => category.id);
              handleCategoryChange(
                discount.applicableCategories.length === allCategoryIds.length
                  ? []
                  : allCategoryIds
              );
            }}
            className="mb-2 px-4 py-2 dark:text-white bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {discount.applicableCategories.length === categories.length
              ? "Bỏ chọn tất cả"
              : "Chọn tất cả"}
          </button>

          <Select
            mode="multiple"
            allowClear
            showSearch
            style={{ width: "100%" }}
            placeholder="Nhập để tìm và chọn danh mục"
            value={discount.applicableCategories}
            onChange={handleCategoryChange}
            filterOption={(input, option) =>
              option?.children.toLowerCase().includes(input.toLowerCase())
            }
            dropdownStyle={{ maxHeight: 400, overflowY: "auto" }}
          >
            {categories.length > 0 ? (
              categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))
            ) : (
              <Option disabled>Không có danh mục nào</Option>
            )}
          </Select>
        </div>

        {/* Sản phẩm áp dụng */}
        <div>
          <label className="block dark:text-white mt-6 mb-2 text-sm font-medium text-gray-800 flex items-center">
            <FaTags className="mr-2 text-green-500" />
            Sản phẩm áp dụng
          </label>

          <button
            type="button"
            onClick={() => {
              const allProductIds = products.map((product) => product.id);
              handleProductChange(
                discount.applicableProducts.length === allProductIds.length
                  ? []
                  : allProductIds
              );
            }}
            className="mb-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {discount.applicableProducts.length === products.length
              ? "Bỏ chọn tất cả"
              : "Chọn tất cả"}
          </button>

          <Select
            mode="multiple"
            allowClear
            showSearch
            style={{ width: "100%" }}
            placeholder="Nhập để tìm và chọn sản phẩm"
            value={discount.applicableProducts}
            onChange={handleProductChange}
            filterOption={(input, option) =>
              option?.children.toLowerCase().includes(input.toLowerCase())
            }
            dropdownStyle={{ maxHeight: 400, overflowY: "auto" }}
          >
            {products.length > 0 ? (
              products.map((product) => (
                <Option key={product.id} value={product.id}>
                  {product.name}
                </Option>
              ))
            ) : (
              <Option disabled>Không có sản phẩm nào</Option>
            )}
          </Select>
        </div>
        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isSubmitting ? "Đang sửa..." : "Sửa mã giảm giá"}
          </button>
        </div>
      </form>

      <div className="mt-4">
        <BackButton path="/discount-list" />
      </div>
    </>
  );
};

export default EditDiscountForm;
