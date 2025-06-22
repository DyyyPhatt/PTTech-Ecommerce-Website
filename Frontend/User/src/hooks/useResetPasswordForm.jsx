import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  validatePassword,
  validateConfirmPassword,
} from "../utils/validationRules";

const useResetPasswordForm = (token) => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword((prev) => !prev);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword((prev) => !prev);
    }
  };

  const validateForm = (name, value) => {
    let error = "";
    switch (name) {
      case "password":
        error = validatePassword(value);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(formData.password, value);
        break;
      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateForm(name, value);
  };

  const isFormValid = () => {
    return (
      formData.password &&
      formData.confirmPassword &&
      !Object.values(errors).some((e) => e !== "")
    );
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

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      validateForm(key, formData[key]);
      newErrors[key] = errors[key];
    });

    const hasErrors = Object.values(newErrors).some((err) => err !== "");
    if (hasErrors || !token) {
      showToast("Vui lòng sửa lỗi trước khi tiếp tục.", "error");
      setIsLoading(false);
      return false;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/api/users/reset-password",
        null,
        {
          params: {
            token,
            newPassword: formData.password,
          },
        }
      );

      if (response.status === 200) {
        showToast("Đặt lại mật khẩu thành công!", "success");
        setTimeout(() => navigate("/login"), 3000);
        return true;
      } else {
        showToast("Đặt lại mật khẩu thất bại!", "error");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showToast(
        error.response?.data || "Đã xảy ra lỗi khi gửi yêu cầu.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  return {
    formData,
    errors,
    showPassword,
    showConfirmPassword,
    isLoading,
    handleChange,
    isFormValid,
    handleSubmitForm,
    togglePasswordVisibility,
  };
};

export default useResetPasswordForm;
