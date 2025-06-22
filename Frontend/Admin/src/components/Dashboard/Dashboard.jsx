import React, { useState } from "react";
import StatCard from "./StatCard";
import { useNavigate } from "react-router-dom";
import useUsers from "../../hooks/Order/useUsers";

const Dashboard = ({ dashboards }) => {
  const navigate = useNavigate();
  const [showAllTopSelling, setShowAllTopSelling] = useState(false);
  const [showAllTopRated, setShowAllTopRated] = useState(false);
  const [showAllLowStock, setShowAllLowStock] = useState(false);
  const [showAllTop10OrdersByItems, setShowAllTop10OrdersByItems] =
    useState(false);
  const [showAllTop10OrdersByPrice, setShowAllTop10OrdersByPrice] =
    useState(false);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const toggleProductVariants = (productId) => {
    setExpandedProductId((prevId) => (prevId === productId ? null : productId));
  };
  const [modalImage, setModalImage] = useState(null);

  const { users, loading: loadingUsers } = useUsers();

  const userMap = users.reduce((acc, user) => {
    acc[user.id] = user.username;
    return acc;
  }, {});

  const handleShowMore = (section) => {
    if (section === "topSelling") setShowAllTopSelling(!showAllTopSelling);
    if (section === "topRated") setShowAllTopRated(!showAllTopRated);
    if (section === "lowStock") setShowAllLowStock(!showAllLowStock);
    if (section === "top10OrdersByItems")
      setShowAllTop10OrdersByItems(!showAllTop10OrdersByItems);
    if (section === "top10OrdersByPrice")
      setShowAllTop10OrdersByPrice(!showAllTop10OrdersByPrice);
  };

  return (
    <div className="container mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="grid grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Tổng Sản Phẩm"
          value={dashboards.totalProducts}
          className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/product-list")}
        />
        <StatCard
          title="Tổng Người Dùng"
          value={dashboards.totalUsers}
          className="bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/user-list")}
        />
        <StatCard
          title="Tổng Đơn Hàng"
          value={dashboards.totalOrders}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300 cursor-pointer"
          onClick={() => navigate("/order-list")}
        />
        <StatCard
          title="Tổng Doanh Thu"
          value={
            dashboards.totalRevenue >= 1000000000
              ? `~${(dashboards.totalRevenue / 1000000000)
                  .toFixed(1)
                  .replace(/\.0$/, "")} tỷ`
              : dashboards.totalRevenue >= 100000000
              ? `~${Math.floor(dashboards.totalRevenue / 1000000)} triệu`
              : new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(dashboards.totalRevenue)
          }
          className="bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
        />
      </div>

      <div className="mb-12 p-6 rounded-2xl bg-gray-100 dark:bg-gray-800/60  border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 drop-shadow-md">
          Top 10 Sản Phẩm Bán Chạy
        </h2>

        <div className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <table className="min-w-full border-collapse text-gray-900 dark:text-gray-100">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                <th className="px-4 py-2 text-left font-semibold">Hình Ảnh</th>
                <th className="px-4 py-2 text-left font-semibold">
                  Tên Sản Phẩm
                </th>
                <th className="px-4 py-2 text-left font-semibold">
                  Số Lượng Bán
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboards.topSellingProducts
                .sort((a, b) => b.totalSold - a.totalSold)
                .slice(
                  0,
                  showAllTopSelling ? dashboards.topSellingProducts.length : 4
                )
                .map((product, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded cursor-pointer"
                          onClick={() => setModalImage(product.images[0])}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">{product.totalSold}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          <button
            onClick={() => handleShowMore("topSelling")}
            className="text-blue-500 dark:text-blue-400 ml-4 mt-4"
          >
            {showAllTopSelling ? "Thu nhỏ" : "Xem thêm"}
          </button>
        </div>

        {modalImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setModalImage(null)}
          >
            <img
              src={modalImage}
              alt="Large view"
              className="max-w-full max-h-full rounded shadow-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-5 right-5 text-white text-3xl font-bold"
              onClick={() => setModalImage(null)}
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      <div className="mb-12 p-6 rounded-2xl bg-gray-100 dark:bg-gray-800/60  border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-teal-400 to-cyan-500 drop-shadow-md">
          Top 10 Sản Phẩm Đánh Giá Cao
        </h2>

        <div className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <table className="min-w-full border-collapse text-gray-900 dark:text-gray-100">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                <th className="px-4 py-2 text-left font-semibold">Hình Ảnh</th>
                <th className="px-4 py-2 text-left font-semibold">
                  Tên Sản Phẩm
                </th>
                <th className="px-4 py-2 text-left font-semibold">Đánh Giá</th>
              </tr>
            </thead>
            <tbody>
              {dashboards.topRatedProducts
                .sort(
                  (a, b) =>
                    (b.ratings?.average || 0) - (a.ratings?.average || 0)
                )
                .slice(
                  0,
                  showAllTopRated ? dashboards.topRatedProducts.length : 4
                )
                .map((product, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded cursor-pointer"
                          onClick={() => setModalImage(product.images[0])}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">
                      {isNaN(Number(product.ratings?.average))
                        ? "N/A"
                        : Number(product.ratings.average).toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <button
            onClick={() => handleShowMore("topRated")}
            className="text-blue-500 dark:text-blue-400 ml-4 mt-4"
          >
            {showAllTopRated ? "Thu nhỏ" : "Xem thêm"}
          </button>
        </div>

        {modalImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setModalImage(null)}
          >
            <img
              src={modalImage}
              alt="Large view"
              className="max-w-full max-h-full rounded shadow-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-5 right-5 text-white text-3xl font-bold"
              onClick={() => setModalImage(null)}
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      <div className="mb-12 p-6 rounded-2xl bg-gray-100 dark:bg-gray-800/60  border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 drop-shadow-md">
          Sản Phẩm Có Biến Thể Tồn Kho Dưới 10
        </h2>

        <div className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <table className="min-w-full border-collapse text-gray-900 dark:text-gray-100">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                <th className="px-4 py-2 text-left font-semibold">Hình Ảnh</th>
                <th className="px-4 py-2 text-left font-semibold">
                  Tên Sản Phẩm
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboards.lowStockProducts
                .slice(
                  0,
                  showAllLowStock ? dashboards.lowStockProducts.length : 4
                )
                .map((product) => {
                  const isExpanded = expandedProductId === product.id;

                  const columnMap = {
                    color: "Màu",
                    hexCode: "Mã màu",
                    size: "Kích thước",
                    ram: "RAM",
                    storage: "Storage",
                    condition: "Tình trạng",
                    stock: "Tồn kho",
                  };

                  const visibleColumns = Object.keys(columnMap).filter((key) =>
                    product.variants.some(
                      (v) =>
                        v[key] !== undefined && v[key] !== null && v[key] !== ""
                    )
                  );

                  return (
                    <React.Fragment key={product.id}>
                      <tr
                        className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => toggleProductVariants(product.id)}
                      >
                        <td className="px-4 py-2">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 relative group">
                          <span>{product.name}</span>
                          <span className="absolute left-3 -top-3 text-xs text-white bg-gray-800 px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                            Chi tiết các biến thể
                          </span>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-gray-50 dark:bg-gray-900">
                          <td
                            colSpan={visibleColumns.length}
                            className="px-4 py-2"
                          >
                            <div className="ml-4">
                              <p className="font-semibold mb-2">
                                Chi tiết các biến thể:
                              </p>

                              {product.variants.length > 0 && (
                                <table className="min-w-full text-sm border border-gray-300 dark:border-gray-700">
                                  <thead>
                                    <tr className="text-left bg-gray-100 dark:bg-gray-700">
                                      {visibleColumns.map((col) => (
                                        <th
                                          key={col}
                                          className="pr-4 py-1 px-2 font-medium"
                                        >
                                          {columnMap[col]}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {product.variants.map((variant, idx) => (
                                      <tr
                                        key={idx}
                                        className="border-t border-gray-300 dark:border-gray-700"
                                      >
                                        {visibleColumns.map((col) => (
                                          <td
                                            key={col}
                                            className="pr-4 py-1 px-2"
                                          >
                                            {variant[col]}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
          <button
            onClick={() => handleShowMore("lowStock")}
            className="text-blue-500 dark:text-blue-400 ml-4 mt-4"
          >
            {showAllLowStock ? "Thu nhỏ" : "Xem thêm"}
          </button>
        </div>
      </div>

      <div className="mb-12 p-6 rounded-2xl bg-gray-100 dark:bg-gray-800/60  border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 drop-shadow-md">
          Top 10 Đơn Hàng Có Tổng Số Lượng Cao Nhất
        </h2>

        <div className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <table className="min-w-full border-collapse text-gray-900 dark:text-gray-100">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                <th className="px-4 py-2 text-left font-semibold">
                  Mã đơn hàng
                </th>
                <th className="px-4 py-2 text-left font-semibold">Người đặt</th>
                <th className="px-4 py-2 text-left font-semibold">Số Lượng</th>
                <th className="px-4 py-2 text-left font-semibold">
                  Giá trị đơn hàng
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboards.top10OrdersByItems
                .slice(
                  0,
                  showAllTop10OrdersByItems
                    ? dashboards.top10OrdersByItems.length
                    : 4
                )
                .map((order, index) => (
                  <tr
                    key={order.orderId || index}
                    className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2">{order.orderId}</td>
                    <td className="px-4 py-2">
                      {loadingUsers
                        ? "Đang tải..."
                        : userMap[order.userId] || "Không rõ"}
                    </td>
                    <td className="px-4 py-2">{order.totalItems}</td>
                    <td className="px-4 py-2">
                      {order.finalPrice >= 1000000000
                        ? `~${(order.finalPrice / 1000000000)
                            .toFixed(1)
                            .replace(/\.0$/, "")} tỷ`
                        : order.finalPrice >= 100000000
                        ? `~${Math.floor(order.finalPrice / 1000000)} triệu`
                        : new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(order.finalPrice)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <button
            onClick={() => handleShowMore("top10OrdersByItems")}
            className="text-blue-500 dark:text-blue-400 ml-4 mt-4"
          >
            {showAllTop10OrdersByItems ? "Thu nhỏ" : "Xem thêm"}
          </button>
        </div>
      </div>

      <div className="mb-12 p-6 rounded-2xl bg-gray-100 dark:bg-gray-800/60  border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-fuchsia-500 drop-shadow-md">
          Top 10 Đơn Hàng Có Tổng Giá Trị Cao Nhất
        </h2>

        <div className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <table className="min-w-full border-collapse text-gray-900 dark:text-gray-100">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                <th className="px-4 py-2 text-left font-semibold">
                  Mã đơn hàng
                </th>
                <th className="px-4 py-2 text-left font-semibold">Người đặt</th>
                <th className="px-4 py-2 text-left font-semibold">Số Lượng</th>
                <th className="px-4 py-2 text-left font-semibold">
                  Giá trị đơn hàng
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboards.top10OrdersByPrice
                .slice(
                  0,
                  showAllTop10OrdersByPrice
                    ? dashboards.top10OrdersByPrice.length
                    : 4
                )
                .map((order, index) => (
                  <tr
                    key={order.orderId || index}
                    className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2">{order.orderId}</td>
                    <td className="px-4 py-2">
                      {loadingUsers
                        ? "Đang tải..."
                        : userMap[order.userId] || "Không rõ"}
                    </td>
                    <td className="px-4 py-2">{order.totalItems}</td>
                    <td className="px-4 py-2">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.finalPrice)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <button
            onClick={() => handleShowMore("top10OrdersByPrice")}
            className="text-blue-500 dark:text-blue-400 ml-4 mt-4"
          >
            {showAllTop10OrdersByPrice ? "Thu nhỏ" : "Xem thêm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
