import React, { useEffect, useState, useMemo } from "react";
import Breadcrumb from "../components/Breadcrumb";
import Cookies from "js-cookie";
import axios from "axios";
import {
  FaHome,
  FaChartBar,
  FaCoins,
  FaChartPie,
  FaClock,
  FaExclamationTriangle,
  FaLightbulb,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import useCategories from "../hooks/useCategories";
import { ToastContainer } from "react-toastify";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AA336A",
  "#7755AA",
  "#33AA77",
  "#4ADE80",
  "#F87171",
  "#60A5FA",
];

// Gán tên danh mục từ cây danh mục
const flattenCategories = (categories) => {
  const map = new Map();
  categories.forEach((parent) => {
    map.set(parent.id, parent.name);
    parent.children?.forEach((child) => {
      map.set(child.id, child.name);
    });
  });
  return map;
};

const SpendingAnalyticsPage = () => {
  const userId = Cookies.get("userId");
  const token = Cookies.get("accessToken");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { categories, loading: loadingCategories } = useCategories();
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:8081/api/orders/analytics/monthly-spending/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setData(res.data);
      } catch (err) {
        setError("Không thể tải dữ liệu thống kê.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAnalytics();
    } else {
      setError("Người dùng chưa đăng nhập.");
      setLoading(false);
    }
  }, [userId]);

  const categoryNameMap = useMemo(
    () => flattenCategories(categories),
    [categories]
  );

  const spendingByCategoryArray = useMemo(() => {
    if (!data?.spendingByCategory) return [];

    return Object.entries(data.spendingByCategory).map(
      ([categoryId, value], index) => ({
        category:
          categoryNameMap.get(categoryId) || `#${categoryId.slice(0, 6)}`,
        value,
        percent:
          data.spendingPercentByCategory?.[categoryId]?.toFixed(2) || "0",
        color: COLORS[index % COLORS.length],
      })
    );
  }, [
    data?.spendingByCategory,
    data?.spendingPercentByCategory,
    categoryNameMap,
  ]);

  const avgOrderValueArray = useMemo(() => {
    if (!data?.avgOrderValueByMonth) return [];
    return Object.entries(data.avgOrderValueByMonth).map(([month, value]) => ({
      month,
      value,
    }));
  }, [data?.avgOrderValueByMonth]);

  if (loading || loadingCategories)
    return (
      <p className="text-center mt-10 text-gray-700 dark:text-gray-300">
        Đang tải dữ liệu...
      </p>
    );
  if (error)
    return (
      <p className="text-center mt-10 text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  if (!data) return null;

  const visibleCategories = showAllCategories
    ? spendingByCategoryArray
    : spendingByCategoryArray.slice(0, 5);

  const {
    chartData,
    monthlyChangePercent,
    overLimitMonths,
    suggestions,
    avgDaysBetweenOrders,
  } = data;

  return (
    <>
      <ToastContainer />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/", icon: FaHome },
          { label: "Thống kê chi tiêu", href: "/analytics", icon: FaChartBar },
        ]}
      />

      <div className="bg-gray-100 dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
            Thống kê chi tiêu hàng tháng
          </h1>

          {/* Tổng chi tiêu theo tháng */}
          <section className="bg-gray-200 dark:bg-neutral-900 rounded-lg shadow-lg p-6 mb-8 transition-shadow hover:shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <FaCoins className="text-indigo-600 dark:text-indigo-400" />
              Tổng chi tiêu theo tháng
            </h2>
            {chartData.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">
                Không có dữ liệu chi tiêu.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <XAxis
                    dataKey="month"
                    stroke="#4B5563"
                    tick={{ fill: "#4B5563", fontWeight: "500" }}
                    tickLine={false}
                    axisLine={{ stroke: "#9CA3AF" }}
                    interval={0}
                    minTickGap={15}
                    style={{ fontSize: 14 }}
                    {...(document.documentElement.classList.contains("dark")
                      ? { stroke: "#D1D5DB", tick: { fill: "#D1D5DB" } }
                      : {})}
                  />
                  <YAxis
                    tickFormatter={(value) => {
                      if (value >= 1_000_000_000)
                        return `${(value / 1_000_000_000).toFixed(1)}T`;
                      if (value >= 1_000_000)
                        return `${(value / 1_000_000).toFixed(1)}Tr`;
                      if (value >= 1_000)
                        return `${(value / 1_000).toFixed(0)}k`;
                      return value;
                    }}
                    tick={{ fill: "#4B5563", fontWeight: "500" }}
                    tickLine={false}
                    axisLine={{ stroke: "#9CA3AF" }}
                    style={{ fontSize: 14 }}
                    {...(document.documentElement.classList.contains("dark")
                      ? { tick: { fill: "#D1D5DB" } }
                      : {})}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        document.documentElement.classList.contains("dark")
                          ? "#1F2937"
                          : "#FFFFFF",
                      borderRadius: "8px",
                      border: "none",
                      color: document.documentElement.classList.contains("dark")
                        ? "#D1D5DB"
                        : "#1F2937",
                    }}
                    labelStyle={{
                      color: document.documentElement.classList.contains("dark")
                        ? "#D1D5DB"
                        : "#1F2937",
                      fontWeight: 500,
                    }}
                    formatter={(value) =>
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(value)
                    }
                  />

                  <Legend
                    wrapperStyle={{ color: "inherit" }}
                    formatter={(value) => (
                      <span className="text-gray-900 dark:text-gray-100">
                        {value}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="totalSpending"
                    fill="#6366F1"
                    name="Tổng chi tiêu"
                    barSize={40}
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
            {monthlyChangePercent !== null && (
              <p className="mt-2 font-semibold text-gray-800 dark:text-gray-200">
                Thay đổi so với tháng trước:{" "}
                <span
                  className={
                    monthlyChangePercent >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {monthlyChangePercent.toFixed(2)}%
                </span>
              </p>
            )}
          </section>

          {/* Chi tiêu theo danh mục */}
          <section className="bg-gray-200 dark:bg-neutral-900 rounded-lg shadow-lg p-6 mb-8 transition-shadow hover:shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <FaChartPie className="text-green-600 dark:text-green-400" />
              Chi tiêu theo danh mục
            </h2>
            {spendingByCategoryArray.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">
                Không có dữ liệu danh mục.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={spendingByCategoryArray}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={({ category, percent }) =>
                      `${category}: ${(percent * 1).toFixed(1)}%`
                    }
                    labelLine={false}
                    fill="#22c55e"
                    stroke="none"
                    labelStyle={{
                      fill: "gray",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {spendingByCategoryArray.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        document.documentElement.classList.contains("dark")
                          ? "#1F2937"
                          : "#FFFFFF",
                      borderRadius: "8px",
                      border: "none",
                      color: document.documentElement.classList.contains("dark")
                        ? "#D1D5DB"
                        : "#1F2937",
                    }}
                    labelStyle={{
                      color: document.documentElement.classList.contains("dark")
                        ? "#D1D5DB"
                        : "#1F2937",
                      fontWeight: 500,
                    }}
                    formatter={(value) =>
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(value)
                    }
                  />
                  <Legend
                    wrapperStyle={{ color: "inherit" }}
                    formatter={(value) => (
                      <span className="text-gray-900 dark:text-gray-100">
                        {value}
                      </span>
                    )}
                    iconSize={14}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Bảng chi tiết danh mục */}
            <table className="w-full mt-6 text-left text-gray-700 dark:text-gray-300 border-collapse transition-colors duration-300">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700">
                  <th className="py-2 px-4">Danh mục</th>
                  <th className="py-2 px-4">Tổng chi (VND)</th>
                  <th className="py-2 px-4">% Tổng chi</th>
                </tr>
              </thead>
              <tbody>
                {visibleCategories.map(({ category, value, percent }) => (
                  <tr
                    key={category}
                    className="border-b border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-neutral-700 transition-colors duration-300 cursor-pointer"
                  >
                    <td className="py-2 px-4">{category}</td>
                    <td className="py-2 px-4">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(value)}
                    </td>
                    <td className="py-2 px-4">{percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Nút Xem thêm / Thu gọn */}
            {spendingByCategoryArray.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllCategories((prev) => !prev)}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {showAllCategories ? "Thu gọn ▲" : "Xem thêm ▼"}
                </button>
              </div>
            )}
          </section>

          {/* Giá trị trung bình đơn hàng theo tháng */}
          <section className="bg-gray-200 dark:bg-neutral-900 rounded-lg shadow-lg p-6 mb-8 transition-shadow hover:shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <FaClock className="text-yellow-500 dark:text-yellow-400" />
              Giá trị trung bình đơn hàng theo tháng
            </h2>
            {avgOrderValueArray.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">
                Không có dữ liệu.
              </p>
            ) : (
              <table className="w-full text-left text-gray-700 dark:text-gray-300 border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700">
                    <th className="py-2 px-4">Tháng</th>
                    <th className="py-2 px-4">Giá trị trung bình (VND)</th>
                  </tr>
                </thead>
                <tbody>
                  {avgOrderValueArray.map(({ month, value }) => (
                    <tr
                      key={month}
                      className="border-b border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                    >
                      <td className="py-2 px-4">{month}</td>
                      <td className="py-2 px-4">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Tần suất đặt hàng trung bình */}
          <section className="bg-gray-200 dark:bg-neutral-900 rounded-lg shadow-lg p-6 mb-8 transition-shadow hover:shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <FaClock className="text-yellow-500 dark:text-yellow-400" />
              Tần suất đặt hàng trung bình
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Trung bình mỗi{" "}
              <span className="font-semibold">{avgDaysBetweenOrders}</span> ngày
              bạn đặt 1 đơn hàng.
            </p>
          </section>

          {/* Cảnh báo tháng vượt hạn mức */}
          <section className="bg-gray-200 dark:bg-neutral-900 rounded-lg shadow-lg p-6 mb-8 transition-shadow hover:shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <FaExclamationTriangle className="text-red-600 dark:text-red-400" />
              Cảnh báo tháng vượt hạn mức{" "}
              <span className="text-sm text-red-600">(* Trên 10.000.000)</span>
            </h2>
            {overLimitMonths.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">
                Không có tháng nào vượt hạn mức chi tiêu.
              </p>
            ) : (
              <ul className="list-disc list-inside text-red-600 dark:text-red-400">
                {overLimitMonths.map((month) => (
                  <li key={month}>{month}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Gợi ý tiết kiệm */}
          <section className="bg-gray-200 dark:bg-neutral-900 rounded-lg shadow-lg p-6 mb-8 transition-shadow hover:shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <FaLightbulb className="text-teal-500 dark:text-teal-400" />
              Gợi ý tiết kiệm
            </h2>
            {typeof suggestions === "string" ? (
              (() => {
                const sugList = suggestions
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(
                    (s) =>
                      s.length > 0 &&
                      !s.toLowerCase().includes("gợi ý tiết kiệm")
                  ); // lọc bỏ tiêu đề nếu có

                return sugList.length === 0 ? (
                  <p className="text-gray-700 dark:text-gray-300">
                    Chưa có gợi ý tiết kiệm nào.
                  </p>
                ) : (
                  <ul className="list-disc list-inside text-green-700 dark:text-green-400">
                    {sugList.map((sug, idx) => (
                      <li key={idx}>{sug}</li>
                    ))}
                  </ul>
                );
              })()
            ) : Array.isArray(suggestions) && suggestions.length > 0 ? (
              <ul className="list-disc list-inside text-green-700 dark:text-green-400">
                {suggestions.map((sug, idx) => (
                  <li key={idx}>{sug}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 dark:text-gray-300">
                Chưa có gợi ý tiết kiệm nào.
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default SpendingAnalyticsPage;
