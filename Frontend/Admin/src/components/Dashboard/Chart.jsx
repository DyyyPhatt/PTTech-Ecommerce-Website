import React, { useRef, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Chart = ({ data, type }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.chartInstance;
      if (chartInstance) {
        chartInstance.destroy();
      }
    }
  }, [data]);

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label:
          type === "category"
            ? "Doanh Thu Theo Danh Mục"
            : "Doanh Thu Theo Sản Phẩm",
        data: Object.values(data).map((item) => item.revenue),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {type === "category" ? (
        <Bar ref={chartRef} data={chartData} />
      ) : (
        <Line ref={chartRef} data={chartData} />
      )}
    </div>
  );
};

export default Chart;
