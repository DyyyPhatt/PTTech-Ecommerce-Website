import { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Dữ liệu gửi đi:", { email, password });

    try {
      const response = await axios.post(
        `http://localhost:8081/api/users/login`,
        {},
        {
          params: { email, password },
        }
      );

      console.log("Phản hồi từ server: ", response);

      if (response.data && response.data.accessToken) {
        console.log(
          "AccessToken nhận được từ server: ",
          response.data.accessToken
        );

        const decodedToken = jwtDecode(response.data.accessToken);
        console.log("Decoded Token: ", decodedToken);

        const roles = decodedToken.roles || [];
        console.log("Roles từ decoded token: ", roles);

        const allowedRoles = [
          "ADMIN",
          "MANAGER",
          "CUSTOMER_SUPPORT",
          "INVENTORY_MANAGER",
          "MARKETING",
        ];
        const hasAccess = roles.some((role) => allowedRoles.includes(role));

        if (hasAccess) {
          localStorage.setItem("userToken", response.data.accessToken);
          localStorage.setItem("userId", response.data.userId);

          window.location.href = "/";
        } else {
          console.log("User không có quyền truy cập.");
          setError("Bạn không có quyền truy cập với tài khoản này.");
        }
      } else {
        console.log("Không nhận được accessToken từ server.");
        setError("Đăng nhập thất bại, vui lòng kiểm tra lại thông tin.");
      }
    } catch (err) {
      if (err.response) {
        console.error("Lỗi từ server: ", err.response);
        setError(`Đã có lỗi xảy ra: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        console.error("Lỗi yêu cầu: ", err.request);
        setError("Không thể kết nối đến server.");
      } else {
        console.error("Lỗi không xác định: ", err.message);
        setError("Đã có lỗi xảy ra trong quá trình đăng nhập.");
      }
    }
  };

  return {
    email,
    password,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  };
};
