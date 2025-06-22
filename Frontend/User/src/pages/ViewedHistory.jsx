import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ViewedProductCard from "../components/Card/ViewedProductCard";
import Breadcrumb from "../components/Breadcrumb";
import Pagination from "../components/Pagination";
import { FaHome, FaHistory } from "react-icons/fa";
import useBrands from "../hooks/useBrands";
import { ToastContainer } from "react-toastify";

const ViewedHistory = () => {
  const [products, setProducts] = useState([]);
  const { brands, loading: brandsLoading, error: brandsError } = useBrands();

  const location = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    const viewedProducts =
      JSON.parse(localStorage.getItem("viewedProducts")) || [];
    setProducts(viewedProducts);
  }, [location]);

  const productsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
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
    { label: "Sản phẩm đã xem", href: "/viewed-history", icon: FaHistory },
  ];

  return (
    <>
      <ToastContainer />
      <Breadcrumb items={breadcrumbItems} />
      <div className="bg-gray-100 dark:bg-neutral-800 p-4 md:p-8 min-h-screen">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="No viewed products"
              className="w-24 h-24 mb-6 opacity-70"
            />
            <h2 className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">
              Bạn chưa xem sản phẩm nào
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Hãy khám phá các sản phẩm để chúng tôi ghi nhớ lịch sử cho bạn
              nhé!
            </p>
            <a
              href="/"
              className="mt-2 inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 dark:hover:bg-blue-500 transition duration-300 font-semibold"
            >
              Quay lại trang chủ
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {currentProducts.map((product) => (
                <ViewedProductCard
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
    </>
  );
};

export default ViewedHistory;
