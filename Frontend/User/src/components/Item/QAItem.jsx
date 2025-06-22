import React from "react";
import {
  FaCheck,
  FaRegQuestionCircle,
  FaTimesCircle,
  FaUserEdit,
  FaTrashAlt,
} from "react-icons/fa";
import useUser from "../../hooks/useUsers";
import Cookies from "js-cookie";

const QAItem = ({ qa, onEdit, onDelete, onDeleteFollowUp }) => {
  const { user } = useUser(qa.userId);
  const currentUserId = Cookies.get("userId");
  const isOwner = currentUserId === qa.userId;

  return (
    <div className="mb-6 p-6 border border-gray-200 rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {user?.username || "Người dùng ẩn danh"}
              {isOwner && (
                <span className="ml-2 text-xs text-blue-500 dark:text-blue-400 font-normal">
                  (Bạn)
                </span>
              )}
            </p>
            {qa.questionAnswers?.[0]?.question && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <FaRegQuestionCircle className="mr-2" />
                <span>{qa.questionAnswers[0].question}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {qa.createdAt
            ? new Date(qa.createdAt).toLocaleDateString("vi-VN")
            : ""}
        </div>
      </div>

      {isOwner && (
        <div className="flex justify-end gap-4 mt-2 text-sm text-gray-700 dark:text-gray-300">
          <button
            onClick={() => onEdit(qa)}
            title="Chỉnh sửa"
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500 transition"
          >
            <FaUserEdit />
            <span>Chỉnh sửa</span>
          </button>
          <button
            onClick={() => onDelete(qa.id)}
            title="Xoá"
            className="flex items-center gap-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600 transition"
          >
            <FaTrashAlt />
            <span>Xoá</span>
          </button>
        </div>
      )}

      {qa.questionAnswers?.[0]?.answered && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 dark:border-blue-400 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <span className="font-medium">Câu trả lời từ người bán:</span>
            <span className="ml-2">{qa.questionAnswers[0].answer}</span>
          </p>
          <div className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center">
            <FaCheck className="mr-1" /> Đã trả lời
          </div>

          {isOwner && (
            <div className="text-right">
              <button
                onClick={() => onEdit(qa, { followUp: true })}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-500 transition"
              >
                + Hỏi tiếp người bán
              </button>
            </div>
          )}
        </div>
      )}

      {qa.questionAnswers?.[0]?.followUpQuestions?.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            Câu hỏi tiếp theo:
          </p>

          {qa.questionAnswers[0].followUpQuestions.map((followUp, index) => (
            <div
              key={index}
              className="relative ml-6 mt-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
            >
              <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center mb-1">
                <FaRegQuestionCircle className="mr-2 text-gray-500 dark:text-gray-400" />
                <span className="font-medium">{followUp.question}</span>
              </div>

              {followUp.answered ? (
                <div className="mt-1 text-sm text-blue-800 dark:text-blue-300">
                  <span className="font-medium">Trả lời:</span>{" "}
                  {followUp.answer}
                  <div className="text-green-600 dark:text-green-400 mt-1 flex items-center text-xs">
                    <FaCheck className="mr-1" /> Đã trả lời vào{" "}
                    {new Date(followUp.answeredAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <FaTimesCircle className="mr-1 text-red-500 dark:text-red-400" />
                  <span>Chưa được trả lời</span>
                </div>
              )}

              {isOwner && (
                <button
                  onClick={() => onDeleteFollowUp(qa.id, followUp.questionId)}
                  className="absolute flex items-center gap-1 top-3 right-3 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600"
                  title="Xoá"
                >
                  <FaTrashAlt />
                  <span>Xoá</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QAItem;
