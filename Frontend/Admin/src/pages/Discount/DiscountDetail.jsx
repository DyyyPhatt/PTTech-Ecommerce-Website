import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaTag,
  FaInfoCircle,
  FaShoppingCart,
  FaClipboardList,
  FaCalendarAlt,
  FaUsers,
  FaRegCheckCircle,
} from "react-icons/fa";
import BackButton from "../../components/BackButton";

const getUserToken = () => {
  return localStorage.getItem("userToken");
};

const DiscountDetail = () => {
  const { id } = useParams();
  const [discount, setDiscount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiscountDetail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8081/api/discount-codes/${id}`
        );
        setDiscount(response.data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin mã giảm giá.");
        setLoading(false);
      }
    };

    fetchDiscountDetail();
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/categories"
        );
        setCategories(response.data);
      } catch (err) {
        console.error("Không thể tải danh sách danh mục.", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/products?sortBy=name&sortOrder=asc"
        );
        setProducts(response.data);
      } catch (err) {
        console.error("Không thể tải danh sách sản phẩm.", err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const userToken = getUserToken();

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/users", {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        setUsers(response.data);
      } catch (err) {
        console.error("Không thể tải danh sách người dùng.", err);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-blue-600">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!discount) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">
          Không tìm thấy dữ liệu mã giảm giá.
        </div>
      </div>
    );
  }

  const {
    code,
    description,
    discountType,
    discountValue,
    minimumPurchaseAmount,
    applicableCategories,
    applicableProducts,
    appliesTo,
    startDate,
    endDate,
    usageLimit,
    usageCount,
    isActive,
    usedByUsers,
    maxDiscountAmount,
  } = discount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto flex justify-center items-center space-x-4 mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white text-center">
          Chi tiết mã giảm giá
        </h1>
      </div>
      <div className="max-w-4xl mx-auto flex justify-between">
        <BackButton path="/discount-list" />
        <button
          onClick={() => navigate(`/edit-discount/${id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
            />
          </svg>
          <span>Chỉnh sửa mã giảm giá</span>
        </button>
      </div>
      <div className="max-w-4xl mx-auto mt-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-4">
            <FaTag className="w-10 h-10" />
            <div>
              <h3 className="text-2xl font-semibold">{code}</h3>
              <p className="text-sm">{description}</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
            {[
              {
                label: (
                  <>
                    <FaInfoCircle className="inline mr-2 text-orange-500" />
                    Loại giảm giá
                  </>
                ),
                value:
                  discountType === "percentage"
                    ? `Giảm theo phần trăm: ${discountValue}%`
                    : `Giảm theo số tiền: ${new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })
                        .format(discountValue)
                        .replace("VND", "đ")}`,
              },
              {
                label: (
                  <>
                    <FaShoppingCart className="inline mr-2 text-green-500" />
                    Giá trị mua tối thiểu
                  </>
                ),
                value: new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })
                  .format(minimumPurchaseAmount)
                  .replace("VND", "đ"),
              },
              {
                label: (
                  <>
                    <FaShoppingCart className="inline mr-2 text-red-500" />
                    Số tiền giảm tối đa
                  </>
                ),
                value: new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })
                  .format(maxDiscountAmount)
                  .replace("VND", "đ"),
              },
              {
                label: (
                  <>
                    <FaClipboardList className="inline mr-2 text-blue-500" />
                    Danh mục áp dụng
                  </>
                ),
                value:
                  applicableCategories.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {applicableCategories.map((categoryId) => {
                        const category = categories.find(
                          (c) => c.id === categoryId
                        );
                        return (
                          <li
                            key={categoryId}
                            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1 rounded-lg text-sm"
                          >
                            {category?.name || "Không xác định"}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    "Chưa có"
                  ),
              },
              {
                label: (
                  <>
                    <FaClipboardList className="inline mr-2 text-blue-500" />
                    Sản phẩm áp dụng
                  </>
                ),
                value:
                  applicableProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {applicableProducts.map((productId) => {
                        const product = products.find(
                          (p) => p.id === productId
                        );
                        return (
                          <div
                            key={productId}
                            className="bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-white px-4 py-2 rounded-lg text-sm"
                          >
                            {product?.name || "Không xác định"}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    "Chưa có"
                  ),
              },
              {
                label: (
                  <>
                    <FaShoppingCart className="inline mr-2 text-purple-500" />
                    Áp dụng cho
                  </>
                ),
                value:
                  appliesTo === "products"
                    ? "Sản phẩm"
                    : appliesTo === "shipping"
                    ? "Vận chuyển"
                    : "Sản phẩm và Vận chuyển",
              },
              {
                label: (
                  <>
                    <FaUsers className="inline mr-2 text-red-500" />
                    Giới hạn sử dụng
                  </>
                ),
                value: `${usageLimit} lượt`,
              },
              {
                label: (
                  <>
                    <FaUsers className="inline mr-2 text-red-500" />
                    Đã sử dụng
                  </>
                ),
                value: `${usageCount} lượt`,
              },
              {
                label: (
                  <>
                    <FaRegCheckCircle className="inline mr-2 text-yellow-500" />
                    Trạng thái
                  </>
                ),
                value: isActive ? "Đang hoạt động" : "Dừng hoạt động",
              },
              {
                label: (
                  <>
                    <FaUsers className="inline mr-2 text-teal-500" />
                    Người dùng đã sử dụng
                  </>
                ),
                value:
                  usedByUsers.length > 0
                    ? usedByUsers
                        .map(
                          (userId) =>
                            users.find((user) => user.id === userId)
                              ?.username || "Không xác định"
                        )
                        .join(", ")
                    : "Chưa có người dùng nào sử dụng",
              },
              {
                label: "Ngày bắt đầu",
                value: new Date(startDate).toLocaleDateString(),
              },
              {
                label: "Ngày kết thúc",
                value: new Date(endDate).toLocaleDateString(),
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
              >
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex justify-between mt-4">
        <BackButton path="/discount-list" />
        <button
          onClick={() => navigate(`/edit-discount/${id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
            />
          </svg>
          <span>Chỉnh sửa mã giảm giá</span>
        </button>
      </div>
    </div>
  );
};

export default DiscountDetail;
