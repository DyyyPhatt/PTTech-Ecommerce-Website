import React, { useState, useEffect } from "react";
import BrandListTable from "../../components/Brand/BrandListTable";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useBrandSearch from "../../hooks/Brand/useBrandSearch";
import { FaExclamationTriangle, FaCheck, FaTimes } from "react-icons/fa";
import StatCard from "../../components/Dashboard/StatCard";

const BrandList = () => {
  const {
    searchQuery,
    handleSearchChange,
    searchHistory,
    showHistory,
    handleFocus,
    handleBlur,
  } = useBrandSearch();
  const [brands, setBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [brandsPerPage] = useState(5);
  const [filterOption, setFilterOption] = useState("all-A-Z");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [countries, setCountries] = useState([]);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importMessage, setImportMessage] = useState("");

  const [showSuccessMessage, setShowSuccessMessage] = useState({
    success: false,
    message: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);

  const navigate = useNavigate();

  const handleDelete = async (id, logo) => {
    const userToken = getUserToken();

    const isDefaultLogo =
      logo === "http://localhost:8081/images/default-avatar.png";

    const isServerLogo =
      logo?.startsWith("http://localhost:8081/images/") || logo === "";

    try {
      if (isServerLogo && !isDefaultLogo) {
        await axios.delete(
          `http://localhost:8081/api/brands/delete-image/${id}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        console.log("Logo thương hiệu đã được xóa thành công.");
      }

      await axios.delete(`http://localhost:8081/api/brands/${id}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      setBrands((prevBrands) => prevBrands.filter((brand) => brand.id !== id));

      setShowSuccessMessage({
        success: true,
        message: "Xóa thương hiệu thành công.",
      });

      setTimeout(
        () => setShowSuccessMessage({ success: false, message: "" }),
        3000
      );
    } catch (error) {
      console.error("Lỗi khi xóa thương hiệu hoặc logo:", error);
    }
  };

  const handleToggleVisibility = async (id, isActive) => {
    const userToken = getUserToken();
    try {
      const endpoint = isActive
        ? `http://localhost:8081/api/brands/hide/${id}`
        : `http://localhost:8081/api/brands/show/${id}`;

      await axios.put(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      setBrands((prevBrands) =>
        prevBrands.map((brand) =>
          brand.id === id ? { ...brand, isActive: !isActive } : brand
        )
      );

      setShowSuccessMessage({
        success: true,
        message: isActive
          ? "Ẩn Thương hiệu thành công."
          : "Hiện Thương hiệu thành công.",
      });
      setTimeout(
        () => setShowSuccessMessage({ success: false, message: "" }),
        3000
      );
    } catch (error) {
      console.error("Error toggling brand visibility:", error);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedBrandIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allIds = sortedBrands.map((brand) => brand.id);
      setSelectedBrandIds(allIds);
    } else {
      setSelectedBrandIds([]);
    }
  };

  const handleConfirmYes = () => {
    if (actionType === "delete") {
      handleDelete(selectedBrandId);
    } else if (actionType === "toggle") {
      const brand = brands.find((brand) => brand.id === selectedBrandId);
      handleToggleVisibility(selectedBrandId, brand.isActive);
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
    for (const id of selectedBrandIds) {
      await handleDelete(id);
    }
    setSelectedBrandIds([]);
  };

  const handleBatchToggleVisibility = async () => {
    const selectedBrands = brands.filter((brand) =>
      selectedBrandIds.includes(brand.id)
    );
    for (const brand of selectedBrands) {
      await handleToggleVisibility(brand.id, brand.isActive);
    }
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.get(
          "http://localhost:8081/api/brands/no-delete",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const brandsData = response.data;
        setBrands(Array.isArray(brandsData) ? brandsData : []);

        const uniqueCountries = [
          ...new Set(brandsData.map((brand) => brand.country)),
        ];
        setCountries(["all", ...uniqueCountries]);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchBrands();
  }, []);

  const searchedBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBrand = () => {
    navigate("/add-brand");
  };

  const handleAddBrandSchedule = () => {
    navigate("/add-brand-schedule");
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
        "http://localhost:8081/api/brands/import-excel",
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
        "http://localhost:8081/api/brands/no-delete",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBrands(refreshed.data);
      setImportMessage(response.data || "Import thành công.");
      setImportFile(null);
      setShowImportModal(false);
      setShowSuccessMessage({
        success: true,
        message: "Import thương hiệu thành công!",
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
        "http://localhost:8081/api/brands/export-excel",
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
      link.download = "brands.xlsx";
      link.click();
    } catch (error) {
      console.error("Error exporting file:", error);
    }
  };

  const totalBrands = brands.length;
  const totalHidden = brands.filter((brand) => !brand.isActive).length;
  const totalVisible = totalBrands - totalHidden;

  const indexOfLastBrand = currentPage * brandsPerPage;
  const indexOfFirstBrand = indexOfLastBrand - brandsPerPage;

  const filteredBrands = searchedBrands.filter((brand) => {
    if (filterOption === "active") return brand.isActive;
    if (filterOption === "inactive") return !brand.isActive;
    return true;
  });

  const countryFilteredBrands = filteredBrands.filter((brand) => {
    if (selectedCountry === "all") return true;
    return brand.country === selectedCountry;
  });

  const sortedBrands = countryFilteredBrands.sort((a, b) => {
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
    return 0;
  });

  const currentBrands = sortedBrands.slice(indexOfFirstBrand, indexOfLastBrand);
  const totalPages = Math.ceil(sortedBrands.length / brandsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };
  const getPageNumbers = () => {
    const totalNumbers = 5;
    const totalBlocks = totalNumbers + 2;

    if (totalPages <= totalNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];

    const leftBound = Math.max(2, currentPage - 1);
    const rightBound = Math.min(totalPages - 1, currentPage + 1);

    const showLeftDots = leftBound > 2;
    const showRightDots = rightBound < totalPages - 1;

    pages.push(1);

    if (showLeftDots) {
      pages.push("...");
    }

    for (let i = leftBound; i <= rightBound; i++) {
      pages.push(i);
    }

    if (showRightDots) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <>
      {showSuccessMessage.success && (
        <div
          id="toast-success"
          className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:text-white dark:bg-gray-800"
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
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md dark:bg-gray-800">
            <button
              onClick={handleCloseImportModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition dark:text-gray-400 dark:hover:text-gray-200"
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
              <div className="bg-green-100 text-green-600 rounded-full p-3 mb-3 dark:bg-green-900 dark:text-green-400">
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
              <h2 className="text-xl font-semibold text-gray-800 text-center dark:text-white">
                Import thương hiệu từ Excel
              </h2>
              <p className="text-sm text-gray-500 text-center mt-1 dark:text-gray-300">
                Chọn file .xlsx hoặc .xls để thêm thương hiệu vào hệ thống.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                File Excel
              </label>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500
                  file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100
                  dark:bg-gray-700 dark:text-white dark:border-gray-600
                  dark:file:bg-green-800 dark:file:text-green-300 dark:hover:file:bg-green-700"
              />
            </div>

            {importMessage && (
              <p className="text-sm text-red-500 mb-4 text-center dark:text-red-400">
                {importMessage}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseImportModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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
            title="Tổng Thương Hiệu"
            value={totalBrands}
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
                className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
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
                  className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Nhập tên thương hiệu"
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
            <div className="flex items-center space-x-4 mt-4 mb-4">
              <select
                className="block p-2.5 w-35 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
              >
                <option value="all-A-Z">A-Z</option>
                <option value="all-Z-A">Z-A</option>
                <option value="active">Hiển thị</option>
                <option value="inactive">Ẩn</option>
              </select>

              <select
                className="block p-2.5 w-40 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                {countries.map((country) => (
                  <option
                    key={country}
                    value={country}
                    className="dark:text-white"
                  >
                    {country === "all" ? "Tất cả Quốc Gia" : country}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
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
              onClick={handleAddBrandSchedule}
              className="text-white bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-teal-700 mr-4"
            >
              Đặt lịch
            </button>

            <button
              type="button"
              onClick={handleAddBrand}
              className="text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-indigo-700 mr-4"
            >
              Thêm thương hiệu
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
                disabled={selectedBrandIds.length === 0}
                className="text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:focus:ring-yellow-800 disabled:opacity-50"
              >
                Ẩn / Hiện
              </button>
              <button
                onClick={() => {
                  setActionType("batch-delete");
                  setShowConfirmModal(true);
                }}
                disabled={selectedBrandIds.length === 0}
                className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:focus:ring-red-800 disabled:opacity-50"
              >
                Xóa
              </button>
            </div>
          </div>
          <BrandListTable
            brands={currentBrands}
            setBrands={setBrands}
            selectedBrandIds={selectedBrandIds}
            handleToggleSelect={handleToggleSelect}
            handleSelectAll={handleSelectAll}
            isAllSelected={
              selectedBrandIds.length === sortedBrands.length &&
              sortedBrands.length > 0
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
                className="px-4 py-2 rounded-l-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Previous
              </button>
            </li>
            {getPageNumbers().map((page, index) => (
              <li key={index}>
                {page === "..." ? (
                  <span className="px-3 py-2 text-gray-500 dark:text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-lg text-gray-700 dark:border-gray-600 ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                    }`}
                  >
                    {page}
                  </button>
                )}
              </li>
            ))}
            <li>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-r-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
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

export default BrandList;
