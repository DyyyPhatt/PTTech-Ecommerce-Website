import { useState } from "react";

const getUserToken = () => localStorage.getItem("userToken");

const useAddQA = () => {
  const [qaData, setQaData] = useState({
    productId: "",
    userId: "",
    questionAnswers: [
      {
        question: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQaData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionChange = (e, index = 0) => {
    const { value } = e.target;
    setQaData((prev) => {
      const updatedQA = [...prev.questionAnswers];
      updatedQA[index] = { ...updatedQA[index], question: value };
      return {
        ...prev,
        questionAnswers: updatedQA,
      };
    });
  };

  const validateQA = () => {
    const newErrors = {};
    if (!qaData.productId) newErrors.productId = "Vui lòng chọn sản phẩm";
    if (!qaData.userId) newErrors.userId = "Vui lòng chọn người dùng";
    if (
      !qaData.questionAnswers ||
      qaData.questionAnswers.length === 0 ||
      !qaData.questionAnswers[0].question.trim()
    )
      newErrors.question = "Vui lòng nhập câu hỏi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addQA = async () => {
    if (!validateQA()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const token = getUserToken();

      const response = await fetch("http://localhost:8081/api/qas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(qaData),
      });

      if (!response.ok) {
        let errorMessage = `Lỗi server: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          console.log("Lỗi phản hồi dạng text:", errorText);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Tạo Q&A thành công:", result);
      setSuccess(true);
    } catch (err) {
      console.error("Lỗi khi tạo Q&A:", err);
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return {
    qaData,
    errors,
    loading,
    error,
    success,
    handleChange,
    handleQuestionChange,
    addQA,
    setQaData,
  };
};

export default useAddQA;
