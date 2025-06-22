import React, { useMemo } from "react";
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";

const StatisticChart = ({ data, chartType }) => {
  const formattedData = useMemo(() => {
    return [...data]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item) => ({
        ...item,
        date: format(new Date(item.date), "dd/MM/yyyy"),
      }));
  }, [data]);

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart data={formattedData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={(value) => value.toLocaleString("vi-VN")}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "Doanh thu") {
                  return [`${value.toLocaleString("vi-VN")} ₫`, name];
                }
                if (name === "Tổng đơn hàng") {
                  return [`${value.toLocaleString("vi-VN")} đơn`, name];
                }
                if (name === "Sản phẩm bán ra") {
                  return [`${value.toLocaleString("vi-VN")} sp`, name];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="totalRevenue" name="Doanh thu" fill="#FFBB28" />
            <Bar dataKey="totalOrders" name="Tổng đơn hàng" fill="#00C49F" />
            <Bar
              dataKey="totalItemsSold"
              name="Sản phẩm bán ra"
              fill="#8884d8"
            />
          </BarChart>
        );
      case "line":
      default:
        return (
          <LineChart data={formattedData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={(value) => value.toLocaleString("vi-VN")}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "Doanh thu") {
                  return [`${value.toLocaleString("vi-VN")} ₫`, name];
                }
                if (name === "Tổng đơn hàng") {
                  return [`${value.toLocaleString("vi-VN")} đơn`, name];
                }
                if (name === "Sản phẩm bán ra") {
                  return [`${value.toLocaleString("vi-VN")} sp`, name];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalRevenue"
              name="Doanh thu"
              stroke="#FFBB28"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="totalOrders"
              name="Tổng đơn hàng"
              stroke="#00C49F"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="totalItemsSold"
              name="Sản phẩm bán ra"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

export default StatisticChart;
