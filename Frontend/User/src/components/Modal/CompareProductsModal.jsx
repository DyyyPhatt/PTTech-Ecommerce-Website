import React, { useState, useEffect } from "react";
import axios from "axios";

const CompareProductsModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [productDetails, setProductDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      resetModal();
    }
  }, [isOpen]);

  const resetModal = () => {
    setStep(1);
    setSelectedCategory(null);
    setProductsByCategory([]);
    setSelectedProducts([]);
    setComparisonResult(null);
    setProductDetails([]);
    setError(null);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/categories");
      setCategories(res.data);
    } catch {
      setError("Không thể tải danh mục.");
    }
  };

  const fetchProductsByCategory = async (categoryName) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8081/api/products/active", {
        params: { categoryName },
      });
      setProductsByCategory(res.data);
    } catch {
      setError("Không thể tải sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : prev.length < 4
        ? [...prev, productId]
        : prev
    );
  };

  const handleCompare = async () => {
    if (selectedProducts.length < 2) {
      setError("Chọn ít nhất 2 sản phẩm.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        "http://localhost:8081/api/products/compare",
        {
          params: { productIds: selectedProducts },
          paramsSerializer: (params) =>
            Object.entries(params)
              .map(([key, value]) =>
                Array.isArray(value)
                  ? value
                      .map((v) => `${key}=${encodeURIComponent(v)}`)
                      .join("&")
                  : `${key}=${encodeURIComponent(value)}`
              )
              .join("&"),
        }
      );

      const data = res.data;
      setProductDetails(data.products);
      setComparisonResult({
        products: data.products,
        evaluations: data.evaluations,
      });
      setStep(2);
    } catch {
      setError("Không thể so sánh sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-6xl max-h-[90vh] overflow-auto rounded-2xl p-6 shadow-2xl border border-rose-300 dark:border-rose-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-rose-600 dark:text-rose-300">
            So sánh sản phẩm
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 dark:text-gray-300"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 text-red-600 dark:text-red-400 font-semibold">
            {error}
          </div>
        )}

        {step === 1 ? (
          <>
            {/* Bước chọn danh mục và sản phẩm */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                Chọn danh mục
              </label>
              <select
                value={selectedCategory || ""}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedProducts([]);
                  fetchProductsByCategory(e.target.value);
                }}
                className="w-full border-2 rounded-lg p-2 bg-rose-50 dark:bg-gray-800 text-gray-800 dark:text-rose-200 border-rose-400 dark:border-rose-600"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="border border-rose-300 rounded-lg p-4 bg-rose-50 dark:bg-rose-800/30 max-h-60 overflow-auto space-y-2">
              {loading ? (
                <p className="text-rose-600 dark:text-rose-200">Đang tải...</p>
              ) : productsByCategory.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">
                  Chọn danh mục để hiển thị sản phẩm
                </p>
              ) : (
                productsByCategory.map((prod) => (
                  <label
                    key={prod.productId}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                      selectedProducts.includes(prod.productId)
                        ? "bg-rose-500 text-white"
                        : "hover:bg-rose-100 dark:hover:bg-rose-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(prod.productId)}
                      onChange={() => toggleProductSelection(prod.productId)}
                      disabled={
                        !selectedProducts.includes(prod.productId) &&
                        selectedProducts.length >= 4
                      }
                      className="accent-rose-500"
                    />
                    <span className="dark:text-gray-300">{prod.name}</span>
                  </label>
                ))
              )}
            </div>

            <button
              onClick={handleCompare}
              disabled={selectedProducts.length < 2 || loading}
              className={`mt-6 w-full py-3 font-bold rounded-xl text-white transition ${
                selectedProducts.length >= 2
                  ? "bg-rose-500 hover:bg-rose-600"
                  : "bg-rose-300 cursor-not-allowed"
              }`}
            >
              {loading ? "Đang so sánh..." : "So sánh"}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep(1)}
              className="text-sm text-pink-600 font-medium mb-4 hover:underline"
            >
              ← Quay lại chọn sản phẩm
            </button>

            {/* Thông tin cơ bản các sản phẩm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {productDetails.map((p) => {
                const priceCurrent = p.pricing?.current || null;
                const priceOriginal = p.pricing?.original || null;
                const rating = p.ratings?.average || 0;
                const ratingCount = p.ratings?.totalReviews || 0;
                const soldCount = p.totalSold || 0;

                const renderStars = (rate) => {
                  const stars = [];
                  const roundedRate = Math.round(rate);
                  for (let i = 1; i <= 5; i++) {
                    stars.push(
                      <span
                        key={i}
                        className={`inline-block text-lg ${
                          i <= roundedRate
                            ? "text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                        aria-label={
                          i <= roundedRate ? "star filled" : "star empty"
                        }
                      >
                        ★
                      </span>
                    );
                  }
                  return stars;
                };

                return (
                  <div
                    key={p.productId}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-rose-300 dark:border-rose-700 p-6 flex flex-col items-center"
                  >
                    <img
                      src={
                        p.images && p.images.length > 0
                          ? p.images[0]
                          : "/placeholder.png"
                      }
                      alt={p.name}
                      className="w-40 h-40 object-contain mb-4 rounded-lg border border-gray-300 dark:border-gray-600"
                    />

                    <h3 className="font-bold text-xl text-rose-600 dark:text-rose-400 text-center mb-2">
                      {p.name}
                    </h3>

                    <div className="mb-3 text-center">
                      {priceCurrent ? (
                        <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                          {priceCurrent.toLocaleString("vi-VN")} đ
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">
                          Không có giá
                        </span>
                      )}

                      {priceOriginal && priceOriginal > priceCurrent && (
                        <span className="ml-3 text-sm line-through text-gray-500 dark:text-gray-400">
                          {priceOriginal.toLocaleString("vi-VN")} đ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div>{renderStars(rating)}</div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({ratingCount} đánh giá)
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Đã bán:{" "}
                      <span className="font-medium">
                        {soldCount.toLocaleString("vi-VN")}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bảng so sánh thông số kỹ thuật */}
            <div className="overflow-auto rounded-lg border border-rose-300 dark:border-rose-700 shadow-md">
              <table className="w-full min-w-[600px] text-sm border-collapse text-left">
                <thead className="bg-rose-200 dark:bg-rose-700">
                  <tr>
                    <th className="p-3 border border-rose-300 dark:border-rose-600 text-rose-900 dark:text-rose-200 font-semibold">
                      Thông số
                    </th>
                    {productDetails.map((p) => (
                      <th
                        key={p.productId}
                        className="p-3 border border-rose-300 dark:border-rose-600 text-rose-900 dark:text-rose-200 font-semibold"
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productDetails.length > 0 &&
                    Object.keys(productDetails[0].specifications || {}).map(
                      (spec) => {
                        const specValues = productDetails.map((p) =>
                          p.specifications
                            ? p.specifications[spec]?.toString() || "-"
                            : "-"
                        );

                        const isDifferent =
                          new Set(specValues.filter((v) => v !== "-")).size > 1;

                        return (
                          <tr
                            key={spec}
                            className={`border-t border-rose-300 dark:border-rose-600 ${
                              isDifferent ? "bg-rose-100 dark:bg-rose-900" : ""
                            }`}
                          >
                            <td className="p-3 font-medium text-gray-800 dark:text-gray-300 border border-rose-300 dark:border-rose-600">
                              {spec}
                            </td>
                            {specValues.map((val, i) => (
                              <td
                                key={i}
                                className={`p-3 border border-rose-300 dark:border-rose-600 ${
                                  isDifferent
                                    ? "font-bold text-rose-600 dark:text-rose-400"
                                    : ""
                                }`}
                              >
                                <span className="dark:text-gray-300">
                                  {val}
                                </span>
                              </td>
                            ))}
                          </tr>
                        );
                      }
                    )}
                </tbody>
              </table>
            </div>

            {/* Đánh giá tổng quan */}
            {comparisonResult && (
              <div className="mt-8 p-6 bg-rose-50 dark:bg-rose-900 rounded-xl border border-rose-300 dark:border-rose-700 shadow-inner">
                <h4 className="text-xl font-bold text-rose-700 dark:text-rose-300 mb-4">
                  Đánh giá tổng quan
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-800 dark:text-gray-300">
                  {comparisonResult.products.map((p) => (
                    <li key={p.productId}>
                      <strong className="text-rose-600 dark:text-rose-400">
                        {p.name}:
                      </strong>{" "}
                      {comparisonResult.evaluations[p.productId] ||
                        "Chưa có đánh giá"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CompareProductsModal;
