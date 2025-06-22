import React from "react";
import Dashboard from "../../components/Dashboard/Dashboard";
import useDashboard from "../../hooks/Dashboard/useDashboard";

const DashboardPage = () => {
  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };
  const token = getUserToken();

  const { dashboards, isLoading, error } = useDashboard(token);

  if (isLoading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return <Dashboard dashboards={dashboards} />;
};

export default DashboardPage;
