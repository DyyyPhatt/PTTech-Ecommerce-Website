import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const getUserToken = () => localStorage.getItem("userToken");

const useEditReview = (reviewId) => {
  const [review, setReview] = useState({
    rating: 5,
    reviewTitle: "",
    review: "",
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const navigate = useNavigate();

  const getReviewById = async () => {
    const token = getUserToken();
    try {
      const response = await axios.get(
        `http://localhost:8081/api/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReview((prev) => ({
        ...prev,
        ...response.data,
      }));
    } catch (error) {
      console.error("Error fetching review:", error);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReview({ ...review, [name]: value });
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    setIsSubmitting(true);
    setErrors({});
    setShowErrorMessage(false);
    setShowSuccessMessage(false);

    const token = getUserToken();

    try {
      const response = await axios.put(
        `http://localhost:8081/api/reviews/${reviewId}`,
        review,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setIsSubmitting(false);
      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/review-list");
      }, 1500);
    } catch (error) {
      console.error("Error updating review:", error);
      setIsSubmitting(false);
      setErrors(error.response?.data || {});
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  useEffect(() => {
    if (reviewId) {
      getReviewById();
    }
  }, [reviewId]);

  return {
    review,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    getReviewById,
    handleChange,
    handleSubmit,
  };
};

export default useEditReview;
