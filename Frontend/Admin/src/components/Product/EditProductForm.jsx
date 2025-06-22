import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useEditProduct from "../../hooks/Product/useEditProduct";
import useBrands from "../../hooks/Product/useBrands";
import useCategories from "../../hooks/Product/useCategories";
import ReactQuill from "react-quill";
import BackButton from "../BackButton";
import "react-quill/dist/quill.snow.css";

const EditProductForm = () => {
  const { id } = useParams();
  const {
    product,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
    handleImageUpload,
    handleDeleteImage,
    handleVideoUpload,
    handleDeleteVideo,
    handleAddSpecification,
    handleRemoveSpecification,
    handleChangeSpec,
    handleAddVariant,
    handleRemoveVariant,
    handleAddTag,
    handleRemoveTag,
    handleChangeVariant,
  } = useEditProduct(id);

  const { brands, loading: loadingBrands } = useBrands();
  const { categories, loading: loadingCategories } = useCategories();
  const navigate = useNavigate();
  const [tagInput, setTagInput] = useState("");
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    if (showSuccessMessage) {
      setTimeout(() => navigate("/product-list"), 3000);
    }
  }, [showSuccessMessage, navigate]);

  const [brandSearch, setBrandSearch] = React.useState("");
  const [categorySearch, setCategorySearch] = React.useState("");

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
            Cập nhật sản phẩm thất bại. Vui lòng thử lại!
          </div>
        )}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 p-4 bg-green-500 text-white rounded">
            Cập nhật sản phẩm thành công!
          </div>
        )}

        <div className="border-b pb-4 mb-6 border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Thông tin sản phẩm
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-6 mt-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Tên sản phẩm
              </label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg w-full p-2.5"
                required
              />
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
                <option value="">Chọn thương hiệu</option>
                {loadingBrands ? (
                  <option>Đang tải...</option>
                ) : (
                  brands
                    .filter((brand) =>
                      brand.name
                        .toLowerCase()
                        .includes(brandSearch.toLowerCase())
                    )
                    .map((brand) => (
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
                <option value="">Chọn danh mục</option>
                {loadingCategories ? (
                  <option>Đang tải...</option>
                ) : (
                  categories
                    .filter((category) =>
                      category.name
                        .toLowerCase()
                        .includes(categorySearch.toLowerCase())
                    )
                    .map((category) => (
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

        <div className="border-b pb-4 mb-6 border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Ảnh sản phẩm
          </h3>
          <div>
            <input
              type="file"
              className="mt-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              onChange={(e) => handleImageUpload(e.target.files[0])}
            />
            <div className="flex gap-2 mt-2">
              {product.images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    alt={`Product image ${idx + 1}`}
                    className="w-20 h-20 cursor-pointer rounded hover:opacity-80"
                    onClick={() => setModalImage(img)}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img)}
                    className="absolute top-0 right-0 text-white bg-red-500 text-xs px-1"
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
              onChange={(e) => handleVideoUpload(e.target.files[0])}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-3"
            />
            <div className="flex gap-2 mt-2">
              {product.videos.map((video, idx) => (
                <div key={idx} className="relative">
                  <video src={video} className="w-32 h-20" controls />
                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(video)}
                    className="absolute top-0 right-0 text-white bg-red-500 text-xs px-1"
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
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg w-full p-2.5"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium mt-3 text-gray-900 dark:text-white">
              Trạng thái
            </label>
            <select
              name="status"
              value={product.status}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg w-full p-2.5"
              required
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="coming soon">Sắp ra mắt</option>
              <option value="out of stock">Hết hàng</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium mt-3 text-gray-900 dark:text-white">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 w-full"
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  handleAddTag(tagInput);
                  setTagInput("");
                }}
              >
                Thêm
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {product.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center text-gray-900 dark:text-white"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-2 text-red-500"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-b pb-4 mb-6 border-gray-300 dark:border-gray-700">
          <label className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Thông số kỹ thuật
          </label>

          {Object.entries(product.specifications || {}).map(
            ([key, value], index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => handleChangeSpec(e, key, "key")}
                  placeholder="Tên thông số"
                  className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 w-1/2 bg-white dark:bg-gray-800"
                />

                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChangeSpec(e, key, "value")}
                  placeholder="Giá trị"
                  className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 w-1/2 bg-white dark:bg-gray-800"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveSpecification(key)}
                  className="text-white bg-red-500 hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-1.5"
                >
                  Xóa
                </button>
              </div>
            )
          )}

          <button
            type="button"
            onClick={handleAddSpecification}
            className="text-white bg-blue-500 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 mt-2"
          >
            + Thêm thông số kỹ thuật
          </button>
        </div>

        <div className="border-b pb-4 mb-6 border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-bold uppercase text-gray-900 dark:text-white">
            Bài viết
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-4">
            <div>
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
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium mt-3 text-gray-900 dark:text-white">
              Mô tả blog
            </label>
            <textarea
              type="text"
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

          <div className="mt-4">
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
                    value={variant[field] || ""}
                    onChange={(e) => handleChangeVariant(e, index, field)}
                    placeholder={field}
                    className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 w-full bg-white dark:bg-gray-700"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                className="text-white bg-red-500 hover:bg-red-700 font-medium rounded-lg text-sm px-3 py-1.5 mt-2"
              >
                Xóa biến thể
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddVariant}
            className="text-white bg-blue-500 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 mt-2"
          >
            + Thêm biến thể
          </button>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isSubmitting ? "Đang lưu..." : "Cập nhật sản phẩm"}
          </button>
        </div>
      </form>
      <div className="mt-4">
        <BackButton path="/product-list" />
      </div>
    </>
  );
};

export default EditProductForm;
