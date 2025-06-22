// hooks/useRegisterForm.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
} from "../utils/validationRules";

const useRegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = (name, value) => {
    let error = "";
    switch (name) {
      case "firstName":
        error = validateFirstName(value);
        break;
      case "lastName":
        error = validateLastName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "phoneNumber":
        error = validatePhone(value);
        break;
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

  const isFormValid = (agreedToTerms) => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phoneNumber &&
      formData.password &&
      formData.confirmPassword &&
      agreedToTerms
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

  const handleSubmitForm = async (agreedToTerms) => {
    setIsLoading(true);

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      validateForm(key, formData[key]);
      newErrors[key] = errors[key];
    });

    const hasErrors = Object.values(newErrors).some((err) => err !== "");
    if (hasErrors || !agreedToTerms) {
      showToast("Vui lòng sửa lỗi trước khi tiếp tục.", "error");
      setIsLoading(false);
      return false;
    }

    try {
      const username = `${formData.firstName} ${formData.lastName}`;
      const response = await axios.post(
        "http://localhost:8081/api/users/register",
        { ...formData, username }
      );

      if (response.data) {
        showToast("Đăng ký thành công!", "success");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
        return true;
      }
    } catch (error) {
      showToast("Đăng ký thất bại. Vui lòng thử lại.", "error");
      console.error("Register error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    const { credential } = response;
    try {
      const res = await axios.post(
        "http://localhost:8081/api/users/google-login",
        { tokenId: credential }
      );
      if (res.data.token) {
        localStorage.setItem("userToken", res.data.token);
        showToast("Đăng ký với Google thành công!", "success");
        navigate("/");
      }
    } catch (err) {
      console.error("Google login error:", err);
      showToast("Đăng ký với Google thất bại!", "error");
    }
  };

  // Hàm xử lý lỗi khi đăng ký Google
  const handleGoogleFailure = (error) => {
    console.error("Google Register Error:", error);
    showToast("Không thể đăng ký bằng Google!", "error");
  };

  const handleFacebookLogin = async (response) => {
    const { accessToken } = response;
    if (!accessToken) {
      showToast("Không thể đăng ký bằng Facebook!", "error");
      return;
    }
    try {
      const res = await axios.post(
        `http://localhost:8081/api/users/facebook-login?accessToken=${accessToken}`
      );
      if (res.data.token) {
        localStorage.setItem("userToken", res.data.token);
        showToast("Đăng ký với Facebook thành công!", "success");
        navigate("/");
      }
    } catch (err) {
      console.error("Facebook login error:", err);
      showToast("Đăng ký với Facebook thất bại!", "error");
    }
  };

  return {
    formData,
    errors,
    isLoading,
    handleChange,
    isFormValid,
    handleSubmitForm,
    handleGoogleSuccess,
    handleGoogleFailure,
    handleFacebookLogin,
  };
};

export default useRegisterForm;
