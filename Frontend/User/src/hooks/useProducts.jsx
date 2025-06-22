import { useState, useEffect } from "react";
import axios from "axios";

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [productDetail, setProductDetail] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingTopSelling, setLoadingTopSelling] = useState(true);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [errorProducts, setErrorProducts] = useState(null);
  const [errorTopSelling, setErrorTopSelling] = useState(null);
  const [errorTopRated, setErrorTopRated] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState(null);

  const filterProducts = async (filters = {}) => {
    setLoadingProducts(true);
    setErrorProducts(null);

    try {
      const response = await axios.get(
        "http://localhost:8081/api/products/active",
        {
          params: {
            ...filters,
            brandName: Array.isArray(filters.brandName)
              ? filters.brandName.join(",")
              : filters.brandName,
            categoryName: Array.isArray(filters.categoryName)
              ? filters.categoryName.join(",")
              : filters.categoryName,
            visibilityType: Array.isArray(filters.visibilityType)
              ? filters.visibilityType.join(",")
              : filters.visibilityType,
            condition: Array.isArray(filters.condition)
              ? filters.condition.join(",")
              : filters.condition,
            sortBy: filters.sortBy || "createdAt",
            sortOrder: filters.sortOrder || "desc",
          },
        }
      );
      setProducts(response.data);
      return response.data;
    } catch (err) {
      setErrorProducts("Lỗi khi lọc danh sách sản phẩm");
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchProductById = async (id) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const response = await axios.get(
        `http://localhost:8081/api/products/${id}`
      );
      setProductDetail(response.data);
      return response.data;
    } catch (err) {
      setDetailError("Lỗi khi lấy chi tiết sản phẩm");
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchProductByProductId = async (productId) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const response = await axios.get(
        `http://localhost:8081/api/products/by-product-id/${productId}`
      );
      setProductDetail(response.data);
    } catch (err) {
      setDetailError("Lỗi khi lấy chi tiết sản phẩm theo mã sản phẩm");
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const searchProductsByName = async (keyword, filters = {}) => {
    setSearchLoading(true);
    setSearchError(null);

    try {
      const response = await axios.get(
        "http://localhost:8081/api/products/search-filter",
        {
          params: {
            keyword,
            ...filters,
            brandName: filters.brandName?.join(","),
            categoryName: filters.categoryName?.join(","),
            visibilityType: filters.visibilityType?.join(","),
            condition: filters.condition?.join(","),
            sortBy: filters.sortBy || "createdAt",
            sortOrder: filters.sortOrder || "desc",
          },
        }
      );
      setSearchResults(response.data);
    } catch (err) {
      setSearchError("Lỗi khi tìm kiếm sản phẩm có lọc");
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      setLoadingTopSelling(true);
      try {
        const response = await axios.get(
          "http://localhost:8081/api/products/top-selling"
        );
        setTopSellingProducts(response.data);
      } catch (err) {
        setErrorTopSelling("Lỗi khi lấy sản phẩm bán chạy nhất");
        console.error(err);
      } finally {
        setLoadingTopSelling(false);
      }
    };

    const fetchTopRatedProducts = async () => {
      setLoadingTopRated(true);
      try {
        const response = await axios.get(
          "http://localhost:8081/api/products/top-rated"
        );
        setTopRatedProducts(response.data);
      } catch (err) {
        setErrorTopRated("Lỗi khi lấy sản phẩm đánh giá cao nhất");
        console.error(err);
      } finally {
        setLoadingTopRated(false);
      }
    };

    fetchTopSellingProducts();
    fetchTopRatedProducts();
  }, []);

  const compareProducts = async (productIds) => {
    setComparisonLoading(true);
    setComparisonError(null);

    try {
      const response = await axios.get(
        "http://localhost:8081/api/products/compare",
        {
          params: { productIds },
          paramsSerializer: (params) => {
            return Object.entries(params)
              .map(([key, value]) =>
                Array.isArray(value)
                  ? value
                      .map((v) => `${key}=${encodeURIComponent(v)}`)
                      .join("&")
                  : `${key}=${encodeURIComponent(value)}`
              )
              .join("&");
          },
        }
      );

      setComparisonResult(response.data);
    } catch (err) {
      setComparisonError("Lỗi khi so sánh sản phẩm");
      console.error(err);
    } finally {
      setComparisonLoading(false);
    }
  };

  return {
    products,
    topSellingProducts,
    topRatedProducts,
    productDetail,
    searchResults,
    loadingProducts,
    loadingTopSelling,
    loadingTopRated,
    detailLoading,
    searchLoading,
    errorProducts,
    errorTopSelling,
    errorTopRated,
    detailError,
    searchError,
    comparisonResult,
    comparisonLoading,
    comparisonError,
    compareProducts,
    fetchProductById,
    fetchProductByProductId,
    filterProducts,
    searchProductsByName,
  };
};

export default useProducts;
