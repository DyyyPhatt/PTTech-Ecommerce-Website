import React, { useState, useEffect } from "react";
import useUsers from "../../hooks/QA/useUsers";
import useProducts from "../../hooks/QA/useProducts";
import useAddQA from "../../hooks/QA/useAddQA";
import BackButton from "../BackButton";
import { useNavigate } from "react-router-dom";

const AddQAForm = () => {
  const { users, loading: loadingUsers } = useUsers();
  const { products, loading: loadingProducts } = useProducts();

  const [userSearch, setUserSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  const [questionText, setQuestionText] = useState("");
  const navigate = useNavigate();

  const { qaData, errors, loading, error, success, addQA, setQaData } =
    useAddQA();

  useEffect(() => {
    setQaData((prev) => ({
      ...prev,
      userId: selectedUserId,
      productId: selectedProductId,
      questionAnswers: questionText ? [{ question: questionText }] : [],
    }));
  }, [selectedUserId, selectedProductId, questionText, setQaData]);

  useEffect(() => {
    if (success) {
      setSelectedUserId("");
      setSelectedProductId("");
      setQuestionText("");
    }
  }, [success]);

  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (error) {
      setShowErrorMessage(true);
      const timer = setTimeout(() => setShowErrorMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      setShowSuccessMessage(true);

      setTimeout(() => {
        navigate("/qa-list");
      }, 1500);
    }
  }, [success, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    addQA();
  };

  return (
    <>
      {showErrorMessage && (
        <div
          className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-white bg-red-500 rounded-lg shadow-lg"
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-white bg-red-400 rounded-lg">
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0Zm1 14h-2v-2h2v2Zm0-4h-2V6h2v4Z" />
            </svg>
          </div>
          <div className="ml-3 text-sm font-normal dark:text-white">
            Thêm câu hỏi thất bại. Vui lòng thử lại!
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div
          className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:bg-gray-700 dark:text-green-200"
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
          </div>
          <div className="ml-3 text-sm font-normal dark:text-white">
            Câu hỏi đã được gửi thành công!
          </div>
        </div>
      )}
      <div className="mb-4">
        <BackButton path="/qa-list" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6"
      >
        <div>
          <label
            htmlFor="userSearch"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Người dùng
          </label>
          <input
            type="text"
            id="userSearch"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Tìm kiếm người dùng..."
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
          />
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
            required
          >
            <option value="">Chọn người dùng</option>
            {loadingUsers ? (
              <option>Đang tải...</option>
            ) : (
              users
                .filter((user) =>
                  (user.fullName || user.username || user.email)
                    .toLowerCase()
                    .includes(userSearch.toLowerCase())
                )
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.username || user.email}
                  </option>
                ))
            )}
          </select>
          {errors.userId && (
            <p className="text-red-500 text-sm mt-1">{errors.userId}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="productSearch"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Sản phẩm
          </label>
          <input
            type="text"
            id="productSearch"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
          />
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
            required
          >
            <option value="">Chọn sản phẩm</option>
            {loadingProducts ? (
              <option>Đang tải...</option>
            ) : (
              products
                .filter((product) =>
                  (product.name || product.title)
                    .toLowerCase()
                    .includes(productSearch.toLowerCase())
                )
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name || product.title}
                  </option>
                ))
            )}
          </select>
          {errors.productId && (
            <p className="text-red-500 text-sm mt-1">{errors.productId}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="question"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Câu hỏi
          </label>
          <textarea
            id="question"
            rows={4}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5"
            required
          />
          {errors.questionAnswers && (
            <p className="text-red-500 text-sm mt-1">
              {errors.questionAnswers}
            </p>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {loading ? "Đang gửi..." : "Gửi câu hỏi"}
          </button>
        </div>
      </form>
      <div className="mt-4">
        <BackButton path="/qa-list" />
      </div>
    </>
  );
};

export default AddQAForm;
