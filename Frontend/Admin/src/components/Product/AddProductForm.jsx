import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAddProduct from "../../hooks/Product/useAddProduct";
import useBrands from "../../hooks/Product/useBrands";
import useCategories from "../../hooks/Product/useCategories";
import ReactQuill from "react-quill";
import BackButton from "../BackButton";
import "react-quill/dist/quill.snow.css";

const AddProductForm = () => {
  const {
    product,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
    setProduct,
    selectedImages,
    selectedVideos,
    handleDeleteImage,
    handleDeleteVideo,
  } = useAddProduct();
  const { brands, loading: loadingBrands } = useBrands();
  const { categories, loading: loadingCategories } = useCategories();
  const navigate = useNavigate();
  const [brandSearch, setBrandSearch] = React.useState("");
  const [categorySearch, setCategorySearch] = React.useState("");

  useEffect(() => {
    if (showSuccessMessage) {
      setTimeout(() => navigate("/product-list"), 3000);
    }
  }, [showSuccessMessage, navigate]);

  function formatNumber(num) {
    if (num === null || num === undefined) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function parseNumber(str) {
    return Number(str.replace(/\./g, "")) || 0;
  }

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
  ];

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
            Thêm sản phẩm thất bại. Vui lòng thử lại!
          </div>
        )}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 p-4 bg-green-500 text-white rounded">
            Thêm sản phẩm thành công!
          </div>
        )}

        <div className="border-b pb-4 mb-6 border-gray-300 dark:border-gray-700">
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
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nhập tên sản phẩm"
                required
              />
              {errors.name && (
                <span className="text-red-500 dark:text-red-400 text-sm">
                  {errors.name}
                </span>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Mã sản phẩm
              </label>
              <input
                type="text"
                name="productId"
                value={product.productId}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nhập mã sản phẩm"
                required
              />
              {errors.productId && (
                <span className="text-red-500 dark:text-red-400 text-sm">
                  {errors.productId}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Thương hiệu
              </label>

              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-2"
                placeholder="Nhập tên thương hiệu..."
              />

              <select
                name="brandId"
                value={product.brandId}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                <option value="" className="dark:text-gray-300">
                  Chọn thương hiệu
                </option>
                {loadingBrands ? (
                  <option className="dark:text-gray-300">Đang tải...</option>
                ) : (
                  brands
                    .filter((brand) =>
                      brand.name
                        .toLowerCase()
                        .includes(brandSearch.toLowerCase())
                    )
                    .map((brand) => (
                      <option
                        key={brand.id}
                        value={brand.id}
                        className="dark:text-gray-300"
                      >
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

              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-2"
                placeholder="Nhập tên danh mục..."
              />

              <select
                name="categoryId"
                value={product.categoryId}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                <option value="" className="dark:text-gray-300">
                  Chọn danh mục
                </option>
                {loadingCategories ? (
                  <option className="dark:text-gray-300">Đang tải...</option>
                ) : (
                  categories
                    .filter((category) =>
                      category.name
                        .toLowerCase()
                        .includes(categorySearch.toLowerCase())
                    )
                    .map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                        className="dark:text-gray-300"
                      >
                        {category.name}
                      </option>
                    ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Giá gốc
              </label>
              <input
                type="text"
                name="pricing.original"
                value={formatNumber(product.pricing.original)}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "pricing.original",
                      value: parseNumber(e.target.value),
                    },
                  })
                }
                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Giá giảm
              </label>
              <input
                type="text"
                name="pricing.current"
                value={formatNumber(product.pricing.current)}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "pricing.current",
                      value: parseNumber(e.target.value),
                    },
                  })
                }
                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>
          </div>
        </div>

        <div className="border-b pb-4 mb-6 border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Ảnh sản phẩm
          </h3>
          <div>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
            {errors.images && (
              <span className="text-red-500 dark:text-red-400 text-sm">
                {errors.images}
              </span>
            )}
            <div className="flex gap-2 mt-2">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={
                      typeof img === "string" ? img : URL.createObjectURL(img)
                    }
                    alt={`Ảnh ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img)}
                    className="absolute top-0 right-0 text-white bg-red-500 text-xs px-1 rounded-full"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-b pb-4 mb-6 border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Video sản phẩm
          </h3>
          <div>
            <input
              type="file"
              name="videos"
              accept="video/*"
              multiple
              onChange={handleChange}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
            {errors.videos && (
              <span className="text-red-500 dark:text-red-400 text-sm">
                {errors.videos}
              </span>
            )}
            <div className="flex gap-2 mt-2">
              {selectedVideos.map((video, idx) => (
                <div key={idx} className="relative">
                  <video
                    src={
                      typeof video === "string"
                        ? video
                        : URL.createObjectURL(video)
                    }
                    controls
                    className="w-32 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(video)}
                    className="absolute top-0 right-0 text-white bg-red-500 text-xs px-1 rounded-full"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-b pb-4 mb-6 border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Thông tin khác
          </h3>

          <div>
            <label className="block mb-2 text-sm font-medium mt-3 text-gray-900 dark:text-white">
              Mô tả sản phẩm
            </label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Nhập mô tả sản phẩm"
              required
            />
            {errors.description && (
              <span className="text-red-500 dark:text-red-400 text-sm">
                {errors.description}
              </span>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium mt-3 text-gray-900 dark:text-white">
              Trạng thái
            </label>
            <select
              name="status"
              value={product.status}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            >
              <option value="active" className="dark:text-gray-300">
                Hoạt động
              </option>
              <option value="inactive" className="dark:text-gray-300">
                Không hoạt động
              </option>
              <option value="coming soon" className="dark:text-gray-300">
                Sắp ra mắt
              </option>
              <option value="out of stock" className="dark:text-gray-300">
                Hết hàng
              </option>
            </select>
          </div>

          <div>
            <h3 className="block mb-2 text-sm font-medium mt-3 text-gray-900 dark:text-white">
              Tags sản phẩm
            </h3>
            {product.tags.map((tag, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  name={`tag-${index}`}
                  value={tag}
                  onChange={handleChange}
                  placeholder={`Tag ${index + 1}`}
                  className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 w-full mr-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...product.tags];
                    updated.splice(index, 1);
                    setProduct((prev) => ({ ...prev, tags: updated }));
                  }}
                  className="text-white bg-red-500 hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-1.5"
                >
                  Xóa
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setProduct((prev) => ({ ...prev, tags: [...prev.tags, ""] }))
              }
              className="text-white bg-blue-500 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 mt-2"
            >
              + Thêm tag
            </button>
          </div>
        </div>

        <div className="border-b pb-4 mb-6 border-gray-300 dark:border-gray-700">
          <label className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Thông số kỹ thuật
          </label>

          {Object.entries(product.specifications).map(([key, value], index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                name={`specKey-${index}`}
                value={key}
                onChange={handleChange}
                placeholder="Tên thông số"
                className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 w-1/2 bg-white dark:bg-gray-800"
              />
              <input
                type="text"
                name={`specValue-${index}`}
                value={value}
                onChange={handleChange}
                placeholder="Giá trị"
                className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 w-1/2 bg-white dark:bg-gray-800"
              />
              <button
                type="button"
                onClick={() => {
                  const updatedSpecs = { ...product.specifications };
                  delete updatedSpecs[key];
                  setProduct((prev) => ({
                    ...prev,
                    specifications: updatedSpecs,
                  }));
                }}
                className="text-white bg-red-500 hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-1.5"
              >
                Xóa
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              setProduct((prev) => ({
                ...prev,
                specifications: { ...prev.specifications, "": "" },
              }));
            }}
            className="text-white bg-blue-500 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 mt-2 block w-[300px]"
          >
            + Thêm thông số kỹ thuật
          </button>
        </div>

        <div className="border-b pb-4 mb-6 border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Bài viết
          </h3>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium mt-3 text-gray-900 dark:text-white">
              Tiêu đề
            </label>
            <input
              type="text"
              name="blog.title"
              value={product.blog.title}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
              placeholder="Nhập tiêu đề blog"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium mt-3 text-gray-900 dark:text-white">
              Mô tả
            </label>
            <textarea
              name="blog.description"
              value={product.blog.description}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
              placeholder="Nhập mô tả blog"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium mt-3 text-gray-900 dark:text-white">
              Nội dung
            </label>
            <ReactQuill
              value={product.blog.content}
              onChange={(content) =>
                handleChange({
                  target: { name: "blog.content", value: content },
                })
              }
              modules={quillModules}
              formats={quillFormats}
              className="mt-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="border-b pb-4 mb-6 border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Thông tin bảo hành
          </h3>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium mt-3 text-gray-900 dark:text-white">
              Thời gian
            </label>
            <input
              type="text"
              name="warranty.duration"
              value={product.warranty.duration}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Nhập thời gian bảo hành"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium mt-3 text-gray-900 dark:text-white">
              Điều khoản
            </label>
            <ReactQuill
              value={product.warranty.terms}
              onChange={(content) =>
                handleChange({
                  target: { name: "warranty.terms", value: content },
                })
              }
              modules={quillModules}
              formats={quillFormats}
              className="mt-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="border-b pb-4 mb-6 border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Biến thể
          </h3>
          {product.variants.map((variant, index) => (
            <div
              key={index}
              className="border p-4 mb-2 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {[
                  "color",
                  "hexCode",
                  "size",
                  "ram",
                  "storage",
                  "condition",
                  "stock",
                ].map((field) => (
                  <input
                    key={field}
                    type={field === "stock" ? "number" : "text"}
                    name={`variant-${field}-${index}`}
                    value={variant[field] || ""}
                    onChange={handleChange}
                    placeholder={field}
                    className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 w-full bg-white dark:bg-gray-700"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const updated = [...product.variants];
                  updated.splice(index, 1);
                  setProduct((prev) => ({ ...prev, variants: updated }));
                }}
                className="text-white bg-red-500 hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-1.5 mt-2"
              >
                Xóa biến thể
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              setProduct((prev) => ({
                ...prev,
                variants: [
                  ...prev.variants,
                  {
                    color: "",
                    hexCode: "",
                    size: "",
                    ram: "",
                    storage: "",
                    condition: "",
                    stock: 0,
                  },
                ],
              }));
            }}
            className="text-white bg-blue-500 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 mt-2"
          >
            + Thêm biến thể
          </button>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isSubmitting ? "Đang thêm..." : "Thêm sản phẩm"}
          </button>
        </div>
      </form>
      <div className="mt-4">
        <BackButton path="/product-list" />
      </div>
    </>
  );
};

export default AddProductForm;
