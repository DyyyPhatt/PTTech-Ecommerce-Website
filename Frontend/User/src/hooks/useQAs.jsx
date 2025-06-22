import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const useQAs = (productId) => {
  const token = Cookies.get("accessToken");
  const [qas, setQAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const fetchQAs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8081/api/qas/product/${productId}`
        );
        setQAs(response.data);
        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy Q&A:", err);
        setError("Không thể tải dữ liệu câu hỏi.");
      } finally {
        setLoading(false);
      }
    };

    fetchQAs();
  }, [productId]);

  const createQA = async (qaData) => {
    setCreateLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(
        "http://localhost:8081/api/qas",
        qaData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(true);
      setQAs((prevQAs) => [response.data, ...prevQAs]);
      return response.data;
    } catch (err) {
      console.error("Lỗi khi tạo câu hỏi:", err);
      throw err;
    } finally {
      setCreateLoading(false);
    }
  };

  const updateQA = async (id, updatedQA) => {
    try {
      const response = await axios.put(
        `http://localhost:8081/api/qas/${id}`,
        updatedQA,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setQAs((prevQAs) =>
        prevQAs.map((qa) => (qa.id === id ? response.data : qa))
      );
      return response.data;
    } catch (err) {
      console.error("Lỗi khi cập nhật QA:", err);
      setError("Không thể cập nhật câu hỏi.");
    }
  };

  const deleteQA = async (id) => {
    try {
      await axios.delete(`http://localhost:8081/api/qas/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQAs((prevQAs) => prevQAs.filter((qa) => qa.id !== id));
    } catch (err) {
      console.error("Lỗi khi xoá QA:", err);
      setError("Không thể xoá câu hỏi.");
    }
  };

  const addFollowUpQuestion = async (qaId, parentQuestionId, newQuestion) => {
    setFollowUpLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:8081/api/qas/${qaId}/question/${parentQuestionId}/follow-up`,
        null,
        {
          params: { newQuestion },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setQAs((prevQAs) =>
        prevQAs.map((qa) =>
          qa.id === qaId
            ? { ...qa, questionAnswers: response.data.questionAnswers }
            : qa
        )
      );
      return response.data;
    } catch (err) {
      console.error("Lỗi khi thêm câu hỏi follow-up:", err);
      setError("Không thể thêm câu hỏi tiếp theo.");
    } finally {
      setFollowUpLoading(false);
    }
  };

  const deleteFollowUpQuestion = async (qaId, followUpQuestionId) => {
    try {
      await axios.delete(
        `http://localhost:8081/api/qas/${qaId}/follow-up/${followUpQuestionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQAs((prevQAs) =>
        prevQAs.map((qa) => {
          if (qa.id !== qaId) return qa;

          const updatedQuestionAnswers = qa.questionAnswers.map((qaItem) => {
            return {
              ...qaItem,
              followUpQuestions: qaItem.followUpQuestions?.filter(
                (fup) => fup.questionId !== followUpQuestionId
              ),
            };
          });

          return { ...qa, questionAnswers: updatedQuestionAnswers };
        })
      );
    } catch (err) {
      console.error("Lỗi khi xoá câu hỏi tiếp theo:", err);
      setError("Không thể xoá câu hỏi tiếp theo.");
    }
  };

  return {
    qas,
    loading,
    error,
    success,
    createLoading,
    followUpLoading,
    createQA,
    updateQA,
    deleteQA,
    addFollowUpQuestion,
    deleteFollowUpQuestion,
  };
};

export default useQAs;
