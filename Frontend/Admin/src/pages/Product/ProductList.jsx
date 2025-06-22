import React, { useState, useEffect, useRef } from "react";
import ProductListTable from "../../components/Product/ProductListTable";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useProductSearch from "../../hooks/Product/useProductSearch";
import { FaExclamationTriangle, FaCheck, FaTimes } from "react-icons/fa";
import StatCard from "../../components/Dashboard/StatCard";

const ProductList = () => {
  const {
    searchQuery,
    handleSearchChange,
    searchHistory,
    showHistory,
    handleFocus,
    handleBlur,
  } = useProductSearch();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [filterOption, setFilterOption] = useState("all-A-Z");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [brandsData, setBrandsData] = useState([]);
  const filterRef = useRef(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importMessage, setImportMessage] = useState("");

  const [actionType, setActionType] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const userToken = localStorage.getItem("userToken");

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8081/api",
    headers: {
      Authorization: userToken ? `Bearer ${userToken}` : "",
    },
  });

  const showToastMessage = (message) => {
    setShowSuccessMessage({ success: true, message });
    setTimeout(
      () => setShowSuccessMessage({ success: false, message: "" }),
      3000
    );
  };

  const [showSuccessMessage, setShowSuccessMessage] = useState({
    success: false,
    message: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allIds = sortedProducts.map((product) => product.id);
      setSelectedProductIds(allIds);
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    try {
      const productToDelete = products.find((product) => product.id === id);

      if (productToDelete && productToDelete.images) {
        for (let imageUrl of productToDelete.images) {
          await axiosInstance.delete(`/products/delete-image/${id}`, {
            params: { imageUrl: imageUrl },
          });
          console.log("Hình ảnh sản phẩm đã được xóa thành công.");
        }
      }

      if (productToDelete && productToDelete.videos) {
        for (let videoUrl of productToDelete.videos) {
          await axiosInstance.delete(`/products/delete-video/${id}`, {
            params: { videoUrl: videoUrl },
          });
          console.log("Video sản phẩm đã được xóa thành công.");
        }
      }

      await axiosInstance.delete(`/products/${id}`);

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== id)
      );

      showToastMessage("Sản phẩm đã được xóa thành công!");
    } catch (error) {
      console.error("Error deleting product or its media:", error);
      showToastMessage("Xóa sản phẩm không thành công!");
    }
  };

  const handleToggleVisibility = async (id, isActive) => {
    try {
      const endpoint = isActive
        ? `/products/hide/${id}`
        : `/products/show/${id}`;

      await axiosInstance.put(endpoint);

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id
            ? { ...product, status: isActive ? "inactive" : "active" }
            : product
        )
      );

      setShowSuccessMessage({
        success: true,
        message: isActive
          ? "Ẩn Sản phẩm thành công."
          : "Hiện Sản phẩm thành công.",
      });

      setTimeout(
        () => setShowSuccessMessage({ success: false, message: "" }),
        3000
      );
    } catch (error) {
      console.error("Error toggling product visibility:", error);
    }
  };

  const handleConfirmYes = () => {
    if (actionType === "delete") {
      handleDelete(selectedProductId);
    } else if (actionType === "toggle") {
      const product = products.find(
        (product) => product.id === selectedProductId
      );
      const isActive = product?.status === "active";
      handleToggleVisibility(selectedProductId, isActive);
    } else if (actionType === "batch-delete") {
      handleBatchDelete();
    } else if (actionType === "batch-toggle") {
      handleBatchToggleVisibility();
    }

    setShowConfirmModal(false);
  };

  const handleConfirmNo = () => {
    setShowConfirmModal(false);
  };

  const handleBatchDelete = async () => {
    for (const id of selectedProductIds) {
      await handleDelete(id);
    }
    setSelectedProductIds([]);
  };

  const handleBatchToggleVisibility = async () => {
    const selectedProducts = products.filter((product) =>
      selectedProductIds.includes(product.id)
    );
    for (const product of selectedProducts) {
      const isActive = product.status === "active";
      await handleToggleVisibility(product.id, isActive);
    }
    setSelectedProductIds([]);
  };

  const navigate = useNavigate();

  const toggleFilter = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const token = getUserToken();
      const response = await axios.get(
        "http://localhost:8081/api/products?sortBy=name&sortOrder=asc",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const productsData = response.data;
      setProducts(productsData);

      const categoriesResponse = await axios.get(
        "http://localhost:8081/api/categories"
      );
      setCategoriesData(categoriesResponse.data);

      const brandsResponse = await axios.get(
        "http://localhost:8081/api/brands"
      );
      setBrandsData(brandsResponse.data);

      const uniqueCategories = [
        ...new Set(productsData.map((product) => product.categoryId)),
      ];
      setCategories(["all", ...uniqueCategories]);

      const uniqueBrands = [
        ...new Set(productsData.map((product) => product.brandId)),
      ];
      setBrands(["all", ...uniqueBrands]);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const searchedProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = () => {
    navigate("/add-product");
  };

  const handleAddProductSchedule = () => {
    navigate("/add-product-schedule");
  };

  const handleOpenImportModal = () => {
    setShowImportModal(true);
    setImportMessage("");
    setImportFile(null);
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportMessage("");
    setImportFile(null);
  };

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0]);
  };

  const handleImportExcel = async () => {
    if (!importFile) {
      setImportMessage("Vui lòng chọn file Excel để import.");
      return;
    }

    try {
      const token = getUserToken();
      const formData = new FormData();
      formData.append("file", importFile);

      const response = await axios.post(
        "http://localhost:8081/api/products/import-excel",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setImportMessage(response.data || "Import thành công.");
      setImportFile(null);
      setShowImportModal(false);

      const refreshed = await axios.get(
        "http://localhost:8081/api/products?sortBy=name&sortOrder=asc",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProducts(refreshed.data);
      setImportMessage(response.data || "Import thành công.");
      setImportFile(null);
      setShowImportModal(false);
      setShowSuccessMessage({
        success: true,
        message: "Import sản phẩm thành công!",
      });
      setTimeout(() => {
        setShowSuccessMessage({ success: false, message: "" });
      }, 3000);
    } catch (error) {
      setImportMessage(error?.response?.data || "Lỗi khi import file Excel.");
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = getUserToken();
      const response = await axios.get(
        "http://localhost:8081/api/products/export-excel",
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "produtcs.xlsx";
      link.click();
    } catch (error) {
      console.error("Error exporting file:", error);
    }
  };

  const totalProducts = products.length;
  const totalVisible = products.filter(
    (product) => product.status === "active"
  ).length;
  const totalHidden = products.filter(
    (product) => product.status === "inactive"
  ).length;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const filteredProducts = searchedProducts.filter((product) => {
    if (filterOption === "active") {
      return product.status;
    }
    if (filterOption === "inactive") {
      return !product.status;
    }
    if (filterOption === "coming soon") {
      return product.status;
    }
    if (filterOption === "out of stock") {
      return product.status;
    }
    return true;
  });

  const categoryFilteredProducts = filteredProducts.filter((product) => {
    if (selectedCategory === "all") {
      return true;
    }
    return product.categoryId === selectedCategory;
  });

  const brandFilteredProducts = categoryFilteredProducts.filter((product) => {
    if (selectedBrand === "all") {
      return true;
    }
    return product.brandId === selectedBrand;
  });

  const sortedProducts = brandFilteredProducts.sort((a, b) => {
    if (
      filterOption === "all-A-Z" ||
      filterOption === "active-A-Z" ||
      filterOption === "inactive-A-Z"
    ) {
      return a.name.localeCompare(b.name);
    }
    if (
      filterOption === "all-Z-A" ||
      filterOption === "active-Z-A" ||
      filterOption === "inactive-Z-A"
    ) {
      return b.name.localeCompare(a.name);
    }
    if (filterOption === "price-asc") {
      return a.pricing.current - b.pricing.current;
    }
    if (filterOption === "price-desc") {
      return b.pricing.current - a.pricing.current;
    }
    return 0;
  });

  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const getPageNumbers = (currentPage, totalPages) => {
    const pageNumbers = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      if (currentPage > 3) {
        pageNumbers.push("left-ellipsis");
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push("right-ellipsis");
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <>
      {showSuccessMessage.success && (
        <div
          id="toast-success"
          className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:text-gray-400 dark:bg-gray-800"
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
            <span className="sr-only">Check icon</span>
          </div>
          <div className="ms-3 text-sm font-normal dark:text-white">
            {showSuccessMessage.message}
          </div>
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={() =>
              setShowSuccessMessage({ success: false, message: "" })
            }
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
      )}

      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={handleConfirmNo}
        >
          <div
            className="relative bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-lg border-t-4 border-yellow-400 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-yellow-100 p-4 rounded-full mb-4">
                <FaExclamationTriangle className="text-yellow-500 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Xác nhận hành động
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Bạn có chắc chắn muốn thực hiện hành động này không? Hành động
                không thể hoàn tác.
              </p>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleConfirmYes}
                className="px-6 py-3 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition duration-200 flex items-center gap-2 shadow-lg"
              >
                <FaCheck />
                Có, tiếp tục
              </button>
              <button
                onClick={handleConfirmNo}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition duration-200 flex items-center gap-2 shadow-lg"
              >
                <FaTimes />
                Không, hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <button
              onClick={handleCloseImportModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex flex-col items-center mb-5">
              <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full p-3 mb-3">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white text-center">
                Import sản phẩm từ Excel
              </h2>
              <p className="text-sm text-gray-500 dark:text-white text-center mt-1">
                Chọn file định dạng .xlsx hoặc .xls để tải sản phẩm lên hệ
                thống.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                File Excel
              </label>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-green-500 focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900 dark:file:text-green-400 dark:hover:file:bg-green-800"
              />
            </div>

            {importMessage && (
              <p className="text-sm text-red-500 mb-4 text-center">
                {importMessage}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseImportModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleImportExcel}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
              >
                Xác nhận import
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <StatCard
            title="Tổng Sản Phẩm"
            value={totalProducts}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
          <StatCard
            title="Tổng Ẩn"
            value={totalHidden}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
          <StatCard
            title="Tổng Hiển Thị"
            value={totalVisible}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
        </div>

        <div className="flex items-center justify-between flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-4 w-full max-w-lg mt-3">
            <form className="flex items-center space-x-4 w-full">
              <label
                htmlFor="search"
                className="mb-2 text-sm font-medium text-gray-900 dark:text-white sr-only"
              >
                Tìm kiếm
              </label>
              <div className="relative w-full max-w-xs">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  id="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="block w-full p-4 ps-10 text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:placeholder-gray-400"
                  placeholder="Nhập tên sản phẩm"
                  required
                />
                {showHistory && searchHistory.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded shadow-md z-10 dark:bg-gray-800 dark:border-gray-700">
                    <ul className="text-sm">
                      {searchHistory.map((item, index) => (
                        <li
                          key={index}
                          onMouseDown={() =>
                            handleSearchChange({ target: { value: item } })
                          }
                          className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={toggleFilter}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-4 mt-3"
            >
              Lọc
            </button>

            {isFilterVisible && (
              <div
                ref={filterRef}
                className="absolute left-0 mt-2 bg-white shadow-lg p-4 rounded-lg z-10 w-64 dark:bg-gray-800"
              >
                <select
                  className="block p-2.5 w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:placeholder-gray-400"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((categoryId) => {
                    const category = categoriesData.find(
                      (cat) => cat.id === categoryId
                    );
                    return (
                      <option
                        key={categoryId}
                        value={categoryId}
                        className="dark:bg-gray-700 dark:text-white"
                      >
                        {categoryId === "all"
                          ? "Tất cả Danh mục"
                          : category?.name}
                      </option>
                    );
                  })}
                </select>
                <select
                  className="block p-2.5 w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:placeholder-gray-400 mt-2"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                >
                  {brands.map((brandId) => {
                    const brand = brandsData.find((b) => b.id === brandId);
                    return (
                      <option
                        key={brandId}
                        value={brandId}
                        className="dark:bg-gray-700 dark:text-white"
                      >
                        {brandId === "all" ? "Tất cả Thương hiệu" : brand?.name}
                      </option>
                    );
                  })}
                </select>
                <select
                  className="block p-2.5 w-full text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:placeholder-gray-400 mt-2"
                  value={filterOption}
                  onChange={(e) => setFilterOption(e.target.value)}
                >
                  <option
                    value="all-A-Z"
                    className="dark:bg-gray-700 dark:text-white"
                  >
                    A-Z
                  </option>
                  <option
                    value="all-Z-A"
                    className="dark:bg-gray-700 dark:text-white"
                  >
                    Z-A
                  </option>
                  <option
                    value="price-asc"
                    className="dark:bg-gray-700 dark:text-white"
                  >
                    Giá tăng dần
                  </option>
                  <option
                    value="price-desc"
                    className="dark:bg-gray-700 dark:text-white"
                  >
                    Giá giảm dần
                  </option>
                  <option
                    value="active"
                    className="dark:bg-gray-700 dark:text-white"
                  >
                    Hiển thị
                  </option>
                  <option
                    value="inactive"
                    className="dark:bg-gray-700 dark:text-white"
                  >
                    Ẩn
                  </option>
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={handleExportExcel}
              className="text-white bg-pink-500 hover:bg-pink-600 focus:ring-4 focus:ring-pink-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-pink-700 mr-4 mt-3"
            >
              Xuất file
            </button>
            <button
              type="button"
              onClick={handleOpenImportModal}
              className="text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-orange-700 mr-4 mt-3"
            >
              Import
            </button>

            <button
              type="button"
              onClick={handleAddProductSchedule}
              className="text-white bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-teal-700 mr-4"
            >
              Đặt lịch
            </button>
            <button
              type="button"
              onClick={handleAddProduct}
              className="text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-indigo-700 mr-4"
            >
              Thêm
            </button>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow dark:bg-gray-800">
          <div className="flex justify-end mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setActionType("batch-toggle");
                  setShowConfirmModal(true);
                }}
                disabled={selectedProductIds.length === 0}
                className="text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:focus:ring-yellow-800 disabled:opacity-50"
              >
                Ẩn / Hiện
              </button>
              <button
                onClick={() => {
                  setActionType("batch-delete");
                  setShowConfirmModal(true);
                }}
                disabled={selectedProductIds.length === 0}
                className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:focus:ring-red-800 disabled:opacity-50"
              >
                Xóa
              </button>
            </div>
          </div>

          <ProductListTable
            products={currentProducts}
            selectedProductIds={selectedProductIds}
            handleToggleSelect={handleToggleSelect}
            handleSelectAll={handleSelectAll}
            isAllSelected={
              selectedProductIds.length === sortedProducts.length &&
              sortedProducts.length > 0
            }
            handleDelete={handleDelete}
            handleToggleVisibility={handleToggleVisibility}
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <nav aria-label="Page navigation">
          <ul className="flex items-center space-x-1 text-sm">
            <li>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-l-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Previous
              </button>
            </li>

            {getPageNumbers(currentPage, totalPages).map((page, idx) => {
              if (page === "left-ellipsis" || page === "right-ellipsis") {
                return (
                  <li
                    key={page + idx}
                    className="px-2 select-none text-gray-700 dark:text-gray-300"
                  >
                    ...
                  </li>
                );
              }
              return (
                <li key={page}>
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    } dark:border-gray-600`}
                  >
                    {page}
                  </button>
                </li>
              );
            })}

            <li>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-r-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default ProductList;
