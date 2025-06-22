import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  FaShoppingCart,
  FaStar,
  FaTag,
  FaPlay,
  FaBoxOpen,
  FaRegStar,
  FaInfoCircle,
  FaArrowLeft,
  FaArrowRight,
  FaClipboardList,
  FaBlog,
  FaShieldAlt,
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
  FaPaperPlane,
  FaMinus,
  FaPlus,
  FaShareAlt,
} from "react-icons/fa";
import { PiMoneyWavyDuotone } from "react-icons/pi";
import { toast, ToastContainer } from "react-toastify";
import Breadcrumb from "../components/Breadcrumb";
import { FaHome } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import useProducts from "../hooks/useProducts";
import useBrands from "../hooks/useBrands";
import useReviews from "../hooks/useReviews";
import ReviewItem from "../components/Item/ReviewItem";
import useQAs from "../hooks/useQAs";
import QAItem from "../components/Item/QAItem";
import Pagination from "../components/Pagination";
import Cookies from "js-cookie";
import EditQAForm from "../components/EditQAForm";
import ConfirmModal from "../components/Modal/ConfirmModal";
import EditReviewModal from "../components/Modal/EditReviewModal";
import { addItemToGuestCart } from "../utils/cartUtils";
import useCart from "../hooks/useCart";
import ProductCarousel from "../components/Carousel/ProductCarousel";
import SocialShare from "../components/SocialShare";

