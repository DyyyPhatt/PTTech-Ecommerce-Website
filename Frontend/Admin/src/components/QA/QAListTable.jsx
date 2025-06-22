import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaReply } from "react-icons/fa";

const QAListTable = ({
  QAs,
  setQAs,
  selectedQAIds,
  handleToggleSelect,
  handleSelectAll,
  isAllSelected,
}) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState({
    success: false,
    message: "",
  });
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerContent, setAnswerContent] = useState("");
  const showToastMessage = (message) => {
    setShowSuccessMessage({ success: true, message });
    setTimeout(
      () => setShowSuccessMessage({ success: false, message: "" }),
      3000
    );
  };
  const handleAnswerClick = (qaId, questionId, isFollowUp, questionText) => {
    setCurrentQuestion({ qaId, questionId, isFollowUp, questionText });
    setShowAnswerModal(true);
  };

  const getDisplayQuestion = (qaItem) => {
    if (!qaItem.followUpQuestions || qaItem.followUpQuestions.length === 0) {
      return { question: qaItem, isFollowUp: false };
    }

    for (let follow of qaItem.followUpQuestions) {
      if (!follow.answered) {
        return { question: follow, isFollowUp: true };
      }
    }

    const lastFollowUp =
      qaItem.followUpQuestions[qaItem.followUpQuestions.length - 1];
    return { question: lastFollowUp, isFollowUp: true };
  };

  const submitAnswer = async () => {
    try {
      const token = getUserToken();
      const adminId = localStorage.getItem("userId");

      if (currentQuestion.isFollowUp) {
        const response = await axios.post(
          `http://localhost:8081/api/qas/${currentQuestion.qaId}/follow-up/${currentQuestion.questionId}/answer`,
          null,
          {
            params: {
              answer: answerContent,
              adminId: adminId,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setQAs((prev) =>
          prev.map((qa) => (qa.id === response.data.id ? response.data : qa))
        );
      } else {
        const response = await axios.post(
          `http://localhost:8081/api/qas/${currentQuestion.qaId}/answer`,
          null,
          {
            params: {
              answer: answerContent,
              adminId: adminId,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setQAs((prev) =>
          prev.map((qa) => (qa.id === response.data.id ? response.data : qa))
        );
      }

      setShowAnswerModal(false);
      setAnswerContent("");
      showToastMessage("Trả lời câu hỏi thành công.");
    } catch (error) {
      console.error("Lỗi khi gửi câu trả lời:", error);
    }
  };

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const fetchUserName = async (userId) => {
    const userToken = getUserToken();
    try {
      const response = await axios.get(
        `http://localhost:8081/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      return response.data.username;
    } catch (error) {
      console.error("Error fetching username:", error);
      return "N/A";
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const usernames = {};
      for (const QA of QAs) {
        if (!usernames[QA.userId]) {
          const username = await fetchUserName(QA.userId);
          usernames[QA.userId] = username;
        }
      }
      setUsers(usernames);
    };

    fetchUsers();
  }, [QAs]);

  const fetchProductName = async (id) => {
    const userToken = getUserToken();
    try {
      const response = await axios.get(
        `http://localhost:8081/api/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      return response.data.name;
    } catch (error) {
      console.error("Error fetching product:", error);
      return "N/A";
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const names = {};
      for (const QA of QAs) {
        if (!names[QA.productId]) {
          const name = await fetchProductName(QA.productId);
          names[QA.productId] = name;
        }
      }
      setProducts(names);
    };

    fetchProducts();
  }, [QAs]);

  const handleViewDetail = (id) => {
    navigate(`/qa-detail/${id}`);
  };

  return (
    <div>
      {showAnswerModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAnswerModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-white">
              {currentQuestion.isFollowUp
                ? "Trả lời câu hỏi phụ"
                : "Trả lời câu hỏi chính"}
            </h2>
            <textarea
              rows="4"
              className="w-full border rounded p-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="Nhập câu trả lời..."
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowAnswerModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded dark:bg-gray-600 dark:text-white"
              >
                Hủy
              </button>
              <button
                onClick={submitAnswer}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mt-4">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
          <tr>
            {" "}
            <th scope="col" className="px-6 py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th scope="col" className="px-6 py-3">
              Người đặt câu hỏi
            </th>
            <th scope="col" className="px-6 py-3">
              Sản phẩm
            </th>
            <th scope="col" className="px-6 py-3">
              Câu hỏi
            </th>
          </tr>
        </thead>
        <tbody>
          {QAs.map((QA) =>
            QA.questionAnswers.map((qaItem, index) => {
              const { question, isFollowUp } = getDisplayQuestion(qaItem);

              return (
                <tr
                  key={`${QA.id}-${question.questionId}`}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedQAIds.includes(QA.id)}
                      onChange={() => handleToggleSelect(QA.id)}
                    />
                  </td>
                  <td
                    className="px-6 py-4 relative dark:text-white"
                    onClick={() => handleViewDetail(QA.id)}
                  >
                    <span className="group relative cursor-pointer hover:text-blue-500 hover:underline">
                      {users[QA.userId] || "N/A"}
                      <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                        Xem chi tiết câu hỏi
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 dark:text-white">
                    {products[QA.productId] || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-semibold cursor-pointer relative group ${
                        question.answered
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                      onClick={() =>
                        !question.answered &&
                        handleAnswerClick(
                          QA.id,
                          question.questionId,
                          isFollowUp,
                          question.question
                        )
                      }
                    >
                      {question.question}
                      {!question.answered && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          Trả lời nhanh hỏi đáp
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        {showAnswerModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={() => setShowAnswerModal(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6 text-gray-700 dark:text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>

                <h2 className="text-lg font-semibold text-gray-800 dark:text-white ml-2">
                  Trả lời câu hỏi
                </h2>
              </div>

              {/* Câu hỏi */}
              <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-white">
                <p className="text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">
                  Câu hỏi:
                </p>
                <p className="text-base font-semibold">
                  {currentQuestion?.questionText || "Không có dữ liệu câu hỏi."}
                </p>
              </div>

              <textarea
                rows="5"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-800 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Nhập nội dung câu trả lời..."
              />

              <div className="flex justify-end mt-5 space-x-3">
                <button
                  onClick={() => setShowAnswerModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={submitAnswer}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        )}
      </table>
    </div>
  );
};

export default QAListTable;
