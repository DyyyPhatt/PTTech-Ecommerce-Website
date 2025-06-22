import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaUser, FaReply } from "react-icons/fa";
import BackButton from "../../components/BackButton";

const QADetail = () => {
  const { id: qaId } = useParams();
  const [qa, setQa] = useState(null);
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [answeringKey, setAnsweringKey] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({
    questionId: null,
    isFollowUp: false,
  });

  const showMessage = (type, message) => {
    if (type === "success") {
      setShowSuccessMessage(message);
      setTimeout(() => setShowSuccessMessage(""), 3000);
    } else if (type === "error") {
      setShowErrorMessage(message);
      setTimeout(() => setShowErrorMessage(""), 3000);
    }
  };

  const getToken = () => localStorage.getItem("userToken");
  const getAdminId = () => localStorage.getItem("userId");

  const handleDeleteAnswer = async (
    questionId,
    followUpQuestionId,
    isFollowUp = false
  ) => {
    const token = getToken();

    try {
      let url = `http://localhost:8081/api/qas/${qaId}/answer/${questionId}`;
      if (isFollowUp) {
        url = `http://localhost:8081/api/qas/${qaId}/follow-up/${followUpQuestionId}/answer`;
      }

      await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh
      const refreshed = await axios.get(
        `http://localhost:8081/api/qas/${qaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setQa(refreshed.data);
      showMessage("success", "Xóa câu trả lời thành công.");
    } catch (err) {
      console.error("Lỗi xóa câu trả lời:", err);
      showMessage("error", "Không thể xóa câu trả lời.");
    }
  };

  const handleUpdateAnswer = async (questionId, isFollowUp = false) => {
    const token = getToken();

    try {
      let url = `http://localhost:8081/api/qas/${qaId}/answer/${questionId}`;
      if (isFollowUp) {
        url = `http://localhost:8081/api/qas/${qaId}/follow-up/${questionId}/answer`;
      }

      const params = { newAnswer: answerText };

      await axios.put(url, null, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      const refreshed = await axios.get(
        `http://localhost:8081/api/qas/${qaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setQa(refreshed.data);
      setAnsweringKey(null);
      setAnswerText("");
      showMessage("success", "Cập nhật câu trả lời thành công.");
    } catch (err) {
      console.error("Lỗi cập nhật câu trả lời:", err);
      showMessage("error", "Không thể cập nhật câu trả lời.");
    }
  };

  useEffect(() => {
    const fetchQA = async () => {
      try {
        setLoading(true);
        const token = getToken();

        const res = await axios.get(`http://localhost:8081/api/qas/${qaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setQa(res.data);

        const userRes = await axios.get(
          `http://localhost:8081/api/users/${res.data.userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(userRes.data);

        const productRes = await axios.get(
          `http://localhost:8081/api/products/${res.data.productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProduct(productRes.data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu QA");
      } finally {
        setLoading(false);
      }
    };

    if (qaId) fetchQA();
  }, [qaId]);

  const handleSubmitAnswer = async (questionId, isFollowUp = false) => {
    const token = getToken();
    const adminId = getAdminId();

    try {
      setSubmitting(true);

      let url = `http://localhost:8081/api/qas/${qaId}/answer`;
      if (isFollowUp) {
        url = `http://localhost:8081/api/qas/${qaId}/follow-up/${questionId}/answer`;
      }

      await axios.post(url, null, {
        params: {
          answer: answerText,
          adminId: adminId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh QA data
      const refreshed = await axios.get(
        `http://localhost:8081/api/qas/${qaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setQa(refreshed.data);
      setAnsweringKey(null);
      setAnswerText("");
      showMessage("success", "Đã gửi câu trả lời thành công.");
    } catch (err) {
      console.error("Lỗi gửi câu trả lời:", err);
      showMessage("error", "Không thể gửi câu trả lời.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderAnswerSection = (qaItem, key, questionId, isFollowUp = false) => {
    const isAnswering = answeringKey === key;

    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border-l-4 border-red-500 p-4 ml-6">
        <div className="flex items-start gap-2">
          <FaUser className="mr-2 text-red-500" />
          <div className="w-full">
            <p className="text-sm text-gray-500 dark:text-white font-medium">
              Quản trị viên:
            </p>

            {qaItem.answered ? (
              isAnswering ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm"
                    placeholder="Nhập câu trả lời..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        qaItem.answered
                          ? handleUpdateAnswer(questionId, isFollowUp)
                          : handleSubmitAnswer(questionId, isFollowUp)
                      }
                      disabled={submitting}
                      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                      {submitting
                        ? "Đang gửi..."
                        : qaItem.answered
                        ? "Cập nhật"
                        : "Gửi trả lời"}
                    </button>

                    <button
                      onClick={() => {
                        setAnsweringKey(null);
                        setAnswerText("");
                      }}
                      className="text-gray-600 dark:text-gray-300 text-sm"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-base text-gray-800 dark:text-white">
                    {qaItem.answer}
                  </p>
                  <div className="flex gap-3 text-sm">
                    <button
                      onClick={() => {
                        setAnsweringKey(key);
                        setAnswerText(qaItem.answer || "");
                      }}
                      className="relative group text-yellow-600 hover:underline"
                    >
                      <svg
                        className="w-6 h-6 text-blue-500 dark:text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
                        />
                      </svg>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        Chỉnh sửa câu trả lời
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget({ questionId, isFollowUp });
                        setShowDeleteModal(true);
                      }}
                      className="relative group text-red-600 hover:underline"
                    >
                      <svg
                        className="w-6 h-6 text-red-500 dark:text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                        />
                      </svg>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        Xóa câu trả lời
                      </span>
                    </button>
                  </div>
                </div>
              )
            ) : isAnswering ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm"
                  placeholder="Nhập câu trả lời..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      qaItem.answered
                        ? handleUpdateAnswer(questionId, isFollowUp)
                        : handleSubmitAnswer(questionId, isFollowUp)
                    }
                    disabled={submitting}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                  >
                    {submitting
                      ? "Đang gửi..."
                      : qaItem.answered
                      ? "Cập nhật"
                      : "Gửi trả lời"}
                  </button>

                  <button
                    onClick={() => {
                      setAnsweringKey(null);
                      setAnswerText("");
                    }}
                    className="text-gray-600 dark:text-gray-300 text-sm"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAnsweringKey(key);
                  setAnswerText("");
                }}
                className="relative group mt-1 text-green-600 dark:text-green-400 text-sm hover:underline"
              >
                <FaReply className="w-5 h-5" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  Trả lời câu hỏi
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading)
    return <div className="text-center py-6">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="max-w-4xl mx-auto flex justify-center items-center space-x-4">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white text-center">
            Chi tiết hỏi đáp
          </h1>
        </div>

        <div className="mb-4">
          <BackButton path="/qa-list" />
        </div>

        {showSuccessMessage && (
          <div className="fixed top-4 right-4 p-4 bg-green-500 text-white rounded shadow-lg z-50">
            {showSuccessMessage}
          </div>
        )}

        {showErrorMessage && (
          <div className="fixed top-4 right-4 p-4 bg-red-500 text-white rounded shadow-lg z-50">
            {showErrorMessage}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <div className="text-lg font-medium text-gray-800 dark:text-white flex items-center">
              <FaUser className="mr-2 text-gray-500" />
              {user?.username}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Sản phẩm:{" "}
              <span className="font-medium dark:text-white">
                {product?.name}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {qa.questionAnswers.map((qaItem, idx) => (
              <div key={qaItem.questionId || idx} className="space-y-4">
                {/* Câu hỏi chính */}
                <div className="bg-white dark:bg-gray-700 shadow border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <FaUser className="text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        {user?.username || "Người dùng"}
                      </p>
                      <p className="text-base text-gray-900 dark:text-white font-medium">
                        {qaItem.question}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trả lời câu hỏi chính */}
                {renderAnswerSection(
                  qaItem,
                  `main-${idx}`,
                  qaItem.questionId,
                  false
                )}

                {/* Follow-up questions */}
                {qaItem.followUpQuestions?.length > 0 && (
                  <div className="ml-8 space-y-4">
                    {qaItem.followUpQuestions.map((followUp, fIdx) => (
                      <div
                        key={`followup-${idx}-${fIdx}`}
                        className="space-y-2"
                      >
                        <div className="bg-white dark:bg-gray-700 shadow rounded-xl border border-gray-200 dark:border-gray-600 p-4">
                          <div className="flex items-start gap-2">
                            <FaUser className="text-blue-600 mt-1" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-300">
                                {user?.username}
                              </p>
                              <p className="text-base text-gray-800 dark:text-white font-medium">
                                {followUp.question}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Trả lời follow-up */}
                        {renderAnswerSection(
                          followUp,
                          `followup-${idx}-${fIdx}`,
                          followUp.questionId,
                          true
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {showDeleteModal && (
          <ConfirmDeleteModal
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={() => {
              const { questionId, isFollowUp } = deleteTarget;
              handleDeleteAnswer(questionId, questionId, isFollowUp);
              setShowDeleteModal(false);
            }}
          />
        )}

        <div className="mt-4">
          <BackButton path="/qa-list" />
        </div>
      </div>
    </div>
  );
};

export default QADetail;

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">Xác nhận xóa</h2>
        <p className="text-gray-700 mb-6">
          Bạn có chắc chắn muốn xóa câu trả lời này không?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};
