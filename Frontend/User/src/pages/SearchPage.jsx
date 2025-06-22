import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import Pagination from "../components/Pagination";
import { FaHome, FaSearch } from "react-icons/fa";
import ProductCard from "../components/Card/ProductCard";
import ProductCardSkeleton from "../components/Card/ProductCardSkeleton";
import { HiOutlineInbox } from "react-icons/hi";
import useProducts from "../hooks/useProducts";
import useCategories from "../hooks/useCategories";
import useBrands from "../hooks/useBrands";
import ModalFilter from "../components/Modal/ModalFilter";
import { BsFilter } from "react-icons/bs";
import { ToastContainer } from "react-toastify";

const SearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("q") || "";

  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedVisibilities, setSelectedVisibilities] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 });
  const [sortOption, setSortOption] = useState("createdAt__desc");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { searchProductsByName, searchResults, searchLoading, searchError } =
    useProducts();
  const { categories } = useCategories();
  const flattenedCategories = categories.flatMap((parent) => [
    parent.name,
    ...(parent.children?.map((child) => child.name) || []),
  ]);
  const { brands } = useBrands();

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    if (keyword) {
      searchProductsByName(keyword, {
        brandName: selectedBrands,
        categoryName: selectedCategories,
        visibilityType: selectedVisibilities,
        condition: selectedConditions,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        sortBy: sortOption.split("__")[0],
        sortOrder: sortOption.split("__")[1],
        limit: productsPerPage,
      });
      setCurrentPage(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [
    keyword,
    selectedBrands,
    selectedCategories,
    selectedVisibilities,
    selectedConditions,
    priceRange,
    sortOption,
  ]);

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

  const totalPages = Math.ceil(searchResults.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = searchResults.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: FaHome },
    {
      label: `Kết quả tìm kiếm: "${keyword}"`,
      href: `/search?q=${keyword}`,
      icon: FaSearch,
    },
  ];

  return (
    <>
      <ToastContainer />
      <Breadcrumb items={breadcrumbItems} />
      <div className="bg-gray-100 p-4 md:p-8 min-h-[400px]">
        <div className="mb-4 flex justify-end text-right">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {searchLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : searchError ? (
          <div className="text-center py-12 text-red-600 font-semibold">
            {searchError}
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-600">
            <HiOutlineInbox className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-lg font-medium">Không tìm thấy sản phẩm</p>
            <p className="text-sm text-gray-500 mt-1">
              Không có kết quả phù hợp với từ khóa “{keyword}”.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {currentProducts.map((product) => (
                <ProductCard
                  key={product.id || product._id}
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
    </>
  );
};

export default SearchPage;
