import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import Pagination from "../components/Pagination";
import ProductCard from "../components/Card/ProductCard";
import { FaHome } from "react-icons/fa";
import { HiOutlineInbox } from "react-icons/hi";
import { BsFilter } from "react-icons/bs";
import ModalFilter from "../components/Modal/ModalFilter";
import useProducts from "../hooks/useProducts";
import useBrands from "../hooks/useBrands";
import useCategories from "../hooks/useCategories";
import { ToastContainer } from "react-toastify";

const AllProducts = () => {
  const location = useLocation();
  const { products, errorProducts, loadingProducts, filterProducts } =
    useProducts();
  const { brands } = useBrands();
  const { categories } = useCategories();
  const flattenedCategories = categories.flatMap((parent) => [
    parent.name,
    ...(parent.children?.map((child) => child.name) || []),
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedVisibilities, setSelectedVisibilities] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 });
  const [sortOption, setSortOption] = useState("createdAt_desc");

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  const totalPages = Math.ceil(products.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    filterProducts({
      brandName: selectedBrands,
      categoryName: selectedCategories,
      visibilityType: selectedVisibilities,
      condition: selectedConditions,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      sortBy: sortOption.split("__")[0],
      sortOrder: sortOption.split("__")[1],
    });
    setCurrentPage(1);
  }, [
    selectedBrands,
    selectedCategories,
    selectedVisibilities,
    selectedConditions,
    priceRange,
    sortOption,
  ]);

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: FaHome },
    { label: "Tất cả sản phẩm", href: "/products" },
  ];

  const applyFilter = ({
    brands,
    categories,
    visibilities,
    conditions,
    priceRange,
    sortOption,
  }) => {
    setSelectedBrands(brands);
    setSelectedCategories(categories);
    setSelectedVisibilities(visibilities);
    setSelectedConditions(conditions);
    setPriceRange(priceRange);
    setSortOption(sortOption);
  };

  return (
    <>
      <ToastContainer />
      <Breadcrumb items={breadcrumbItems} />
      <div className="bg-gray-100 p-4 md:p-8 min-h-[400px] dark:bg-neutral-800">
        <div className="mb-4 flex justify-end text-right">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg flex items-center justify-center space-x-2
                       hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500
                       dark:from-blue-600 dark:to-blue-800 dark:hover:from-blue-700 dark:hover:to-blue-900"
          >
            <BsFilter className="text-white" />
            <span className="font-semibold">Bộ lọc</span>
          </button>
        </div>

        <ModalFilter
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          brands={brands}
          categories={flattenedCategories.map((name, index) => ({
            id: index,
            name,
          }))}
          selectedBrands={selectedBrands}
          selectedCategories={selectedCategories}
          selectedVisibilities={selectedVisibilities}
          selectedConditions={selectedConditions}
          priceRange={priceRange}
          sortOption={sortOption}
          onApplyFilter={applyFilter}
        />
        {/* Danh sách sản phẩm */}
        <div>
          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg
                className="animate-spin h-10 w-10 text-blue-500 mb-4 dark:text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <p className="text-gray-600 font-medium dark:text-gray-300">
                Đang tải sản phẩm...
              </p>
            </div>
          ) : errorProducts ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <svg
                className="w-10 h-10 text-red-500 mb-4 dark:text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-.01-12a9 9 0 100 18 9 9 0 000-18z"
                />
              </svg>
              <p className="text-red-600 font-semibold text-lg dark:text-red-400">
                Đã xảy ra lỗi khi tải sản phẩm
              </p>
              <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">
                {errorProducts}. Vui lòng thử lại sau.
              </p>
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-600 dark:text-gray-400">
              <HiOutlineInbox className="w-12 h-12 text-gray-400 mb-3 dark:text-gray-500" />
              <p className="text-lg font-medium">Không có sản phẩm nào</p>
              <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                Vui lòng thử lại sau.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    brands={brands}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AllProducts;
