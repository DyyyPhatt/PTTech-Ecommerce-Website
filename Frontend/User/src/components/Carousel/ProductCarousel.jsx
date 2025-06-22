import React, { useEffect, useState } from "react";
import ProductCard from "../Card/ProductCard";
import useProducts from "../../hooks/useProducts";
import useBrands from "../../hooks/useBrands";
import useCategories from "../../hooks/useCategories";
import { FaArrowLeft, FaArrowRight, FaBoxOpen } from "react-icons/fa";

const ProductCarousel = ({ productDetail }) => {
  const { products, filterProducts, loadingProducts, errorProducts } =
    useProducts();
  const { brands } = useBrands();
  const { categories } = useCategories();
  const [currentPage, setCurrentPage] = useState(1);
  const [productsToDisplay, setProductsToDisplay] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [itemsPerPage] = useState(5);

  // Hàm làm phẳng danh sách categories (bao gồm cả con)
  const flattenCategories = (cats) => {
    const flatList = [];

    const helper = (items) => {
      items.forEach((item) => {
        flatList.push(item);
        if (item.children && item.children.length > 0) {
          helper(item.children);
        }
      });
    };

    helper(cats);
    return flatList;
  };

  useEffect(() => {
    if (productDetail && categories.length > 0) {
      // Làm phẳng danh sách categories để tìm chính xác category con hoặc cha
      const flatCategories = flattenCategories(categories);

      const category = flatCategories.find(
        (c) => c.id === productDetail.categoryId
      );

      if (category) {
        const price = productDetail.pricing.current || 0;
        const minPrice = price * 0.5;
        const maxPrice = price * 1.5;

        const result = filterProducts({
          categoryName: category.name,
          minPrice,
          maxPrice,
        });

        if (result) setFiltered(result);
      }
    }
  }, [productDetail, categories]);

  useEffect(() => {
    if (products.length > 0 && productDetail) {
      const _filtered = products.filter(
        (product) => product.id !== productDetail.id
      );

      setFilteredProducts(_filtered);
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      setProductsToDisplay(_filtered.slice(startIdx, endIdx));
    }
  }, [currentPage, products, itemsPerPage, productDetail]);

  const handleNextPage = () => {
    if (currentPage * itemsPerPage < products.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="product-carousel p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-md dark:shadow-black/50 border border-gray-200 dark:border-gray-700">
      <h3 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6 pb-3 border-b-2 border-gray-300 dark:border-gray-700 flex items-center gap-3 transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500">
        <FaBoxOpen className="text-4xl text-blue-500 dark:text-blue-400 transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-300" />
        Sản phẩm liên quan
      </h3>

      {loadingProducts ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin dark:border-blue-400 dark:border-t-transparent"></div>
          <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium text-lg">
            Đang tải...
          </p>
        </div>
      ) : errorProducts ? (
        <p className="text-center text-red-600 dark:text-red-400 font-semibold py-6">
          {errorProducts}
        </p>
      ) : productsToDisplay.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-center mt-10 flex flex-col items-center justify-center text-lg">
          <FaBoxOpen className="text-4xl mb-3 text-gray-400 dark:text-gray-600" />
          Không có sản phẩm nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {productsToDisplay.map((product) => (
            <div
              key={product.id}
              className="transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              <ProductCard product={product} brands={brands} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination mt-10 flex justify-center items-center gap-6">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaArrowLeft />
          Trước
        </button>

        <span className="text-gray-700 dark:text-gray-300 text-lg font-medium">
          Trang {currentPage} /{" "}
          {Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage * itemsPerPage >= filteredProducts.length}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sau
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default ProductCarousel;
