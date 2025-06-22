import { useState, useEffect } from "react";
import axios from "axios";

const useDashboard = (userToken) => {
  const [dashboards, setDashboards] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userToken) {
      setError("Token không hợp lệ.");
      setIsLoading(false);
      return;
    }

    const fetchDashboards = async () => {
      try {
        const axiosInstance = axios.create({
          baseURL: "http://localhost:8081/api",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        const topSellingResponse = await axiosInstance.get(
          "/products/top-selling"
        );
        const topRatedResponse = await axiosInstance.get("/products/top-rated");
        const lowStockResponse = await axiosInstance.get("/products/low-stock");
        const productsResponse = await axiosInstance.get("/products", {
          params: {
            sortBy: "name",
            sortOrder: "asc",
          },
        });
        const usersResponse = await axiosInstance.get("/users");
        const top10ItemsResponse = await axiosInstance.get(
          "/orders/top-10-items"
        );
        const top10PriceResponse = await axiosInstance.get(
          "/orders/top-10-price"
        );
        const statisticsResponse = await axiosInstance.get("/statistics");
        const statistics = statisticsResponse.data;
        const totalProducts = productsResponse.data.length;
        const totalUsers = usersResponse.data.length;
        const totalOrders = usersResponse.data.length;
        const totalRevenue = statistics.reduce((sum, item) => {
          return sum + (item.totalRevenue || 0);
        }, 0);

        const dashboardsData = {
          totalProducts: totalProducts,
          topSellingProducts: topSellingResponse.data,
          topRatedProducts: topRatedResponse.data,
          lowStockProducts: lowStockResponse.data,
          totalUsers: totalUsers,
          topUsersByRevenue: [
            { userName: "Nguyen Van A", totalRevenue: 10000 },
            { userName: "Tran Thi B", totalRevenue: 8000 },
          ],
          topUsersByOrders: [
            { userName: "Nguyen Van C", totalOrders: 50 },
            { userName: "Le Thi D", totalOrders: 45 },
          ],
          totalOrders: totalOrders,
          totalRevenue: totalRevenue,
          top10OrdersByItems: top10ItemsResponse.data,
          top10OrdersByPrice: top10PriceResponse.data,
        };

        setDashboards(dashboardsData);
      } catch (err) {
        setError("Không thể tải dữ liệu thống kê.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboards();
  }, [userToken]);

  return { dashboards, isLoading, error };
};

export default useDashboard;
