import { useState, useEffect } from "react";
import axios from "axios";
import { validatePassword } from "../../utils/validationRules";

const getUserToken = () => {
  return localStorage.getItem("userToken");
};

export const useResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const token = new URLSearchParams(window.location.search).get("token");
  const userToken = getUserToken();

  useEffect(() => {
    if (!token) {
      setError("Token không hợp lệ.");
    }
  }, [token]);

  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setError("");
    setIsSuccess(false);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:8081/api/users/reset-password`,
        null,
        {
          params: {
            token,
            newPassword: password,
          },
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err) {
      if (err.response) {
        setError(err.response.data);
      } else {
        setError("Không thể kết nối đến server.");
      }
      setIsLoading(false);
    }
  };

  return {
    password,
    confirmPassword,
    error,
    isSuccess,
    isLoading,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
  };
};
