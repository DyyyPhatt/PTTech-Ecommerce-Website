import React, { useState, useEffect } from "react";
import AdsListTable from "../../components/Ads/AdsListTable";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAdsSearch from "../../hooks/Ads/useAdsSearch";
import { FaExclamationTriangle, FaCheck, FaTimes } from "react-icons/fa";
import StatCard from "../../components/Dashboard/StatCard";

const AdsList = () => {
  const {
    searchQuery,
    handleSearchChange,
    searchHistory,
    showHistory,
    handleFocus,
    handleBlur,
  } = useAdsSearch();
  const [ads, setAds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const navigate = useNavigate();
  const [filterOption, setFilterOption] = useState("all-A-Z");
  const [selectedAdType, setSelectedAdType] = useState("all");
  const [adTypes, setAdTypes] = useState([]);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const userToken = localStorage.getItem("userToken");

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8081/api",
    headers: {
      Authorization: userToken ? `Bearer ${userToken}` : "",
    },
  });

  const [showSuccessMessage, setShowSuccessMessage] = useState({
    success: false,
    message: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedAdId, setSelectedAdId] = useState(null);
  const [selectedAdIds, setSelectedAdIds] = useState([]);

  const handleDelete = async (id, imageUrl) => {
    const isDefaultImage =
      imageUrl === "http://localhost:8081/images/default-avatar.png";

    const isServerImage =
      imageUrl?.startsWith("http://localhost:8081/images/") || imageUrl === "";

    try {
      if (isServerImage && !isDefaultImage) {
        await axiosInstance.delete(
          `http://localhost:8081/api/ad-images/delete-image/${id}`
        );
        console.log("Hình ảnh quảng cáo đã được xóa thành công.");
      }

      await axiosInstance.delete(`http://localhost:8081/api/ad-images/${id}`);
      setAds((prevAds) => prevAds.filter((ad) => ad.id !== id));

      setShowSuccessMessage({
        success: true,
        message: "Xóa quảng cáo thành công.",
      });
      setTimeout(
        () => setShowSuccessMessage({ success: false, message: "" }),
        3000
      );
    } catch (error) {
      console.error("Lỗi khi xóa quảng cáo hoặc hình ảnh quảng cáo:", error);
    }
  };

  const handleToggleVisibility = async (id, isActive) => {
    try {
      const endpoint = isActive
        ? `http://localhost:8081/api/ad-images/hide/${id}`
        : `http://localhost:8081/api/ad-images/show/${id}`;

      await axiosInstance.put(endpoint);

      setAds((prevAds) =>
        prevAds.map((ad) =>
          ad.id === id ? { ...ad, isActive: !isActive } : ad
        )
      );

      setShowSuccessMessage({
        success: true,
        message: isActive
          ? "Ẩn Quảng cáo thành công."
          : "Hiện Quảng cáo thành công.",
      });
      setTimeout(
        () => setShowSuccessMessage({ success: false, message: "" }),
        3000
      );
    } catch (error) {
      console.error("Error toggling ad visibility:", error);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedAdIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allIds = filteredAds.map((ad) => ad.id);
      setSelectedAdIds(allIds);
    } else {
      setSelectedAdIds([]);
    }
  };

  const handleConfirmYes = () => {
    if (actionType === "delete") {
      handleDelete(selectedAdId);
    } else if (actionType === "toggle") {
      const ad = ads.find((ad) => ad.id === selectedAdId);
      handleToggleVisibility(selectedAdId, ad.isActive);
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
    for (const id of selectedAdIds) {
      await handleDelete(id);
    }
    setSelectedAdIds([]);
  };

  const handleBatchToggleVisibility = async () => {
    const selectedAds = ads.filter((ad) => selectedAdIds.includes(ad.id));
    for (const ad of selectedAds) {
      await handleToggleVisibility(ad.id, ad.isActive);
    }
  };

  const fetchAds = async () => {
    try {
      const token = getUserToken();
      const response = await axios.get(
        "http://localhost:8081/api/ad-images/no-delete",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const adsData = response.data;
      setAds(adsData);

      const uniqueTypes = [...new Set(adsData.map((ad) => ad.adType))];
      setAdTypes(["all", ...uniqueTypes]);
    } catch (error) {
      console.error("Error fetching ads:", error);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleAddAd = () => {
    navigate("/add-ads");
  };

  const handleAddAdSchedule = () => {
    navigate("/add-ads-schedule");
  };

  const handleExportExcel = async () => {
    try {
      const token = getUserToken();
      const response = await axios.get(
        "http://localhost:8081/api/ad-images/export-excel",
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
      link.download = "adImage.xlsx";
      link.click();
    } catch (error) {
      console.error("Error exporting file:", error);
    }
  };

  const searchedAds = ads.filter((ad) =>
    ad.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAds = ads.length;
  const totalHidden = ads.filter((ad) => !ad.isActive).length;
  const totalVisible = ads.filter((ad) => ad.isActive).length;
  const indexOfLastAd = currentPage * itemsPerPage;
  const indexOfFirstAd = indexOfLastAd - itemsPerPage;

  const filteredAds = searchedAds.filter((ad) => {
    if (filterOption === "active") {
      return ad.isActive;
    }
    if (filterOption === "inactive") {
      return !ad.isActive;
    }
    return true;
  });

  const typeFilteredAds = filteredAds.filter((ad) => {
    if (selectedAdType === "all") {
      return true;
    }
    return ad.adType === selectedAdType;
  });

  const sortedAds = typeFilteredAds.sort((a, b) => {
    if (
      filterOption === "all-A-Z" ||
      filterOption === "active-A-Z" ||
      filterOption === "inactive-A-Z"
    ) {
      return a.title.localeCompare(b.title);
    }
    if (
      filterOption === "all-Z-A" ||
      filterOption === "active-Z-A" ||
      filterOption === "inactive-Z-A"
    ) {
      return b.title.localeCompare(a.title);
    }
    return 0;
  });

  const currentAds = sortedAds.slice(indexOfFirstAd, indexOfLastAd);

  const totalPages = Math.ceil(sortedAds.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
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
          <div className="ms-3 text-sm font-normal">
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
      <div className="mt-4 relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
          <StatCard
            title="Tổng Quảng Cáo"
            value={totalAds}
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
              <div className="relative w-full max-w-sm">
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
                  placeholder="Nhập tiêu đề"
                  className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50
    focus:ring-blue-500 focus:border-blue-500
    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
    dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
                {showHistory && searchHistory.length > 0 && (
                  <div
                    className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded shadow-md z-10
    dark:bg-gray-800 dark:border-gray-700"
                  >
                    <ul className="text-sm dark:text-white">
                      {searchHistory.map((item, index) => (
                        <li
                          key={index}
                          onMouseDown={() =>
                            handleSearchChange({ target: { value: item } })
                          }
                          className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                value={selectedAdType}
                onChange={(e) => setSelectedAdType(e.target.value)}
              >
                {adTypes.map((adType) => (
                  <option key={adType} value={adType}>
                    {adType === "main"
                      ? "Chính"
                      : adType === "secondary"
                      ? "Phụ"
                      : adType === "all"
                      ? "Tất cả loại"
                      : adType}
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
              onClick={handleAddAdSchedule}
              className="text-white bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-teal-700 mr-4"
            >
              Đặt lịch
            </button>

            <button
              type="button"
              onClick={handleAddAd}
              className="text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:focus:ring-indigo-700 mr-4"
            >
              Thêm quảng cáo
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
                disabled={selectedAdIds.length === 0}
                className="text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:focus:ring-yellow-800 disabled:opacity-50"
              >
                Ẩn / Hiện
              </button>
              <button
                onClick={() => {
                  setActionType("batch-delete");
                  setShowConfirmModal(true);
                }}
                disabled={selectedAdIds.length === 0}
                className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:focus:ring-red-800 disabled:opacity-50"
              >
                Xóa
              </button>
            </div>
          </div>
          <AdsListTable
            ads={currentAds}
            setAds={setAds}
            selectedAdIds={selectedAdIds}
            handleToggleSelect={handleToggleSelect}
            handleSelectAll={handleSelectAll}
            isAllSelected={
              selectedAdIds.length === filteredAds.length &&
              filteredAds.length > 0
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
                className="px-4 py-2 rounded-l-lg border border-gray-300 text-gray-600 hover:bg-gray-100
            disabled:opacity-50
            dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:disabled:text-gray-500"
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <li key={pageNumber}>
                  <button
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-4 py-2 border rounded-lg
                ${
                  currentPage === pageNumber
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                }`}
                  >
                    {pageNumber}
                  </button>
                </li>
              )
            )}
            <li>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-r-lg border border-gray-300 text-gray-600 hover:bg-gray-100
            disabled:opacity-50
            dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:disabled:text-gray-500"
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

export default AdsList;
