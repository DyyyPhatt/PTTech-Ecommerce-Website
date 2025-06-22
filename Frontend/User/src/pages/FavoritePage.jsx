import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FavoriteProductCard from "../components/Card/FavoriteProductCard";
import Breadcrumb from "../components/Breadcrumb";
import Pagination from "../components/Pagination";
import { FaHome, FaHeart } from "react-icons/fa";
import useBrands from "../hooks/useBrands";
import { ToastContainer } from "react-toastify";

const FavoritePage = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { brands } = useBrands();

  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const favorites =
      JSON.parse(localStorage.getItem("favoriteProducts")) || [];
    setProducts(favorites);
  }, [location]);

  const productsPerPage = 10;
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

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: FaHome },
    { label: "Sản phẩm yêu thích", href: "/favorites", icon: FaHeart },
  ];

  return (
    <>
      <ToastContainer />
      <Breadcrumb items={breadcrumbItems} />
      <div className="bg-gray-100 dark:bg-neutral-800 p-4 md:p-8 min-h-[60vh]">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3820/3820331.png"
              alt="No favorites"
              className="w-24 h-24 mb-6 opacity-70"
            />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              Bạn chưa có sản phẩm yêu thích
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng theo dõi.
            </p>
            <a
              href="/"
              className="mt-2 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition duration-300 font-semibold"
            >
              Khám phá ngay
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {currentProducts.map((product) => (
                <FavoriteProductCard
                  key={product.id}
                  product={product}
                  brands={brands}
                  darkMode
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              darkMode
            />
          </>
        )}
      </div>
    </>
  );
};

export default FavoritePage;
