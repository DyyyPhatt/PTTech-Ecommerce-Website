import { useEffect, useState } from "react";
import { validateEmail, validatePassword } from "../utils/validationRules";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const useLoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Kiểm tra nếu đã login
  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token) navigate("/");
  }, [navigate]);

  const validateForm = (name, value) => {
    let error = "";
    if (name === "email") error = validateEmail(value);
    if (name === "password") error = validatePassword(value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateForm(name, value);
  };

  const isFormValid = () => {
    return formData.email && formData.password;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateForm(key, formData[key]);
    });

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) {
      showToast("Vui lòng sửa các lỗi trong form!", "error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/api/users/login",
        null,
        { params: formData, withCredentials: true }
      );

      const data = response.data;
      Cookies.set("userId", data.userId, { expires: 1 });
      Cookies.set("accessToken", data.accessToken, { expires: 1 });
      Cookies.set("refreshToken", data.refreshToken, { expires: 7 });

      showToast("Đăng nhập thành công!", "success");
      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data || "Đăng nhập thất bại. Vui lòng thử lại.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) return null;
    try {
      const res = await axios.post(
        "http://localhost:8081/api/users/refresh-token",
        { refreshToken },
        { withCredentials: true }
      );
      const token = res.data;
      Cookies.set("accessToken", token, { expires: 1 });
      return token;
    } catch (err) {
      console.error("Refresh token failed", err);
      return null;
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await axios.post(
        "http://localhost:8081/api/users/google-login",
        { tokenId: response.credential },
        { withCredentials: true }
      );
      Cookies.set("userId", res.data.userId, { expires: 1 });
      Cookies.set("accessToken", res.data.accessToken, { expires: 1 });
      Cookies.set("refreshToken", res.data.refreshToken, { expires: 7 });
      showToast("Đăng nhập với Google thành công!", "success");
      navigate("/");
    } catch (error) {
      showToast("Đăng nhập với Google thất bại!", "error");
    }
  };

  const handleFacebookLogin = async (response) => {
    const { accessToken } = response;
    if (!accessToken) {
      showToast("Không thể đăng nhập bằng Facebook!", "error");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8081/api/users/facebook-login?accessToken=${accessToken}`,
        null,
        { withCredentials: true }
      );
      Cookies.set("userId", res.data.userId, { expires: 1 });
      Cookies.set("accessToken", res.data.accessToken, { expires: 1 });
      Cookies.set("refreshToken", res.data.refreshToken, { expires: 7 });
      showToast("Đăng nhập với Facebook thành công!", "success");
      navigate("/");
    } catch (err) {
      showToast("Đăng nhập với Facebook thất bại!", "error");
      console.error(err);
    }
  };

  return {
    formData,
    errors,
    showPassword,
    isLoading,
    setShowPassword,
    handleChange,
    handleSubmit,
    isFormValid,
    handleGoogleSuccess,
    handleFacebookLogin,
    refreshAccessToken,
  };
};

export default useLoginForm;
