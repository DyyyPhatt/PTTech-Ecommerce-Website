import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Navbar = ({ setCollapsed, collapsed, searchQuery, setSearchQuery }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return document.documentElement.classList.contains("dark");
  });

  const roleMapping = {
    ADMIN: "Quản trị viên",
    MANAGER: "Quản lý",
    CUSTOMER: "Khách hàng",
    CUSTOMER_SUPPORT: "Hỗ trợ khách hàng",
    INVENTORY_MANAGER: "Quản lý kho",
    MARKETING: "Chuyên viên marketing",
  };

  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

  const userToken = localStorage.getItem("userToken");

  let username, role;

  if (userToken) {
    try {
      const decodedToken = jwtDecode(userToken);
      username = decodedToken.sub;
      role = decodedToken.roles[0];
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  const roleName = roleMapping[role] || role;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 shadow-lg rounded-lg relative">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-2 md:hidden"
      >
        <svg
          className="w-6 h-6 text-gray-800 dark:text-gray-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>

      <button
        onClick={toggleDarkMode}
        className="ml-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m8.66-11h-1M4.34 12h-1m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.02 12.02l-.7-.7M6.34 17.66l-.7-.7M12 7a5 5 0 100 10 5 5 0 000-10z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            stroke="none"
          >
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </button>

      <div className="ml-auto relative">
        <button
          onClick={toggleDropdown}
          ref={avatarRef}
          className="w-10 h-10 rounded-full"
        >
          <img
            src="https://i.postimg.cc/153KnpPS/avatar-m-c-nh.jpg"
            alt="User"
            className="rounded-full"
          />
        </button>

        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-44 bg-white dark:bg-black rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
          >
            <div className="px-4 py-3 flex flex-col items-start justify-between">
              <div className="font-medium">{username}</div>
              <div className="truncate text-sm text-pink-500 mt-1">
                ({roleName})
              </div>
            </div>

            <div className="py-1">
              <Link
                to="/forgot-password"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              >
                Đổi mật khẩu
              </Link>
            </div>
            <div className="py-1">
              <Link
                to="/login"
                onClick={() => {
                  localStorage.clear();
                }}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              >
                Đăng xuất
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
