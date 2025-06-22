import { useState } from "react";
import axios from "axios";

export const useForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }

    try {
      const userToken = getUserToken();

      const response = await axios.post(
        "http://localhost:8081/api/users/forgot-password",
        null,
        {
          params: { email },
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      setSuccess(true);
      setError("");
    } catch (err) {
      if (err.response) {
        setError(`Đã có lỗi xảy ra: ${err.response.data}`);
      } else {
        setError("Không thể kết nối đến server.");
      }
      setSuccess(false);
    }
  };

  return {
    email,
    error,
    success,
    handleEmailChange,
    handleSubmit,
  };
};
