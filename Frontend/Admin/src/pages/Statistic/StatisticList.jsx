import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import StatCard from "../../components/Dashboard/StatCard";
import StatisticListTable from "../../components/Statistic/StatisticListTable";
import StatisticChart from "../../components/Statistic/StatisticChart";

const StatisticList = () => {
  const [statistics, setStatistics] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalItemsSold, setTotalItemsSold] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [filterType, setFilterType] = useState("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [chartType, setChartType] = useState("line");

  const getUserToken = () => localStorage.getItem("userToken");

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const groupBy = (array, key) => {
    return array.reduce((result, currentValue) => {
      const groupKey = key(currentValue);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(currentValue);
      return result;
    }, {});
  };

  const aggregateGroupedData = (groupedData) => {
    return Object.entries(groupedData).map(([label, items]) => {
      return {
        id: items[0].id,
        label,
        date: items[0].date,
        totalOrders: items.reduce((sum, i) => sum + i.totalOrders, 0),
        totalItemsSold: items.reduce((sum, i) => sum + i.totalItemsSold, 0),
        totalRevenue: items.reduce((sum, i) => sum + i.totalRevenue, 0),
      };
    });
  };

  const fetchStatistics = useCallback(async () => {
    try {
      const token = getUserToken();
      const params = {};
      if (filterType !== "custom") {
        params.period = filterType;
      }

      const response = await axios.get("http://localhost:8081/api/statistics", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      let statisticsData = response.data;

      if (filterType === "custom" && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        statisticsData = statisticsData.filter(({ date }) => {
          const statDate = new Date(date);
          return !isNaN(statDate) && statDate >= start && statDate <= end;
        });
      }

      let grouped;
      if (filterType === "week") {
        grouped = groupBy(statisticsData, (item) => item.date.split("T")[0]);
      } else if (filterType === "month" || filterType === "quarter") {
        grouped = groupBy(statisticsData, (item) => {
          const date = new Date(item.date);
          const week = Math.ceil(date.getDate() / 7);
          return `Tuần ${week} - ${date.getMonth() + 1}/${date.getFullYear()}`;
        });
      } else if (filterType === "year") {
        grouped = groupBy(statisticsData, (item) => {
          const date = new Date(item.date);
          return `${date.getMonth() + 1}/${date.getFullYear()}`;
        });
      } else {
        grouped = groupBy(statisticsData, (item) => item.date);
      }

      const processedData = aggregateGroupedData(grouped);
      setStatistics(processedData);

      setTotalOrders(
        processedData.reduce((sum, stat) => sum + stat.totalOrders, 0)
      );
      setTotalItemsSold(
        processedData.reduce((sum, stat) => sum + stat.totalItemsSold, 0)
      );
      setTotalRevenue(
        processedData.reduce((sum, stat) => sum + stat.totalRevenue, 0)
      );
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  }, [filterType, customStartDate, customEndDate]);

  useEffect(() => {
    if (filterType !== "custom" || (customStartDate && customEndDate)) {
      fetchStatistics();
    }
  }, [filterType, customStartDate, customEndDate, fetchStatistics]);

  const handleExportExcel = async () => {
    try {
      const token = getUserToken();
      const params =
        filterType === "custom" && customStartDate && customEndDate
          ? {
              startDate: new Date(customStartDate).toISOString(),
              endDate: new Date(customEndDate).toISOString(),
            }
          : {
              period: filterType,
            };

      const response = await axios.get(
        "http://localhost:8081/api/statistics/export-excel",
        {
          params,
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "statistics.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting file:", error);
    }
  };

  return (
    <div className="mt-4 relative overflow-x-auto shadow-md sm:rounded-lg p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <StatCard
          title="Tổng Đơn Hàng"
          value={totalOrders}
          className="bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
        />
        <StatCard
          title="Tổng Sản Phẩm Bán Ra"
          value={totalItemsSold}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
        />
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(totalRevenue)}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
        />
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <select
          id="filter-type"
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="week">Theo Tuần</option>
          <option value="month">Theo Tháng</option>
          <option value="quarter">Theo Quý</option>
          <option value="year">Theo Năm</option>
          <option value="custom">Tùy chọn</option>
        </select>

        {filterType === "custom" && (
          <>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              max={customEndDate || ""}
              placeholder="Ngày bắt đầu"
            />
            <span>đến</span>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              min={customStartDate || ""}
              placeholder="Ngày kết thúc"
            />
          </>
        )}

        <select
          id="chart-type"
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ml-4"
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
        >
          <option value="line">Biểu đồ đường</option>
          <option value="bar">Biểu đồ cột</option>
        </select>

        <button
          type="button"
          onClick={handleExportExcel}
          className="text-white bg-pink-500 hover:bg-pink-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-auto"
        >
          Xuất file
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800  rounded-lg p-4 shadow-sm">
        <StatisticChart data={statistics} chartType={chartType} />
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
        <StatisticListTable statistics={statistics} />
      </div>
    </div>
  );
};

export default StatisticList;
