import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { validateEmail } from "../utils/validationRules";

const useForgotPasswordForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    isAdmin: false,
    isMobile: false,
  });

  const [errors, setErrors] = useState({ email: "" });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (name, value) => {
    let error = "";
    if (name === "email") {
      error = validateEmail(value);
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    validateForm(name, val);
  };

  const isFormValid = () => {
    return formData.email && errors.email === "";
  };

  const showToast = (message, type = "info") => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleSubmitForm = async () => {
    setIsLoading(true);

    // Validate lại toàn bộ
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      validateForm(key, formData[key]);
      newErrors[key] = errors[key];
    });

    const hasErrors = Object.values(newErrors).some((err) => err !== "");
    if (hasErrors) {
      showToast("Vui lòng sửa lỗi trước khi tiếp tục.", "error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/api/users/forgot-password",
        null,
        {
          params: formData,
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        showToast(response.data, "success");
      } else {
        showToast("Gửi email thất bại.", "error");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      showToast(
        error.response?.data || "Đã xảy ra lỗi khi gửi yêu cầu.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    handleChange,
    isFormValid,
    handleSubmitForm,
  };
};

export default useForgotPasswordForm;
