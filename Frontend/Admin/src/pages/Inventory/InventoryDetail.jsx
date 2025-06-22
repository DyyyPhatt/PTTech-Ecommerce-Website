import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  FaBox,
  FaStore,
  FaRegCalendarAlt,
  FaBullseye,
  FaInfoCircle,
} from "react-icons/fa";
import BackButton from "../../components/BackButton";

const InventoryDetail = () => {
  const { id } = useParams();
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  useEffect(() => {
    const fetchInventoryDetail = async () => {
      try {
        const token = getUserToken();

        const response = await axios.get(
          `http://localhost:8081/api/inventories/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setInventory(response.data);
      } catch (error) {
        setError("Không thể tải thông tin nhập kho.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInventoryDetail();
    }
  }, [id]);

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

  if (!inventory) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">
          Không tìm thấy thông tin nhập kho.
        </div>
      </div>
    );
  }

  const {
    supplier,
    totalAmount,
    totalQuantity,
    notes,
    receivedDate,
    products,
    isDeleted,
  } = inventory;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${date.getFullYear()} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto flex justify-center items-center space-x-4">
        <h1 className="text-3xl font-semibold text-gray-800 text-center dark:text-white">
          Chi tiết nhập kho
        </h1>
      </div>
      <div className="max-w-4xl mx-auto flex justify-start mb-4">
        <BackButton path="/inventory-list" />
      </div>
      <div className="max-w-4xl mx-auto mt-4 bg-white overflow-hidden shadow-lg rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-6 py-5 sm:px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-6">
            <div>
              <p className="mt-2 text-sm dark:text-white">
                <FaStore className="inline mr-1" />
                Nhà cung cấp: {supplier.name}
              </p>
              <p className="mt-2 text-sm dark:text-white">
                <FaBox className="inline mr-1" />
                Tổng số lượng: {totalQuantity}
              </p>
              <p className="mt-2 text-sm dark:text-white">
                <FaBox className="inline mr-1" />
                Tổng giá trị: {totalAmount.toLocaleString()} VND
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:p-0 dark:border-gray-700">
          <dl className="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                <FaRegCalendarAlt className="inline mr-2 text-blue-500" />
                Ngày nhập kho
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 dark:text-white">
                {formatDate(receivedDate)}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                <FaInfoCircle className="inline mr-2 text-yellow-500" />
                Ghi chú
              </dt>
              <dd className="text-sm text-gray-900 sm:mt-0 dark:text-white">
                {notes}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                <FaBox className="inline mr-2 text-purple-500" />
                Danh sách sản phẩm
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 dark:text-white">
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.productId}
                      className="border-t pt-4 dark:border-gray-700"
                    >
                      <h4 className="font-semibold dark:text-white">
                        {product.productName}
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                          <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                              {[
                                "Màu sắc",
                                "Kích thước",
                                "Ram",
                                "Bộ nhớ",
                                "Số lượng nhập kho",
                                "Giá mỗi sản phẩm",
                                "Tổng giá trị",
                                "Tồn kho trước khi nhập",
                                "Tồn kho sau khi nhập",
                              ].map((header) => (
                                <th
                                  key={header}
                                  className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {product.productVariants.map((variant) => (
                              <tr
                                key={variant.productVariantId}
                                className="border-t dark:border-gray-700"
                              >
                                {[
                                  variant.color ?? (
                                    <span className="text-gray-400">—</span>
                                  ),
                                  variant.size ?? (
                                    <span className="text-gray-400">—</span>
                                  ),
                                  variant.ram ?? (
                                    <span className="text-gray-400">—</span>
                                  ),
                                  variant.storage ?? (
                                    <span className="text-gray-400">—</span>
                                  ),
                                  variant.quantity ?? 0,
                                  variant.unitPrice?.toLocaleString() ?? "0",
                                  variant.totalValue?.toLocaleString() ?? "0",
                                  variant.stockBeforeUpdate ?? 0,
                                  variant.stockAfterUpdate ?? 0,
                                ].map((value, idx) => (
                                  <td
                                    key={idx}
                                    className="px-4 py-2 text-sm text-gray-700 dark:text-white"
                                  >
                                    {value}{" "}
                                    {typeof value === "number" && idx >= 5
                                      ? "VND"
                                      : ""}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="max-w-4xl mx-auto flex justify-start mt-4">
        <BackButton path="/inventory-list" />
      </div>
    </div>
  );
};

export default InventoryDetail;
