import { useState } from "react";
import { FaSave, FaTimes, FaPenFancy } from "react-icons/fa";

const EditQAForm = ({ qa, isFollowUp, onCancel, onSave }) => {
  const [question, setQuestion] = useState(() => {
    if (isFollowUp) return "";
    return qa.questionAnswers[0]?.question || "";
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    if (isFollowUp) {
      onSave(question);
    } else {
      const updatedQA = { ...qa };
      updatedQA.questionAnswers[0].question = question;
      onSave(updatedQA);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700 shadow-xl transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full shadow text-blue-600 dark:text-blue-400">
          <FaPenFancy className="text-xl" />
        </div>
        <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 tracking-wide">
          {isFollowUp ? "Thêm câu hỏi tiếp theo" : "Chỉnh sửa câu hỏi"}
        </h2>
      </div>

      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Nội dung câu hỏi
      </label>
      <textarea
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-inner dark:shadow-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:outline-none transition duration-300 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900"
        rows={4}
        placeholder="Ví dụ: Sản phẩm này có bảo hành không?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        required
      />

      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition shadow-sm"
        >
          <FaTimes className="text-red-500" />
          Hủy
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md transition"
        >
          <FaSave />
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
};

export default EditQAForm;
