import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = [
  "#38bdf8",
  "#facc15",
  "#22d3ee",
  "#34d399",
  "#f87171",
  "#d946ef",
  "#a855f7",
];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#333"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={14}
      fontWeight="600"
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

const OrderStatusPieChart = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg mb-4 mt-4">
      <h2 className="text-center text-3xl font-extrabold mb-8 text-gray-900 dark:text-white tracking-wide">
        Thống kê trạng thái đơn hàng theo ngày hôm nay
      </h2>

      <div className="flex justify-center">
        <PieChart width={650} height={350}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={110}
            paddingAngle={6}
            dataKey="value"
            label={(props) => {
              const { cx, cy, midAngle, outerRadius, percent, name } = props;
              if (percent === 0) return null;

              const RADIAN = Math.PI / 180;
              const radius = outerRadius + 20;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              return (
                <text
                  x={x}
                  y={y}
                  fill="currentColor"
                  textAnchor={x > cx ? "start" : "end"}
                  dominantBaseline="central"
                  className="text-gray-900 dark:text-white font-semibold"
                  fontSize={14}
                  fontWeight="600"
                >
                  {`${name} (${(percent * 100).toFixed(0)}%)`}
                </text>
              );
            }}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => value.toLocaleString("vi-VN")}
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: 12,
              border: "1px solid #ddd",
              boxShadow: "0 3px 12px rgba(0,0,0,0.15)",
              padding: "12px",
              color: "#222",
              fontWeight: "700",
            }}
            wrapperStyle={{ color: "inherit" }}
          />
          <Legend
            verticalAlign="bottom"
            height={50}
            iconType="circle"
            wrapperStyle={{ marginTop: 20 }}
            formatter={(value) => (
              <span className="text-gray-700 dark:text-gray-200 font-semibold">
                {value}
              </span>
            )}
          />
        </PieChart>
      </div>
    </div>
  );
};

export default OrderStatusPieChart;
