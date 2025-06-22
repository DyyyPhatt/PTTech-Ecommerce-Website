import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import {
  FaSearch,
  FaHeart,
  FaUser,
  FaShoppingCart,
  FaAngleDown,
  FaHistory,
  FaClipboardList,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaKey,
  FaMoon,
  FaSun,
  FaBug,
  FaBalanceScale,
} from "react-icons/fa";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/autoplay";
import Cookies from "js-cookie";
import useCategories from "../hooks/useCategories";
import usePromotions from "../hooks/usePromotions";
import useProducts from "../hooks/useProducts";
import useCart from "../hooks/useCart";
import SearchDropdown from "../components/SearchDropdown";
import { getGuestCartItemCount } from "../utils/cartUtils";
import ReportBugModal from "../components/Modal/ReportBugModal";
import useCreateReportBug from "../hooks/useCreateReportBug";
import { toast } from "react-toastify";
import CompareProductsModal from "./Modal/CompareProductsModal";

const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [inlineSuggestion, setInlineSuggestion] = useState("");
  const [suggestedProduct, setSuggestedProduct] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownResults, setDropdownResults] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const navigate = useNavigate();
  const userId = Cookies.get("userId");
  const isLoggedIn = !!Cookies.get("accessToken");
  const { cart, fetchCart } = useCart(userId);

  const { searchProductsByName, searchResults, searchLoading, searchError } =
    useProducts();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const {
    promotions,
    loading: promotionsLoading,
    error: promotionsError,
  } = usePromotions();

  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  }, []);

  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const { createReport, loading, error, report } = useCreateReportBug();

  const handleOpenBugModal = () => setIsBugModalOpen(true);
  const handleCloseBugModal = () => setIsBugModalOpen(false);

  const handleSubmitBugReport = async (
    bugType,
    description,
    images,
    videos,
    email
  ) => {
    try {
      await createReport({
        bugType,
        description,
        email,
        imageFiles: images,
        videoFiles: videos,
      });
      handleCloseBugModal();
      toast.success("Báo lỗi đã được gửi thành công!");
    } catch (err) {
      toast.error("Gửi báo lỗi thất bại. Vui lòng thử lại.");
    }
  };

  const handleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleSearch = () => {
    if (searchKeyword.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchKeyword.trim())}`);
      setSearchKeyword("");
      setShowDropdown(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("userId");
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    navigate("/login");
    console.log("Đăng xuất thành công!");
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchKeyword.trim());
    }, 500);

    return () => clearTimeout(handler);
  }, [searchKeyword]);

  useEffect(() => {
    if (debouncedKeyword === "") {
      setDropdownResults([]);
      setShowDropdown(false);
      return;
    }

    const fetchResults = async () => {
      try {
        await searchProductsByName(debouncedKeyword, {});
      } catch (error) {
        console.error(error);
        setDropdownResults([]);
        setShowDropdown(false);
      }
    };

    fetchResults();
  }, [debouncedKeyword]);

  useEffect(() => {
    if (debouncedKeyword === "") {
      setDropdownResults([]);
      setShowDropdown(false);
      return;
    }

    if (searchLoading) {
      setShowDropdown(true);
      return;
    }

    if (Array.isArray(searchResults)) {
      setDropdownResults(searchResults);
      setShowDropdown(true);
    } else {
      setDropdownResults([]);
      setShowDropdown(false);
    }
  }, [searchResults, searchLoading, debouncedKeyword]);

  useEffect(() => {
    if (
      debouncedKeyword &&
      Array.isArray(searchResults) &&
      searchResults.length > 0
    ) {
      const matchingProduct = searchResults.find((p) =>
        p.name.toLowerCase().includes(debouncedKeyword.toLowerCase())
      );

      if (matchingProduct) {
        setSuggestedProduct(matchingProduct);
        const name = matchingProduct.name;
        const keywordIndex = name
          .toLowerCase()
          .indexOf(debouncedKeyword.toLowerCase());

        if (keywordIndex !== -1) {
          const suggestionAfterKeyword = name.slice(
            keywordIndex + debouncedKeyword.length
          );
          setInlineSuggestion(suggestionAfterKeyword);
        } else {
          setInlineSuggestion("");
        }
      } else {
        setSuggestedProduct(null);
        setInlineSuggestion("");
      }
    } else {
      setSuggestedProduct(null);
      setInlineSuggestion("");
    }
  }, [searchResults, debouncedKeyword]);

  useEffect(() => {
    const updateCount = () => {
      if (isLoggedIn) {
        fetchCart();
        setCartCount(cart?.totalItems);
      } else {
        const count = getGuestCartItemCount();
        setCartCount(count);
      }
    };

    updateCount();

    window.addEventListener("guest_cart_updated", updateCount);
    return () => window.removeEventListener("guest_cart_updated", updateCount);
  }, [isLoggedIn, cart, fetchCart]);

  return (
    <header className="w-full bg-[#d70018] dark:bg-[#1a1a1a] shadow-md">
      <div className="bg-[#fff0f2] dark:bg-[#2c2c2c]">
        {promotionsLoading ? (
          <svg
            aria-hidden="true"
            role="status"
            className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="#1C64F2"
            />
          </svg>
        ) : promotionsError ? (
          <div className="text-center py-2 text-white">{promotionsError}</div>
        ) : (
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={true}
            className="w-full"
          >
            {promotions.map((promo, index) => (
              <SwiperSlide key={index}>
                <div className="text-center py-2 text-[#900c1b] dark:text-[#ffb3b3]">
                  <h3>{promo.title}</h3>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-12">
            <div className="flex items-center">
              <Link
                to="/"
                className="text-white dark:text-[#e5e5e5] hover:text-[#ffd500] dark:hover:text-[#ffe066] text-2xl font-medium"
              >
                PTTechShop
              </Link>
            </div>

            <div className="hidden md:flex relative z-50">
              {/* Inline suggestion hiển thị mờ phía sau input */}
              {inlineSuggestion && searchKeyword && (
                <div
                  className="absolute inset-0 px-4 py-2 text-gray-400 pointer-events-none select-none overflow-hidden whitespace-nowrap overflow-ellipsis"
                  style={{ maxWidth: "100%" }}
                >
                  {/* Giữ khoảng trắng cho từ khóa để căn chỉnh */}
                  <span className="invisible">{searchKeyword}</span>
                  {/* Hiển thị phần gợi ý nằm ngay sau từ khóa */}
                  <span>{inlineSuggestion}</span>
                </div>
              )}

              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  } else if (e.key === "Tab" && suggestedProduct) {
                    e.preventDefault();
                    setSearchKeyword(suggestedProduct.name);
                    setInlineSuggestion("");
                    setShowDropdown(false);
                  }
                }}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-96 px-4 py-2 border border-[#ffc1c8] dark:border-[#444] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff596c] dark:focus:ring-[#ff8ea1]"
                autoComplete="off"
              />

              <button
                onClick={handleSearch}
                className="absolute right-3 top-2.5 text-[#500009] hover:text-[#ffd500]"
              >
                <FaSearch size={20} />
              </button>

              {/* Dropdown kết quả tìm kiếm */}
              <SearchDropdown
                showDropdown={showDropdown}
                searchLoading={searchLoading}
                searchError={searchError}
                dropdownResults={dropdownResults}
                onClose={() => setShowDropdown(false)}
              />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="relative group w-fit mx-auto">
              <button
                onClick={toggleTheme}
                className="text-white dark:text-[#e5e5e5] hover:text-[#ffd500] dark:hover:text-[#ffe066]"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <FaSun size={22} /> : <FaMoon size={22} />}
              </button>
              <div className="absolute bottom-[-45px] left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
              </div>
            </div>

            <div className="relative group w-fit mx-auto">
              <button
                onClick={handleOpenBugModal}
                className="text-white dark:text-[#e5e5e5] hover:text-[#ffd500] dark:hover:text-[#ffe066]"
                aria-label="Báo lỗi"
                disabled={loading}
              >
                <FaBug size={22} />
              </button>
              <div className="absolute bottom-[-45px] left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Báo lỗi hệ thống
              </div>
            </div>

            <Link to="/viewed-history">
              <div className="relative group w-fit mx-auto">
                <button className="text-white dark:text-[#e5e5e5] hover:text-[#ffd500] dark:hover:text-[#ffe066]">
                  <FaHistory size={24} />
                </button>
                <div className="absolute bottom-[-45px] left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Sản phẩm đã xem
                </div>
              </div>
            </Link>

            <Link to="/favorites">
              <div className="relative group w-fit mx-auto">
                <button className="text-white dark:text-[#e5e5e5] hover:text-[#ffd500] dark:hover:text-[#ffe066]">
                  <FaHeart size={24} />
                </button>
                <div className="absolute bottom-[-45px] left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Sản phẩm yêu thích
                </div>
              </div>
            </Link>

            <div className="relative group w-fit mx-auto">
              <button
                onClick={() => setCompareModalOpen(true)}
                className="text-white dark:text-[#e5e5e5] hover:text-[#ffd500] dark:hover:text-[#ffe066]"
                aria-label="So sánh sản phẩm"
              >
                <FaBalanceScale size={22} />
              </button>
              <div className="absolute bottom-[-45px] left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                So sánh sản phẩm
              </div>
            </div>

            <div className="relative">
              <button
                className="flex items-center text-white hover:text-[#ffd500]"
                onClick={handleUserDropdown}
                aria-expanded={isUserDropdownOpen}
                aria-haspopup="true"
              >
                <FaUser size={24} />
                <FaAngleDown className="ml-1" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#3c3c3c] rounded-md shadow-lg py-1 z-50">
                  {isLoggedIn ? (
                    <>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-[#900c1b] dark:text-[#ffb3b3] hover:bg-[#ffc1c8] dark:hover:bg-[#3b0009] flex items-center space-x-2"
                      >
                        <FaUser size={16} />
                        <span>Tài khoản của tôi</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-[#900c1b] dark:text-[#ffb3b3] hover:bg-[#ffc1c8] dark:hover:bg-[#3b0009] flex items-center space-x-2"
                      >
                        <FaClipboardList size={16} />
                        <span>Đơn hàng của tôi</span>
                      </Link>
                      <Link
                        to="/monthly-spending"
                        className="block px-4 py-2 text-sm text-[#900c1b] dark:text-[#ffb3b3] hover:bg-[#ffc1c8] dark:hover:bg-[#3b0009] flex items-center space-x-2"
                      >
                        <TbBrandGoogleAnalytics size={16} />
                        <span>Thống kê hàng tháng</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-[#900c1b] dark:text-[#ffb3b3] hover:bg-[#ffc1c8] dark:hover:bg-[#3b0009] flex items-center space-x-2"
                      >
                        <FaSignOutAlt size={16} />
                        <span>Đăng xuất</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-[#900c1b] dark:text-[#ffb3b3] hover:bg-[#ffc1c8] dark:hover:bg-[#3b0009] flex items-center space-x-2"
                      >
                        <FaSignInAlt size={16} />
                        <span>Đăng nhập</span>
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-[#900c1b] dark:text-[#ffb3b3] hover:bg-[#ffc1c8] dark:hover:bg-[#3b0009] flex items-center space-x-2"
                      >
                        <FaUserPlus size={16} />
                        <span>Đăng ký</span>
                      </Link>
                      <Link
                        to="/forgot-password"
                        className="block px-4 py-2 text-sm text-[#900c1b] dark:text-[#ffb3b3] hover:bg-[#ffc1c8] dark:hover:bg-[#3b0009] flex items-center space-x-2"
                      >
                        <FaKey size={16} />
                        <span>Quên mật khẩu</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link to="/cart">
              <div className="relative group w-fit mx-auto">
                <button className="text-white dark:text-[#e5e5e5] hover:text-[#ffd500] dark:hover:text-[#ffe066] relative">
                  <FaShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-3 -right-4 bg-[#ffdde1] text-[#500009] dark:bg-[#4d1a1a] dark:text-[#ffb3b3] rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cartCount}
                    </span>
                  )}
                </button>
                <div className="absolute bottom-[-45px] left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Giỏ hàng
                </div>
              </div>
            </Link>
          </div>

          {isBugModalOpen && (
            <ReportBugModal
              onClose={handleCloseBugModal}
              onSubmit={handleSubmitBugReport}
              loading={loading}
            />
          )}

          <CompareProductsModal
            isOpen={compareModalOpen}
            onClose={() => setCompareModalOpen(false)}
          />

          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div className="container mx-auto px-4">
          {categoriesLoading ? (
            <svg
              aria-hidden="true"
              role="status"
              className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="#1C64F2"
              />
            </svg>
          ) : categoriesError ? (
            <div className="text-center text-white py-2">{categoriesError}</div>
          ) : (
            <nav className="hidden md:block border-t border-[#ffc1c8]">
              <ul className="flex justify-center space-x-8 py-4 relative">
                <li>
                  <Link
                    to={`/products`}
                    className="text-white dark:text-[#e5e5e5] hover:text-[#ffd500] dark:hover:text-[#ffe066] font-medium"
                  >
                    Tất cả sản phẩm
                  </Link>
                </li>

                {categories
                  .filter((category) => !category.parentCategoryId)
                  .map((category) => (
                    <li key={category.id} className="relative group">
                      <Link
                        to={`/category/${category.name}`}
                        className="text-white dark:text-[#e5e5e5] hover:text-[#ffd500] dark:hover:text-[#ffe066] font-medium"
                      >
                        {category.name}
                      </Link>

                      {category.children && category.children.length > 0 && (
                        <div className="absolute left-0 mt-2 z-50 w-max hidden group-hover:block dropdown-container">
                          <ul className="bg-white dark:bg-[#1f1f1f] border dark:border-gray-700 border-gray-200 rounded-lg shadow-lg min-w-[180px] py-2">
                            {category.children.map((child) => (
                              <li key={child.id}>
                                <Link
                                  to={`/category/${child.name}`}
                                  className="block px-4 py-2 text-sm text-[#900c1b] dark:text-[#ffb3b3] hover:bg-[#ffc1c8] dark:hover:bg-[#3b0009] transition duration-200"
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
              </ul>
            </nav>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#ff263e] border-t border-[#ffc1c8]">
          <div className="px-4 py-2">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full px-4 py-2 border border-[#ffc1c8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff596c]"
            />
          </div>
          <nav className="px-4 py-2">
            <ul className="space-y-2">
              <li>
                <Link
                  to={`/products`}
                  className="text-white dark:text-[#e5e5e5] hover:text-[#ffd500] dark:hover:text-[#ffe066] font-medium"
                >
                  Tất cả sản phẩm
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/category/${category.name}`}
                    className="text-white dark:text-[#e5e5e5] hover:text-[#ffd500] dark:hover:text-[#ffe066] font-medium"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex justify-around py-4 border-t border-[#ffc1c8]">
            <Link to="/viewed-history">
              <div className="relative group w-fit mx-auto">
                <button className="text-white dark:text-[#e5e5e5] hover:text-[#ffd500] dark:hover:text-[#ffe066]">
                  <FaHistory size={24} />
                </button>
                <div className="absolute bottom-[-45px] left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Sản phẩm đã xem
                </div>
              </div>
            </Link>

            <Link to="/favorites">
              <div className="relative group w-fit mx-auto">
                <button className="text-white dark:text-[#e5e5e5] hover:text-[#ffd500] dark:hover:text-[#ffe066]">
                  <FaHeart size={24} />
                </button>
                <div className="absolute bottom-[-45px] left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Sản phẩm yêu thích
                </div>
              </div>
            </Link>

            <div className="relative">
              <button
                className="flex items-center text-white hover:text-[#ffd500]"
                onClick={handleUserDropdown}
                aria-expanded={isUserDropdownOpen}
                aria-haspopup="true"
              >
                <FaUser size={24} />
                <FaAngleDown className="ml-1" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#3c3c3c] rounded-md shadow-lg py-1 z-50">
                  {isLoggedIn ? (
                    <>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-[#900c1b] dark:text-[#ffb3b3] hover:bg-[#ffc1c8] dark:hover:bg-[#3b0009] flex items-center space-x-2"
                      >
                        <FaUser size={16} />
                        <span>Tài khoản của tôi</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-[#900c1b] dark:text-[#ffb3b3] hover:bg-[#ffc1c8] dark:hover:bg-[#3b0009] flex items-center space-x-2"
                      >
                        <FaClipboardList size={16} />
                        <span>Đơn hàng của tôi</span>
                      </Link>
                      <Link
                        to="/monthly-spending"
                        className="block px-4 py-2 text-sm text-[#900c1b] dark:text-[#ffb3b3] hover:bg-[#ffc1c8] dark:hover:bg-[#3b0009] flex items-center space-x-2"
                      >
                        <TbBrandGoogleAnalytics size={16} />
                        <span>Thống kê hàng tháng</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-[#900c1b] hover:bg-[#ffc1c8] flex items-center space-x-2"
                      >
                        <FaSignOutAlt size={16} />
                        <span>Đăng xuất</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-[#900c1b] dark:text-[#ffb3b3] hover:bg-[#ffc1c8] dark:hover:bg-[#3b0009] flex items-center space-x-2"
                      >
                        <FaSignInAlt size={16} />
                        <span>Đăng nhập</span>
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-[#900c1b] dark:text-[#ffb3b3] hover:bg-[#ffc1c8] dark:hover:bg-[#3b0009] flex items-center space-x-2"
                      >
                        <FaUserPlus size={16} />
                        <span>Đăng ký</span>
                      </Link>
                      <Link
                        to="/forgot-password"
                        className="block px-4 py-2 text-sm text-[#900c1b] dark:text-[#ffb3b3] hover:bg-[#ffc1c8] dark:hover:bg-[#3b0009] flex items-center space-x-2"
                      >
                        <FaKey size={16} />
                        <span>Quên mật khẩu</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link to="/cart">
              <div className="relative group w-fit mx-auto">
                <button className="text-white dark:text-[#e5e5e5] hover:text-[#ffd500] dark:hover:text-[#ffe066] relative">
                  <FaShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-3 -right-4 bg-[#ffdde1] text-[#500009] dark:bg-[#4d1a1a] dark:text-[#ffb3b3] rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cartCount}
                    </span>
                  )}
                </button>
                <div className="absolute bottom-[-45px] left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Giỏ hàng
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
