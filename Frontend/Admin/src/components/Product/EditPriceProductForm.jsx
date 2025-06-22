import React, { useState } from "react";
import { useParams } from "react-router-dom";
import useEditPriceProduct from "../../hooks/Product/useEditPriceProduct";
import useBrands from "../../hooks/Product/useBrands";
import useCategories from "../../hooks/Product/useCategories";
import BackButton from "../BackButton";

const EditPriceProductForm = () => {
  const { id } = useParams();

  const {
    product,
    newPrice,
    setNewPrice,
    loading,
    error,
    showSuccessMessage,
    showErrorMessage,
    handlePriceChange,
  } = useEditPriceProduct(id);

  const { brands, loading: loadingBrands } = useBrands();
  const { categories, loading: loadingCategories } = useCategories();
  const [modalImage, setModalImage] = useState(null);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    handlePriceChange();
  };

  return (
    <>
      <div className="mb-4">
        <BackButton path="/product-list" />
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6"
      >
        {showErrorMessage && (
          <div className="fixed top-4 right-4 p-4 bg-red-500 text-white rounded">
            Cập nhật giá sản phẩm thất bại. Vui lòng thử lại!
          </div>
        )}

        {showSuccessMessage && (
          <div className="fixed top-4 right-4 p-4 bg-green-500 text-white rounded">
            Cập nhật giá sản phẩm thành công!
          </div>
        )}

        <div className="border-b pb-4 mb-6 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Thông tin sản phẩm
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Tên sản phẩm
              </label>
              <input
                type="text"
                name="name"
                value={product.name}
                className="bg-gray-100 border border-gray-300 text-sm rounded-lg w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                readOnly
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Mã sản phẩm
              </label>
              <input
                type="text"
                name="productId"
                value={product.productId}
                className="bg-gray-100 border border-gray-300 text-sm rounded-lg w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Thương hiệu
              </label>
              <select
                name="brandId"
                value={product.brandId}
                className="bg-gray-100 border border-gray-300 text-sm rounded-lg w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled
              >
                <option value="">Chọn thương hiệu</option>
                {loadingBrands ? (
                  <option>Đang tải...</option>
                ) : (
                  brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Danh mục
              </label>
              <select
                name="categoryId"
                value={product.categoryId}
                className="bg-gray-100 border border-gray-300 text-sm rounded-lg w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled
              >
                <option value="">Chọn danh mục</option>
                {loadingCategories ? (
                  <option>Đang tải...</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {modalImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setModalImage(null)}
          >
            <img
              src={modalImage}
              alt="Large view"
              className="max-w-full max-h-full rounded shadow-lg"
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

        <div className="border-b pb-4 mb-6 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Ảnh sản phẩm
          </h3>
          <div>
            <div className="flex gap-2 mt-2">
              {product.images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    alt={`Product image ${idx + 1}`}
                    className="w-20 h-20 cursor-pointer rounded hover:opacity-80"
                    onClick={() => setModalImage(img)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {product.videos && product.videos.length > 0 && (
          <div className="border-b pb-4 mb-6 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
              Video sản phẩm
            </h3>
            <div>
              <div className="flex gap-2 mt-2">
                {product.videos.map((video, idx) => (
                  <div key={idx} className="relative">
                    <video src={video} className="w-32 h-20" controls />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="border-b pb-4 mb-6 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Giá sản phẩm
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Giá cũ
              </label>
              <input
                type="text"
                name="pricing.current"
                value={product.pricing.current
                  ?.toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                readOnly
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Giá mới
              </label>
              <input
                type="text"
                id="price"
                value={newPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\./g, "");
                  if (!isNaN(rawValue)) {
                    setNewPrice(Number(rawValue));
                  }
                }}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Cập nhật giá
          </button>
        </div>
      </form>
      <div className="mt-4">
        <BackButton path="/product-list" />
      </div>
    </>
  );
};

export default EditPriceProductForm;
