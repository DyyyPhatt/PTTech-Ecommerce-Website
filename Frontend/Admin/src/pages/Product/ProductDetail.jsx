import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaStarHalfAlt,
  FaImages,
  FaVideo,
  FaInfoCircle,
  FaShieldAlt,
  FaTags,
  FaShoppingCart,
  FaRandom,
} from "react-icons/fa";

import { BsFillHouseDoorFill } from "react-icons/bs";
import BackButton from "../../components/BackButton";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showMoreSpecs, setShowMoreSpecs] = useState(false);
  const [showFullBlog, setShowFullBlog] = useState(false);
  const scrollContainer = useRef(null);
  const [showFullWarranty, setShowFullWarranty] = React.useState(false);
  const [modalImage, setModalImage] = useState(null);

  const navigate = useNavigate();

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const token = getUserToken();
        const response = await axios.get(
          `http://localhost:8081/api/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProduct(response.data);
      } catch (error) {
        setError("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetail();
    }
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = getUserToken();
        const response = await axios.get(
          "http://localhost:8081/api/categories",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(response.data);
      } catch (err) {
        console.error("Không thể tải danh sách danh mục.", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const token = getUserToken();
        const response = await axios.get("http://localhost:8081/api/brands", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBrands(response.data);
      } catch (err) {
        console.error("Không thể tải danh sách thương hiệu.", err);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="text-center py-10">Không tìm thấy sản phẩm.</div>;
  }

  const {
    images,
    name,
    description,
    productId,
    pricing,
    status,
    visibilityType,
    totalSold,
    brandId,
    categoryId,
    blog,
    ratings,
    warranty,
    specifications,
    variants,
    tags,
    videos,
  } = product;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto flex justify-center items-center space-x-4">
        <h1 className="text-3xl font-semibold text-gray-800 text-center dark:text-white">
          Chi tiết sản phẩm
        </h1>
      </div>
      <div className="max-w-4xl mx-auto flex justify-between mt-4">
        <BackButton path="/product-list" />
        <button
          onClick={() => navigate(`/edit-product/${id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
            />
          </svg>
          <span>Chỉnh sửa sản phẩm</span>
        </button>

        <button
          onClick={() => navigate(`/edit-price-product/${id}`)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 17.345a4.76 4.76 0 0 0 2.558 1.618c2.274.589 4.512-.446 4.999-2.31.487-1.866-1.273-3.9-3.546-4.49-2.273-.59-4.034-2.623-3.547-4.488.486-1.865 2.724-2.899 4.998-2.31.982.236 1.87.793 2.538 1.592m-3.879 12.171V21m0-18v2.2"
            />
          </svg>
          <span>Chỉnh sửa giá</span>
        </button>
      </div>
      <div className="max-w-4xl mx-auto mt-4 bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6 bg-blue-50 border-b border-gray-200 dark:bg-blue-900 dark:border-gray-700">
          <div className="flex items-start space-x-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {name}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                {description}
              </p>
            </div>
          </div>
        </div>

        {images && images.length > 0 && (
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center dark:text-white">
              <FaImages className="mr-2 text-blue-600" />
              Ảnh sản phẩm
            </h3>
            <div className="relative mt-2">
              <div
                className="flex space-x-2 overflow-x-auto scrollbar-hide"
                ref={scrollContainer}
              >
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Sản phẩm ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                    onClick={() => setModalImage(image)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {modalImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setModalImage(null)}
          >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <img
                src={modalImage}
                alt="Xem lớn"
                className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
              />
              <button
                className="absolute -top-4 -right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-lg"
                onClick={() => setModalImage(null)}
                aria-label="Đóng"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {videos && videos.length > 0 && (
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center dark:text-white">
              <FaVideo className="mr-2 text-blue-600" />
              Video sản phẩm
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {videos.map((video, index) => (
                <div key={index} className="relative">
                  <video
                    controls
                    className="w-full h-48 object-cover rounded-md"
                  >
                    <source src={video} type="video/mp4" />
                    Trình duyệt của bạn không hỗ trợ thẻ video.
                  </video>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center dark:text-white">
            <FaInfoCircle className="mr-2 text-blue-600" />
            Thông tin sản phẩm
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Giá gốc
              </p>
              <p className="font-bold text-lg dark:text-white">
                {pricing?.original?.toLocaleString()} VNĐ
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Giá hiện tại
              </p>
              <p className="font-bold text-lg text-red-600 dark:text-red-400">
                {pricing?.current?.toLocaleString()} VNĐ
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Danh mục
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {categoryId
                  ? categories.find(
                      (category) => category.id === categoryId.toString()
                    )?.name || "Không xác định"
                  : "Chưa có"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Thương hiệu
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {brandId
                  ? brands.find((brand) => brand.id === brandId.toString())
                      ?.name || "Không xác định"
                  : "Chưa có"}
              </p>
            </div>
          </div>
        </div>

        {tags && tags.length > 0 && (
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center dark:text-white">
              <FaTags className="mr-2 text-red-600" />
              Tags sản phẩm
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {tags.join(", ")}
            </p>
          </div>
        )}

        {specifications && (
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center dark:text-white">
              <BsFillHouseDoorFill className="mr-2 text-pink-600" />
              Thông số kỹ thuật
            </h3>
            <ul>
              {Object.entries(specifications)
                .slice(
                  0,
                  showMoreSpecs ? Object.entries(specifications).length : 3
                )
                .map(([key, value]) => (
                  <li key={key} className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{key}: </span>
                    <span>{value}</span>
                  </li>
                ))}
            </ul>

            <div className="mt-2">
              <button
                onClick={() => setShowMoreSpecs(!showMoreSpecs)}
                className="text-blue-500 hover:underline"
              >
                {showMoreSpecs ? "Thu gọn" : "Xem thêm"}
              </button>
            </div>
          </div>
        )}

        {warranty && (
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center dark:text-white">
              <FaShieldAlt className="mr-2 text-green-600" />
              Thông tin bảo hành
            </h3>
            <div className="flex items-center space-x-2">
              <p className="font-semibold dark:text-white">Thời gian:</p>
              <p className="dark:text-gray-300">{warranty.duration}</p>
            </div>
            <p className="font-semibold dark:text-white">Điều khoản:</p>

            <div
              className="prose overflow-hidden dark:prose-invert"
              style={{
                maxHeight: showFullWarranty ? "none" : "120px",
                transition: "max-height 0.3s ease",
                color: "inherit",
              }}
              dangerouslySetInnerHTML={{ __html: warranty.terms }}
            />

            <button
              onClick={() => setShowFullWarranty(!showFullWarranty)}
              className="text-blue-500 hover:underline mt-2"
              type="button"
            >
              {showFullWarranty ? "Thu gọn" : "Xem thêm"}
            </button>
          </div>
        )}

        {blog && (
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center dark:text-white">
              <FaInfoCircle className="mr-2 text-orange-600" />
              Bài viết liên quan
            </h3>
            <div className="space-y-2 mt-2">
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                {blog.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {blog.description}
              </p>

              {showFullBlog && (
                <div
                  className="prose mt-4 dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              )}

              <p className="text-sm text-gray-500 mt-4 dark:text-gray-400">
                Ngày xuất bản:{" "}
                {new Date(blog.publishedDate).toLocaleDateString()}
              </p>

              <div className="mt-2">
                <button
                  onClick={() => setShowFullBlog(!showFullBlog)}
                  className="text-blue-500 hover:underline"
                >
                  {showFullBlog ? "Thu gọn" : "Xem thêm"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center dark:text-white">
            <FaShoppingCart className="mr-2 text-purple-600" />
            Thông tin khác
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tổng số đã bán
              </p>
              <p className="dark:text-gray-200">{totalSold}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Loại sản phẩm
              </p>
              <p className="dark:text-gray-200">{visibilityType}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Mã sản phẩm
              </p>
              <p className="dark:text-gray-200">{productId}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Trạng thái
              </p>
              <p className="dark:text-gray-200">
                {status === "active" && "Hoạt động"}
                {status === "inactive" && "Không hoạt động"}
                {status === "coming soon" && "Sắp ra mắt"}
                {status === "out of stock" && "Hết hàng"}
              </p>
            </div>
          </div>
        </div>

        {ratings && (
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center dark:text-white">
              <FaStar className="mr-2 text-yellow-500" />
              Đánh giá
            </h3>
            <div className="flex items-center space-x-2">
              <p className="font-semibold dark:text-white">
                Tổng số lượt đánh giá:
              </p>
              <p className="dark:text-gray-200">{ratings.totalReviews}</p>
            </div>
            <p className="flex items-center">
              <span className="mr-2 font-semibold dark:text-white">
                Số sao trung bình:
              </span>
              {Array.from({ length: 5 }, (_, index) => {
                const isFullStar = index < Math.floor(ratings.average);
                const isHalfStar =
                  index === Math.floor(ratings.average) &&
                  ratings.average % 1 >= 0.5;

                return (
                  <span key={index} className="text-yellow-500">
                    {isFullStar ? (
                      <FaStar />
                    ) : isHalfStar ? (
                      <FaStarHalfAlt />
                    ) : (
                      <FaStar className="text-gray-300 dark:text-gray-600" />
                    )}
                  </span>
                );
              })}
            </p>
          </div>
        )}

        {variants && variants.length > 0 && (
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center dark:text-white">
              <FaRandom className="mr-2 text-gray-600" />
              Biến thể
            </h3>
            <table className="min-w-full table-auto mt-2 text-gray-900 dark:text-gray-200">
              <thead>
                <tr>
                  {variants[0].color?.trim() && (
                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Màu sắc
                    </th>
                  )}
                  {variants[0].hexCode?.trim() && (
                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Mã màu
                    </th>
                  )}
                  {variants[0].size?.trim() && (
                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Kích thước
                    </th>
                  )}
                  {variants[0].ram?.trim() && (
                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      RAM
                    </th>
                  )}
                  {variants[0].storage?.trim() && (
                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Bộ nhớ
                    </th>
                  )}
                  {variants[0].condition?.trim() && (
                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                      Tình trạng
                    </th>
                  )}
                  {variants[0].stock !== undefined &&
                    variants[0].stock !== "" && (
                      <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Số lượng tồn kho
                      </th>
                    )}
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    {variant.color?.trim() && (
                      <td className="px-4 py-2">{variant.color}</td>
                    )}
                    {variant.hexCode?.trim() && (
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <span
                            style={{ backgroundColor: variant.hexCode }}
                            className="w-6 h-6 rounded-full"
                          ></span>
                          <span>{variant.hexCode}</span>
                        </div>
                      </td>
                    )}
                    {variant.size?.trim() && (
                      <td className="px-4 py-2">{variant.size}</td>
                    )}
                    {variant.ram?.trim() && (
                      <td className="px-4 py-2">{variant.ram}</td>
                    )}
                    {variant.storage?.trim() && (
                      <td className="px-4 py-2">{variant.storage}</td>
                    )}
                    {variant.condition?.trim() && (
                      <td className="px-4 py-2">{variant.condition}</td>
                    )}
                    {variant.stock !== undefined && variant.stock !== "" && (
                      <td
                        className={`px-4 py-2 ${
                          parseInt(variant.stock) < 10 ? "text-red-500" : ""
                        }`}
                      >
                        {variant.stock}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto flex justify-between mt-4">
        <BackButton path="/product-list" />
        <button
          onClick={() => navigate(`/edit-product/${id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
            />
          </svg>
          <span>Chỉnh sửa sản phẩm</span>
        </button>

        {/* Nút chỉnh sửa giá */}
        <button
          onClick={() => navigate(`/edit-price-product/${id}`)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 17.345a4.76 4.76 0 0 0 2.558 1.618c2.274.589 4.512-.446 4.999-2.31.487-1.866-1.273-3.9-3.546-4.49-2.273-.59-4.034-2.623-3.547-4.488.486-1.865 2.724-2.899 4.998-2.31.982.236 1.87.793 2.538 1.592m-3.879 12.171V21m0-18v2.2"
            />
          </svg>
          <span>Chỉnh sửa giá</span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
