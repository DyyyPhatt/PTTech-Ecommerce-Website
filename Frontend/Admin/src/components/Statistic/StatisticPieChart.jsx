import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AA336A",
  "#663399",
];

const StatisticPieChart = ({ data }) => {
  const pieData = data.map((item) => ({
    name: item.name || "Không tên",
    value: item.totalOrders || 0,
  }));

  return (
    <div
      style={{ width: "100%", height: 300, maxWidth: 500, margin: "0 auto" }}
    >
      <h3 style={{ textAlign: "center", marginBottom: 16 }}>
        Biểu đồ tròn Tổng đơn hàng theo sản phẩm
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => value.toLocaleString("vi-VN")} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatisticPieChart;
