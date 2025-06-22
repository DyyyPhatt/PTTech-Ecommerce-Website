import { useState } from "react";

const useAddPolicy = () => {
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
  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPolicy((prevPolicy) => ({
      ...prevPolicy,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("type", policy.type);
      formData.append("title", policy.title);
      formData.append("description", policy.description);
      formData.append("content", policy.content);

      const userToken = getUserToken();

      const response = await fetch("http://localhost:8081/api/policies", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi thêm chính sách.");
      }

      setPolicy({
        type: "",
        title: "",
        description: "",
        content: "",
        isActive: true,
      });

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      setErrors({ submit: err.message });
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    policy,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
  };
};

export default useAddPolicy;
