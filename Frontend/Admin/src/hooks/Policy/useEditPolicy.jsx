import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useEditPolicy = (id) => {
  const [policy, setPolicy] = useState({
    type: "",
    title: "",
    description: "",
    content: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const navigate = useNavigate();

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const getPolicyById = async () => {
    const userToken = getUserToken();
    try {
      const response = await axios.get(
        `http://localhost:8081/api/policies/${id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      setPolicy(response.data);
    } catch (error) {
      console.error("Error fetching policy:", error);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setPolicy((prevPolicy) => ({
      ...prevPolicy,
      [name]: name === "isActive" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("type", policy.type);
    formData.append("title", policy.title);
    formData.append("description", policy.description);
    formData.append("content", policy.content);

    const userToken = getUserToken();

    try {
      const response = await axios.put(
        `http://localhost:8081/api/policies/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.status !== 200) throw new Error("Cập nhật không thành công");

      setIsSubmitting(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/policy-list");
      }, 3000);
    } catch (error) {
      setErrors(error.response?.data || { api: error.message });
      setIsSubmitting(false);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  useEffect(() => {
    if (id) {
      getPolicyById();
    }
  }, [id]);

  return {
    policy,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
    getPolicyById,
  };
};

export default useEditPolicy;
