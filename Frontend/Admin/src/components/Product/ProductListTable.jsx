import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProductListTable = ({
  products,
  setProducts,
  selectedProductIds,
  handleToggleSelect,
  handleSelectAll,
  isAllSelected,
}) => {
  const [categories, setCategories] = useState({});
  const [brands, setBrands] = useState({});

  const [showSuccessMessage, setShowSuccessMessage] = useState({
    success: false,
    message: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [modalImage, setModalImage] = React.useState(null);

  const navigate = useNavigate();

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

  const fetchCategoryName = async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/categories/${categoryId}`);
      return response.data.name;
    } catch (error) {
      console.error("Error fetching category name:", error);
      return "N/A";
    }
  };

  const fetchBrandName = async (brandId) => {
    try {
      const response = await axiosInstance.get(`/brands/${brandId}`);
      return response.data.name;
    } catch (error) {
      console.error("Error fetching brand name:", error);
      return "N/A";
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/product-detail/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/edit-product/${id}`);
  };

  const handleEditPrice = (id) => {
    navigate(`/edit-price-product/${id}`);
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

  const handleConfirmAction = (type, id) => {
    if (type === "edit") {
      handleEdit(id);
      return;
    }
    setActionType(type);
    setSelectedProductId(id);
    setShowConfirmModal(true);
  };

  const handleConfirmYes = () => {
    if (actionType === "delete") {
      handleDelete(selectedProductId);
    } else if (actionType === "toggle") {
      const product = products.find(
        (product) => product.id === selectedProductId
      );
      handleToggleVisibility(selectedProductId, product.status === "active");
    }
    setShowConfirmModal(false);
  };

  const handleConfirmNo = () => {
    setShowConfirmModal(false);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const categoryNames = {};
      for (const product of products) {
        if (!categoryNames[product.categoryId]) {
          const categoryName = await fetchCategoryName(product.categoryId);
          categoryNames[product.categoryId] = categoryName;
        }
      }
      setCategories(categoryNames);
    };

    fetchCategories();
  }, [products]);

  useEffect(() => {
    const fetchBrands = async () => {
      const brandNames = {};
      for (const product of products) {
        if (!brandNames[product.brandId]) {
          const brandName = await fetchBrandName(product.brandId);
          brandNames[product.brandId] = brandName;
        }
      }
      setBrands(brandNames);
    };

    fetchBrands();
  }, [products]);

  return (
    <div>
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
          className="fixed inset-0 bg-gray-500 bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50"
          onClick={handleConfirmNo}
        >
          <div
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
              Bạn có muốn tiếp tục thực hiện hành động không?
            </h3>
            <div className="flex justify-end mt-4 space-x-4">
              <button
                onClick={handleConfirmYes}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Có
              </button>
              <button
                onClick={handleConfirmNo}
                className="px-4 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-md dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Không
              </button>
            </div>
          </div>
        </div>
      )}

      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="Large view"
            className="max-w-[80vw] max-h-[80vh] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-5 right-5 text-white text-3xl font-bold"
            onClick={() => setModalImage(null)}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
      )}

      <table className="w-full text-sm text-left text-gray-500 dark:text-white bg-gray-50 dark:bg-gray-900 mt-4">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-white">
          <tr>
            <th scope="col" className="px-6 py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>

            <th className="px-6 py-3">Hình ảnh</th>
            <th className="px-6 py-3">Tên sản phẩm</th>
            <th className="px-6 py-3">Giá</th>
            <th className="px-6 py-3">Danh mục</th>
            <th className="px-6 py-3">Thương hiệu</th>
            <th className="px-6 py-3">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedProductIds.includes(product.id)}
                  onChange={() => handleToggleSelect(product.id)}
                />
              </td>
              <td className="px-6 py-4">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded cursor-pointer"
                    onClick={() => setModalImage(product.images[0])}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
              </td>

              <td
                className="px-6 cursor-pointer hover:text-blue-500 hover:underline py-4 w-80 break-words dark:text-white"
                onClick={() => handleViewDetail(product.id)}
              >
                <span className="relative hover:underline group w-fit inline-block">
                  {product.name}

                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                    Xem chi tiết sản phẩm
                  </span>
                </span>
              </td>
              <td
                className="px-6 py-4 dark:text-white cursor-pointer hover:text-blue-500 hover:underline"
                onClick={() => handleEditPrice(product.id)}
              >
                <span className="relative hover:underline group w-fit inline-block">
                  {product.pricing && product.pricing.current
                    ? product.pricing.current.toLocaleString()
                    : "N/A"}{" "}
                  đ
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                    Sửa giá
                  </span>
                </span>
              </td>

              <td className="px-6 py-4 dark:text-white">
                {categories[product.categoryId] || "N/A"}{" "}
              </td>
              <td className="px-6 py-4 dark:text-white">
                {brands[product.brandId] || "N/A"}{" "}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`font-semibold px-2 py-1 rounded text-sm ${
                    product.status === "active"
                      ? "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900"
                      : "text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900"
                  }`}
                >
                  {product.status === "active" ? "Hiển thị" : "Ẩn"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductListTable;
