import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Khi toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Đóng sidebar khi click ra ngoài
  const closeSidebar = (event) => {
    if (
      isSidebarOpen &&
      !event.target.closest("#sidebar") &&
      !event.target.closest("#menu-button")
    ) {
      setIsSidebarOpen(false);
    }
  };

  // Khi component mount, lấy trạng thái dark mode trong localStorage
  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode === "true") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Thêm hoặc xóa class "dark" khi isDarkMode thay đổi
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  useEffect(() => {
    document.addEventListener("click", closeSidebar);
    return () => {
      document.removeEventListener("click", closeSidebar);
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen relative overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300">
      <button
        id="menu-button"
        className="absolute top-4 left-4 p-2 bg-gray-800 text-white rounded shadow-lg md:hidden z-50"
        onClick={toggleSidebar}
      >
        ☰
      </button>

      <div
        id="sidebar"
        className={`fixed inset-y-0 left-0 w-48 bg-gray-900 text-white transition-transform transform z-40 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <Sidebar />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Truyền prop isDarkMode và setIsDarkMode cho Navbar để nó có thể hiện nút toggle */}
        <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
