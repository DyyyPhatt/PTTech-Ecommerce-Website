import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import {
  validateEmail,
  validatePhone,
  validatePassword,
} from "../utils/validationRules";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useProfileEdit = () => {
  const userId = Cookies.get("userId");
  const token = Cookies.get("accessToken");
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone: "",
    avatar: "",
    avatarFile: null,
    previousAvatar: "",
    street: "",
    communes: "",
    district: "",
    city: "",
    country: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    subscribedToEmails: false,
    verified: false,
    verificationToken: "",
    verificationExpiry: null,
    deleted: false,
    blocked: false,
    blockReason: "",
    roles: [],
    createdAt: null,
    updatedAt: null,
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    phone: "",
    street: "",
    communes: "",
    district: "",
    city: "",
    country: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:8081/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;

        setProfileData((prev) => ({
          ...prev,
          username: data.username || "",
          email: data.email || "",
          phone: data.phoneNumber || "",
          avatar: data.avatar || "",
          previousAvatar: data.avatar || "",
          avatarFile: null,
          street: data.address?.street || "",
          communes: data.address?.communes || "",
          district: data.address?.district || "",
          city: data.address?.city || "",
          country: data.address?.country || "",
          password: "",
          newPassword: "",
          confirmPassword: "",
          subscribedToEmails: data.isSubscribedToEmails || false,
          verified: data.isVerified || false,
          verificationToken: data.verificationToken || null,
          verificationExpiry: data.verificationExpiry || null,
          deleted: data.isDeleted || false,
          blocked: data.isBlocked || false,
          blockReason: data.blockReason || "",
          roles: data.roles || [],
          createdAt: data.createdAt || null,
          updatedAt: data.updatedAt || null,
        }));
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
        toast.error("Không thể tải thông tin người dùng.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, token]);

  const updateUserProfile = async () => {
    try {
      setIsLoading(true);

      if (profileData.avatarFile) {
        const isDefaultAvatar =
          profileData.previousAvatar ===
          "http://localhost:8081/images/default-avatar.png";

        const isServerAvatar = profileData.previousAvatar?.startsWith(
          "http://localhost:8081/images/"
        );

        if (profileData.previousAvatar && isServerAvatar && !isDefaultAvatar) {
          await deleteOldAvatar();
        }

        const newAvatarUrl = await uploadNewAvatar();
        profileData.avatar = newAvatarUrl;
      }

      const updatedData = {
        username: profileData.username,
        email: profileData.email,
        phoneNumber: profileData.phone,
        avatar: profileData.avatar,
        address: {
          street: profileData.street,
          communes: profileData.communes,
          district: profileData.district,
          city: profileData.city,
          country: profileData.country,
        },
        verified: profileData.verified,
        verificationToken: profileData.verificationToken,
        verificationExpiry: profileData.verificationExpiry,
        deleted: profileData.deleted,
        blocked: profileData.blocked,
        blockReason: profileData.blockReason,
        roles: profileData.roles,
        subscribedToEmails: profileData.subscribedToEmails,
      };

      if (profileData.newPassword) {
        updatedData.password = profileData.newPassword;
      }

      const response = await axios.put(
        `http://localhost:8081/api/users/${userId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfileData((prev) => ({
        ...prev,
        password: "",
        newPassword: "",
        confirmPassword: "",
        avatarFile: null,
        previousAvatar: profileData.avatar,
      }));

      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      toast.error("Lỗi khi cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (!hasErrors) {
      updateUserProfile();
    } else {
      console.log("Form có lỗi, không thể gửi dữ liệu.");
    }
  };

  const deleteUserProfile = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:8081/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Cookies.remove("userId");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      navigate("/login");
      toast.success("Tài khoản đã được xóa thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      toast.error("Lỗi khi xóa tài khoản. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOldAvatar = async () => {
    try {
      await axios.delete(
        `http://localhost:8081/api/users/delete-avatar/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Lỗi khi xóa avatar cũ:", error);
      toast.error("Lỗi khi xóa avatar cũ.");
      throw error;
    }
  };

  const uploadNewAvatar = async () => {
    try {
      const formData = new FormData();
      formData.append("file", profileData.avatarFile);

      const response = await axios.post(
        `http://localhost:8081/api/users/upload-avatar/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi tải avatar mới lên:", error);
      toast.error("Lỗi khi tải avatar mới lên.");
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    validateForm(name, value);
  };

  const validateForm = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        error = validateEmail(value);
        break;
      case "phone":
        error = validatePhone(value);
        break;
      case "newPassword":
        error = validatePassword(value);
        break;
      case "confirmPassword":
        error =
          value !== profileData.newPassword
            ? "Mật khẩu xác nhận không khớp."
            : "";
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setProfileData((prev) => ({
          ...prev,
          avatar: reader.result, // Preview
          avatarFile: file, // Actual file
        }));
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return {
    profileData,
    errors,
    showPassword,
    isLoading,
    handleChange,
    handleSubmit,
    handleImageChange,
    togglePasswordVisibility,
    deleteUserProfile,
  };
};

export default useProfileEdit;
