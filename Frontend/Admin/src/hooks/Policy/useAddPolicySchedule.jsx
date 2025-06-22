import { useState } from "react";

const useAddPolicySchedule = () => {
  const [policy, setPolicy] = useState({
    type: "",
    title: "",
    description: "",
    content: "",
    scheduledDate: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const convertUtcToLocalFormat = (utcDate) => {
    if (!utcDate) return "";

    const localDate = new Date(utcDate);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const convertLocalToUtc = (localDate) => {
    const date = new Date(localDate);
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return utcDate.toISOString().slice(0, -1) + "+07:00";
  };

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "scheduledDate") {
      const formattedDate = convertLocalToUtc(value);
      setPolicy((prevPolicy) => ({
        ...prevPolicy,
        scheduledDate: formattedDate,
      }));
    } else {
      setPolicy((prevPolicy) => ({
        ...prevPolicy,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    setIsSubmitting(true);

    const policyData = {
      type: policy.type,
      title: policy.title,
      description: policy.description,
      content: policy.content,
      scheduledDate: policy.scheduledDate,
    };

    const userToken = getUserToken();

    try {
      const response = await fetch(
        "http://localhost:8081/api/policies/schedule-create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(policyData),
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      console.log("Thêm lịch tạo chính sách thành công:", result);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      setErrors({ api: error.message });
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
    uploading,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
    convertUtcToLocalFormat,
  };
};

export default useAddPolicySchedule;