const ProductDetail = () => {
  const { productId } = useParams();
  const location = useLocation();
  const userId = Cookies.get("userId");
  const isLoggedIn = !!Cookies.get("accessToken");
  const { productDetail, fetchProductByProductId, detailLoading, detailError } =
    useProducts();
  const productUrl = `${window.location.origin}/product-details/${productDetail?.productId}`;
  const productTitle = productDetail?.productName;
  const { cart, fetchCart, addItem } = useCart(userId);
  const { brands } = useBrands();
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    uploadImage,
    deleteReview,
    updateReview,
  } = useReviews(productDetail?.id);
  const {
    qas,
    loading,
    error,
    createQA,
    updateQA,
    deleteQA,
    addFollowUpQuestion,
    deleteFollowUpQuestion,
  } = useQAs(productDetail?.id);
  const [newQA, setNewQA] = useState("");
  const [editingQA, setEditingQA] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
  const [selectedFollowUpToDelete, setSelectedFollowUpToDelete] =
    useState(null);

  const [editingReview, setEditingReview] = useState(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const descRef = useRef(null);

  const toggleDescription = () => setIsExpanded(!isExpanded);
  const brand = brands.find((b) => b.id === productDetail?.brandId);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedTab, setSelectedTab] = useState("specifications");
  const [mediaType, setMediaType] = useState("image");
  const [currentGroup, setCurrentGroup] = useState(0);

  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const reviewsPerPage = 3;
  const indexOfLastReview = currentReviewPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages_Reviews = Math.ceil(reviews.length / reviewsPerPage);

  const [currentQAPage, setCurrentQAPage] = useState(1);
  const qasPerPage = 3;
  const indexOfLastQA = currentQAPage * qasPerPage;
  const indexOfFirstQA = indexOfLastQA - qasPerPage;
  const currentQAs = qas.slice(indexOfFirstQA, indexOfLastQA);

  const totalPages_QAs = Math.ceil(qas.length / qasPerPage);

  useEffect(() => {
    if (productId) fetchProductByProductId(productId);
  }, [productId]);

  useEffect(() => {
    if (userId) {
      fetchCart();
    }
  }, [userId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  useEffect(() => {
    if (descRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(descRef.current).lineHeight
      );
      const maxHeight = lineHeight * 5;

      if (descRef.current.scrollHeight > maxHeight) {
        setShowToggle(true);
      }
    }
  }, [productDetail?.description]);

  useEffect(() => {
    if (productDetail) {
      setSelectedVariant(productDetail.variants?.[0]);
      setSelectedMedia(productDetail.images?.[0]);
      setMediaType("image");
    }
  }, [productDetail]);

  const showToast = (message, type = "info") => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  if (detailLoading)
    return (
      <div className="p-10 text-center text-lg">
        Đang tải dữ liệu sản phẩm...
      </div>
    );
  if (detailError || !productDetail)
    return (
      <div className="p-10 text-center text-red-600">
        Không thể tải sản phẩm.
      </div>
    );

  const allMedia = [
    ...(productDetail.images || []),
    ...(productDetail.videos || []),
  ];
  const totalMediaGroups = Math.ceil(allMedia.length / 3);

  const currentMediaGroup = allMedia.slice(
    currentGroup * 3,
    (currentGroup + 1) * 3
  );

  const handleMediaChange = (media, type) => {
    setMediaType(type);
    setSelectedMedia(media);
  };

  const handleNext = () => {
    if (currentGroup < totalMediaGroups - 1) setCurrentGroup(currentGroup + 1);
  };

  const handlePrev = () => {
    if (currentGroup > 0) setCurrentGroup(currentGroup - 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(selectedVariant?.stock || 1, prev + 1));
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || quantity < 1) return;

    const itemDTO = {
      productId: productDetail?.id,
      variantId: selectedVariant.variantId,
      brandId: productDetail?.brandId,
      categoryId: productDetail?.categoryId,
      quantity: quantity,
      totalPrice:
        quantity *
        (productDetail?.pricing.current || productDetail?.pricing.original),
      productName: productDetail?.name,
      originalPrice: productDetail?.pricing.original,
      discountPrice: productDetail?.pricing.current,
      ratingAverage: productDetail?.ratingAverage || 0,
      totalReviews: productDetail?.totalReviews || 0,
      productImage: productDetail?.images?.[0] || "",
      color: selectedVariant.color,
      hexCode: selectedVariant.hexCode,
      size: selectedVariant.size,
      ram: selectedVariant.ram,
      storage: selectedVariant.storage,
      condition: selectedVariant.condition,
      stock: selectedVariant.stock || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isLoggedIn) {
      if (!cart?.id) {
        await fetchCart();
      }

      if (cart?.id) {
        addItem(cart.id, itemDTO);
        showToast("Đã thêm sản phẩm vào giỏ hàng", "success");
      } else {
        console.error("Không thể thêm vào giỏ hàng: cart chưa sẵn sàng");
      }
    } else {
      addItemToGuestCart(productDetail, selectedVariant, quantity);
      showToast("Đã thêm sản phẩm vào giỏ hàng", "success");
    }
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const handleSubmitQA = async () => {
    if (!newQA.trim()) return;

    const qaData = {
      productId: productDetail?.id,
      userId: userId,
      questionAnswers: [
        {
          question: newQA.trim(),
        },
      ],
    };

    try {
      await createQA(qaData);
      setNewQA("");
      showToast("Gửi câu hỏi thành công!", "success");
    } catch (err) {
      if (
        err.response &&
        err.response.status === 400 &&
        err.response.data.reasons
      ) {
        const reasons = err.response.data.reasons.join("; ");
        showToast(`Gửi câu hỏi thất bại: ${reasons}`, "error");
      } else {
        showToast("Gửi câu hỏi thất bại!", "error");
      }
    }
  };

  const handleEdit = (qa, options = {}) => {
    setEditingQA({ qa, isFollowUp: options.followUp });
  };

  const handleDeleteQA = (qaId) => {
    setConfirmType("qa");
    setSelectedIdToDelete(qaId);
    setShowConfirmModal(true);
  };

  const handleDeleteFollowUp = (qaId, followUpQuestionId) => {
    setSelectedFollowUpToDelete({ qaId, followUpQuestionId });
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (selectedIdToDelete && confirmType === "qa") {
        await deleteQA(selectedIdToDelete);
        showToast("Đã xoá câu hỏi thành công!", "success");
        setSelectedIdToDelete(null);
      } else if (selectedFollowUpToDelete) {
        const { qaId, followUpQuestionId } = selectedFollowUpToDelete;
        await deleteFollowUpQuestion(qaId, followUpQuestionId);
        showToast("Đã xoá câu hỏi tiếp theo thành công!", "success");
        setSelectedFollowUpToDelete(null);
      } else if (selectedIdToDelete && confirmType === "review") {
        await deleteReview(selectedIdToDelete);
        showToast("Đã xoá đánh giá thành công!", "success");
        setSelectedIdToDelete(null);
      }
      setShowConfirmModal(false);
      setConfirmType(null);
    } catch (error) {
      showToast("Xoá thất bại!", "error");
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setSelectedIdToDelete(null);
    setConfirmType(null);
  };

  const handleUpdateReview = async (updatedReviewData) => {
    try {
      await updateReview(updatedReviewData.id, updatedReviewData);
      showToast("Cập nhật đánh giá thành công!", "success");
      setEditingReview(null);
    } catch (error) {
      showToast("Cập nhật đánh giá thất bại!", "error");
    }
  };

  const handleDeleteReview = (reviewId) => {
    setConfirmType("review");
    setSelectedIdToDelete(reviewId);
    setShowConfirmModal(true);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
  };

  const handleCloseEditModal = () => {
    setEditingReview(null);
  };

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: FaHome },
    {
      label: "Chi tiết sản phẩm",
      href: `/product-details/${productDetail.name}`,
      icon: AiFillProduct,
    },
  ];

  const tabItems = [
    { key: "specifications", label: "Thông số", icon: <FaClipboardList /> },
    { key: "blog", label: "Bài viết", icon: <FaBlog /> },
    { key: "warranty", label: "Bảo hành", icon: <FaShieldAlt /> },
    { key: "reviews", label: "Đánh giá", icon: <FaStar /> },
    { key: "qa", label: "Q&A", icon: <FaQuestionCircle /> },
  ];

  return (
    <>
      <ToastContainer />
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex justify-center items-center bg-gray-100 dark:bg-neutral-700 p-4 md:p-8">
        <div className="max-w-7xl mx-auto p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Media Hiển thị Chính */}
            <div className="space-y-6">
              <div className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-md flex justify-center items-center overflow-hidden">
                {mediaType === "image" ? (
                  <img
                    src={selectedMedia}
                    alt="Selected Media"
                    className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <video
                    src={selectedMedia}
                    controls
                    className="w-full h-full rounded-xl object-contain"
                  />
                )}
              </div>

              {/* Điều hướng và thumbnails */}
              <div className="flex justify-between items-center mt-4">
                {/* Nút Prev */}
                <button
                  onClick={handlePrev}
                  disabled={currentGroup === 0}
                  className="p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 hover:bg-blue-500 hover:text-white rounded-full shadow transition-all duration-300 disabled:opacity-30"
                >
                  <FaArrowLeft />
                </button>

                {/* Thumbnails */}
                <div className="flex space-x-4 overflow-x-auto px-2 py-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {currentMediaGroup.map((media, index) => {
                    const isVideo = media.endsWith(".mp4");
                    const isSelected = selectedMedia === media;
                    const thumbnailSrc = isVideo
                      ? "/path/to/default-video-thumbnail.jpg"
                      : media;

                    return (
                      <div
                        key={index}
                        onClick={() =>
                          handleMediaChange(media, isVideo ? "video" : "image")
                        }
                        className={`relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 border-2 ${
                          isSelected ? "border-blue-500" : "border-transparent"
                        }`}
                      >
                        <img
                          src={thumbnailSrc}
                          alt={`Thumbnail ${index}`}
                          className="object-cover w-full h-full rounded-lg"
                        />
                        {isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <FaPlay className="text-white text-sm" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Nút Next */}
                <button
                  onClick={handleNext}
                  disabled={currentGroup === totalMediaGroups - 1}
                  className="p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 hover:bg-blue-500 hover:text-white rounded-full shadow transition-all duration-300 disabled:opacity-30"
                >
                  <FaArrowRight />
                </button>
              </div>
            </div>

            {/* Thông tin chi tiết sản phẩm */}
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 flex gap-3">
                <span className="line-clamp-2 leading-snug">
                  {productDetail.name}
                </span>
              </h1>

              <p className="text-lg text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mt-2 bg-indigo-50 dark:bg-indigo-900 px-3 py-1 rounded-md w-fit">
                <FaTag className="text-indigo-500" />
                Thương hiệu:
                <span className="font-semibold">{brand?.name}</span>
              </p>

              <div className="flex items-center gap-1 text-yellow-500 mt-2">
                {[...Array(5)].map((_, i) =>
                  i < productDetail.ratings.average ? (
                    <FaStar key={i} size={22} />
                  ) : (
                    <FaRegStar key={i} size={22} />
                  )
                )}
                <span className="ml-2 text-gray-700 dark:text-gray-300 text-lg font-medium">
                  {productDetail?.ratings?.average &&
                  typeof productDetail.ratings.average === "number"
                    ? productDetail.ratings.average.toFixed(1)
                    : "0.0"}{" "}
                  ({productDetail?.ratings?.totalReviews ?? 0} đánh giá)
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3 bg-red-50 dark:bg-red-900 p-3 rounded-lg shadow-sm w-fit">
                <PiMoneyWavyDuotone className="text-red-500" size={24} />
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(productDetail.pricing.current)}

                  <span className="line-through text-gray-500 dark:text-gray-400 text-lg ml-3">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(productDetail.pricing.original)}
                  </span>
                </p>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-500" />
                  Mô tả sản phẩm
                </h3>
                <p
                  ref={descRef}
                  className={`text-gray-700 dark:text-gray-300 mt-2 leading-relaxed transition-all duration-300 ${
                    isExpanded ? "" : "line-clamp-5"
                  }`}
                >
                  {productDetail.description}
                </p>
                {showToggle && (
                  <div className="flex justify-end">
                    <button
                      onClick={toggleDescription}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 underline underline-offset-2"
                    >
                      {isExpanded ? (
                        <FaChevronUp className="text-xs" />
                      ) : (
                        <FaChevronDown className="text-xs" />
                      )}
                      {isExpanded ? "Thu gọn" : "Xem thêm"}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                  <FaShareAlt className="text-green-500" size={22} />
                  Chia sẻ sản phẩm
                </h3>
                <SocialShare
                  productUrl={productUrl}
                  productTitle={productTitle}
                  productImage={productDetail?.images[0]}
                />
              </div>

              {/* Biến thể */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FaBoxOpen className="text-blue-500" />
                  Biến thể sản phẩm
                </h3>
                <div className="flex flex-wrap gap-3 mt-4">
                  {productDetail.variants.map((variant) => {
                    const isSelected =
                      variant.variantId === selectedVariant?.variantId;
                    const isOutOfStock = variant.stock === 0;

                    return (
                      <button
                        key={variant.variantId}
                        onClick={() => handleVariantChange(variant)}
                        disabled={isOutOfStock}
                        className={`px-5 py-2 rounded-full border-2 transition-all text-sm font-medium flex items-center gap-1
                ${
                  isSelected
                    ? "bg-blue-500 border-blue-500 text-white shadow-lg"
                    : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                }
                ${
                  isOutOfStock
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-blue-500 hover:bg-blue-700 hover:text-white"
                }`}
                      >
                        <span>{variant.color}</span>
                        <span
                          className={`text-xs ml-1 ${
                            isSelected
                              ? "text-gray-100"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          ({variant.stock} SP)
                        </span>
                        {isOutOfStock && (
                          <span className="text-red-500 ml-1 font-medium">
                            (Hết hàng)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Số lượng */}
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={decreaseQuantity}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <FaMinus className="text-gray-600 dark:text-gray-300" />
                </button>

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      const clamped = Math.min(
                        Math.max(value, 1),
                        selectedVariant?.stock || 1
                      );
                      setQuantity(clamped);
                    }
                  }}
                  className="w-16 h-10 text-center text-lg font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  min="1"
                  max={selectedVariant?.stock || 1}
                />

                <button
                  onClick={increaseQuantity}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  disabled={quantity >= selectedVariant?.stock}
                >
                  <FaPlus className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Thêm vào giỏ hàng */}
              <div className="mt-6">
                <button
                  onClick={handleAddToCart}
                  disabled={selectedVariant?.stock === 0}
                  className={`w-full flex items-center justify-center gap-2 py-3 text-white rounded-lg text-lg font-medium ${
                    selectedVariant?.stock > 0
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-400 cursor-not-allowed opacity-60"
                  }`}
                >
                  <FaShoppingCart />
                  {selectedVariant?.stock > 0
                    ? "Thêm vào giỏ hàng"
                    : "Hết hàng"}
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-10">
            {/* Tabs */}
            <div className="flex flex-wrap gap-4 border-b-2 dark:border-gray-600 pb-2">
              {tabItems.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all duration-300 text-lg font-medium
          ${
            selectedTab === tab.key
              ? "bg-blue-100 dark:bg-blue-900 text-blue-600 border-b-4 border-blue-600"
              : "text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800"
          }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm transition-all">
              {selectedTab === "specifications" && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                    <FaClipboardList className="text-blue-500" />
                    Thông số kỹ thuật
                  </h3>
                  <ul className="space-y-3">
                    {Object.entries(productDetail.specifications).map(
                      ([key, value]) => (
                        <li
                          key={key}
                          className="flex justify-between text-gray-700 dark:text-gray-300 border-b dark:border-gray-600 pb-2"
                        >
                          <span className="font-medium">{key}</span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {value}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {selectedTab === "blog" && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                    <FaBlog className="text-purple-500" />
                    {productDetail.blog.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    {productDetail.blog.description}
                  </p>
                  <div className="mt-4">
                    <p
                      className="text-gray-800 dark:text-gray-200 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: productDetail.blog.content,
                      }}
                    ></p>
                  </div>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    📅 Ngày đăng:{" "}
                    {new Date(
                      productDetail.blog.publishedDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}

              {selectedTab === "warranty" && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                    <FaShieldAlt className="text-green-500" />
                    Bảo hành
                  </h3>
                  <div className="mt-2">
                    <p
                      className="text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{
                        __html: `Thời gian bảo hành sản phẩm: ${productDetail.warranty.duration} ${productDetail.warranty.terms}`,
                      }}
                    ></p>
                  </div>
                </div>
              )}

              {selectedTab === "reviews" && (
                <div className="mt-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-6">
                    <FaStar className="text-yellow-500" />
                    Đánh giá sản phẩm
                  </h3>

                  {reviewsLoading ? (
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Đang tải đánh giá...
                    </p>
                  ) : reviewsError ? (
                    <p className="text-red-500 text-sm">
                      Không thể tải đánh giá.
                    </p>
                  ) : reviews.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-300">
                      Chưa có đánh giá nào.
                    </p>
                  ) : (
                    currentReviews.map((review) => (
                      <ReviewItem
                        key={review.id}
                        review={review}
                        onEdit={handleEditReview}
                        onDelete={handleDeleteReview}
                      />
                    ))
                  )}

                  {totalPages_Reviews > 1 && (
                    <Pagination
                      currentPage={currentReviewPage}
                      totalPages={totalPages_Reviews}
                      onPageChange={(page) => setCurrentReviewPage(page)}
                    />
                  )}
                </div>
              )}

              {selectedTab === "qa" && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                    <FaQuestionCircle className="text-blue-400" />
                    Q&A
                  </h3>
                  {loading ? (
                    <p className="text-gray-600 dark:text-gray-300">
                      Đang tải câu hỏi...
                    </p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : qas.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-300">
                      Chưa có câu hỏi nào.
                    </p>
                  ) : (
                    currentQAs.map((qa) => (
                      <div key={qa.id}>
                        <QAItem
                          qa={qa}
                          onEdit={handleEdit}
                          onDelete={handleDeleteQA}
                          onDeleteFollowUp={handleDeleteFollowUp}
                        />
                        {editingQA?.qa?.id === qa.id && (
                          <EditQAForm
                            qa={editingQA.qa}
                            isFollowUp={editingQA.isFollowUp}
                            onCancel={() => setEditingQA(null)}
                            onSave={async (payload) => {
                              try {
                                if (editingQA.isFollowUp) {
                                  await addFollowUpQuestion(
                                    editingQA.qa.id,
                                    editingQA.qa.questionAnswers[0].questionId,
                                    payload
                                  );
                                  showToast(
                                    "Đã gửi câu hỏi tiếp theo!",
                                    "success"
                                  );
                                } else {
                                  await updateQA(payload.id, payload);
                                  showToast(
                                    "Cập nhật câu hỏi thành công!",
                                    "success"
                                  );
                                }
                                setEditingQA(null);
                              } catch (err) {
                                showToast(
                                  "Có lỗi xảy ra khi lưu thay đổi!",
                                  "error"
                                );
                              }
                            }}
                          />
                        )}
                      </div>
                    ))
                  )}

                  {totalPages_QAs > 1 && (
                    <Pagination
                      currentPage={currentQAPage}
                      totalPages={totalPages_QAs}
                      onPageChange={(page) => setCurrentQAPage(page)}
                    />
                  )}

                  {/* Form gửi câu hỏi */}
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <FaQuestionCircle className="text-blue-500" />
                      Gửi câu hỏi mới
                    </h4>

                    <form
                      className="space-y-6 mt-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmitQA();
                      }}
                    >
                      <div>
                        <label
                          htmlFor="question"
                          className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2"
                        >
                          Câu hỏi của bạn
                        </label>
                        <textarea
                          id="question"
                          name="question"
                          rows="4"
                          className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ease-in-out duration-300"
                          placeholder="Nhập câu hỏi của bạn..."
                          value={newQA}
                          onChange={(e) => setNewQA(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-md flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ease-in-out duration-300"
                      >
                        <FaPaperPlane className="text-white" />
                        Gửi câu hỏi
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ProductCarousel productDetail={productDetail} />
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={
          confirmType === "review"
            ? "Xác nhận xoá đánh giá"
            : "Xác nhận xoá câu hỏi"
        }
        message={
          confirmType === "review"
            ? "Bạn có chắc muốn xoá đánh giá này?"
            : "Bạn có chắc muốn xoá câu hỏi này?"
        }
      />
      {editingReview && (
        <EditReviewModal
          existingReview={editingReview}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateReview}
          uploadImage={uploadImage}
        />
      )}
    </>
  );
};

export default ProductDetail;
