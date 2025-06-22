import React, { useState, useEffect } from "react";
import { BsCheckCircle, BsFilter } from "react-icons/bs";
import { FaTag, FaList, FaEye, FaDollarSign, FaSort } from "react-icons/fa";

const ModalFilter = ({
  isOpen,
  onClose,
  brands,
  categories,
  selectedBrands,
  selectedCategories,
  selectedVisibilities,
  selectedConditions,
  priceRange,
  sortOption,
  onApplyFilter,
}) => {
  const [localSelectedBrands, setLocalSelectedBrands] =
    useState(selectedBrands);
  const [localSelectedCategories, setLocalSelectedCategories] =
    useState(selectedCategories);
  const [localSelectedVisibilities, setLocalSelectedVisibilities] =
    useState(selectedVisibilities);
  const [localSelectedConditions, setLocalSelectedConditions] = useState(
    selectedConditions || []
  );
  const [localPriceRange, setLocalPriceRange] = useState(
    priceRange || { min: 0, max: 100000000 }
  );
  const [localSortOption, setLocalSortOption] = useState(sortOption);

  const handleCheckboxChange = (id, setState) => {
    setState((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyFilter = () => {
    onApplyFilter({
      brands: localSelectedBrands,
      categories: localSelectedCategories,
      visibilities: localSelectedVisibilities,
      conditions: localSelectedConditions,
      priceRange: localPriceRange,
      sortOption: localSortOption,
    });
    onClose();
  };

  useEffect(() => {
    setLocalSelectedBrands(selectedBrands);
    setLocalSelectedCategories(selectedCategories);
    setLocalSelectedVisibilities(selectedVisibilities);
    setLocalSelectedConditions(selectedConditions || []);
    setLocalPriceRange(priceRange || { min: 0, max: 100000000 });
    setLocalSortOption(sortOption);
  }, [
    selectedBrands,
    selectedCategories,
    selectedVisibilities,
    selectedConditions,
    priceRange,
    sortOption,
  ]);

  const handleFormattedInput = (e, name) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    const number = parseInt(raw) || 0;
    setLocalPriceRange((prev) => ({
      ...prev,
      [name]: number,
    }));
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0₫";
    return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}₫`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/70 via-gray-800/60 to-black/70 backdrop-blur-md backdrop-saturate-150">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl h-[90vh] rounded-xl shadow-2xl ring-1 ring-blue-400/10 dark:ring-blue-700/20 flex flex-col border border-gray-200 dark:border-gray-800 animate-scaleIn transition-all duration-300 ease-out overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200">
            <BsFilter className="inline-block mr-2 text-blue-600 dark:text-blue-400" />
            Chọn bộ lọc
          </h3>
        </div>

        {/* Nội dung */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 custom-scrollbar">
          {/* Thương hiệu */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded-xl p-4 border border-blue-300 dark:border-blue-700 shadow-sm">
            <h4 className="text-lg font-semibold flex items-center mb-3 text-blue-700 dark:text-blue-300">
              <FaTag className="mr-2" /> Thương hiệu
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex items-center text-sm text-blue-900 dark:text-blue-200 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md px-2 py-1 transition"
                >
                  <input
                    type="checkbox"
                    checked={localSelectedBrands.includes(brand.name)}
                    onChange={() =>
                      handleCheckboxChange(brand.name, setLocalSelectedBrands)
                    }
                    className="mr-3 accent-blue-600"
                  />
                  {brand.name}
                </label>
              ))}
            </div>
          </div>

          {/* Danh mục */}
          <div className="bg-green-50 dark:bg-green-900 rounded-xl p-4 border border-green-300 dark:border-green-700 shadow-sm">
            <h4 className="text-lg font-semibold flex items-center mb-3 text-green-700 dark:text-green-300">
              <FaList className="mr-2" /> Danh mục
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center text-sm text-green-900 dark:text-green-200 cursor-pointer hover:bg-green-100 dark:hover:bg-green-800 rounded-md px-2 py-1 transition"
                >
                  <input
                    type="checkbox"
                    checked={localSelectedCategories.includes(category.name)}
                    onChange={() =>
                      handleCheckboxChange(
                        category.name,
                        setLocalSelectedCategories
                      )
                    }
                    className="mr-3 accent-green-600"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          {/* Hiển thị */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded-xl p-4 border border-blue-300 dark:border-blue-700 shadow-sm">
            <h4 className="text-lg font-semibold flex items-center mb-3 text-blue-700 dark:text-blue-300">
              <FaEye className="mr-2" /> Hiển thị
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {[
                "Khuyến Mãi",
                "Bán Chạy",
                "Yêu Thích",
                "Nổi Bật",
                "Phổ Biến",
                "Mới",
                "Cơ Bản",
              ].map((type) => (
                <label
                  key={type}
                  className="flex items-center text-sm text-blue-900 dark:text-blue-200 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md px-2 py-1 transition"
                >
                  <input
                    type="checkbox"
                    checked={localSelectedVisibilities.includes(type)}
                    onChange={() =>
                      handleCheckboxChange(type, setLocalSelectedVisibilities)
                    }
                    className="mr-3 accent-blue-600"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Tình trạng */}
          <div className="bg-pink-50 dark:bg-pink-900 rounded-xl p-4 border border-pink-300 dark:border-pink-700 shadow-sm">
            <h4 className="text-lg font-semibold flex items-center mb-3 text-pink-700 dark:text-pink-300">
              <FaTag className="mr-2" /> Tình trạng
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {["Mới", "Qua sử dụng", "Hàng trưng bày"].map((condition) => (
                <label
                  key={condition}
                  className="flex items-center text-sm text-pink-900 dark:text-pink-200 cursor-pointer hover:bg-pink-100 dark:hover:bg-pink-800 rounded-md px-2 py-1 transition"
                >
                  <input
                    type="checkbox"
                    checked={localSelectedConditions.includes(condition)}
                    onChange={() =>
                      handleCheckboxChange(
                        condition,
                        setLocalSelectedConditions
                      )
                    }
                    className="mr-3 accent-pink-600"
                  />
                  {condition}
                </label>
              ))}
            </div>
          </div>

          {/* Khoảng giá */}
          <div className="col-span-1 md:col-span-2 bg-yellow-50 dark:bg-yellow-900 rounded-xl p-4 border border-yellow-300 dark:border-yellow-700 shadow-sm">
            <h4 className="text-lg font-semibold flex items-center mb-3 text-yellow-700 dark:text-yellow-300">
              <FaDollarSign className="mr-2" /> Khoảng giá
            </h4>
            <div className="flex gap-4">
              <input
                type="text"
                value={formatCurrency(localPriceRange.min)}
                onChange={(e) => handleFormattedInput(e, "min")}
                placeholder="Giá từ"
                className="w-full border border-yellow-400 rounded-lg p-2 text-sm dark:bg-yellow-900 dark:text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <input
                type="text"
                value={formatCurrency(localPriceRange.max)}
                onChange={(e) => handleFormattedInput(e, "max")}
                placeholder="Giá đến"
                className="w-full border border-yellow-400 rounded-lg p-2 text-sm dark:bg-yellow-900 dark:text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          {/* Sắp xếp */}
          <div className="col-span-1 md:col-span-2 bg-purple-50 dark:bg-purple-900 rounded-xl p-4 border border-purple-300 dark:border-purple-700 shadow-sm">
            <h4 className="text-lg font-semibold flex items-center mb-3 text-purple-700 dark:text-purple-300">
              <FaSort className="mr-2" /> Sắp xếp theo
            </h4>
            <select
              value={localSortOption}
              onChange={(e) => setLocalSortOption(e.target.value)}
              className="w-full border border-purple-400 rounded-lg p-3 text-sm dark:bg-purple-900 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="createdAt__desc">Mới nhất</option>
              <option value="createdAt__asc">Cũ nhất</option>
              <option value="price_asc__asc">Giá tăng dần</option>
              <option value="price_desc__desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900 z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleApplyFilter}
            className="px-4 py-2 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 dark:from-blue-700 dark:to-purple-900 text-white rounded-lg hover:brightness-110 hover:scale-105 transition-transform flex items-center shadow-md"
          >
            <BsCheckCircle className="mr-2" />
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalFilter;
