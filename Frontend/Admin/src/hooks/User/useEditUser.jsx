import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const useEditUser = (id) => {
  const navigate = useNavigate();
  const { id: userId } = useParams();

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    avatar: "",
    address: {
      street: "",
      communes: "",
      district: "",
      city: "",
      country: "",
    },
    roles: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const rolesList = [
    {
      id: "admin",
      label: "ADMIN",
      displayLabel: "Quản trị viên",
      permissions: [""],
    },
    {
      id: "manager",
      label: "MANAGER",
      displayLabel: "Quản lý",
      permissions: [""],
    },
    {
      id: "customer",
      label: "CUSTOMER",
      displayLabel: "Khách hàng",
      permissions: [""],
    },
    {
      id: "customer_support",
      label: "CUSTOMER_SUPPORT",
      displayLabel: "Hỗ trợ khách hàng",
      permissions: [""],
    },
    {
      id: "marketing",
      label: "MARKETING",
      displayLabel: "Chuyên viên marketing",
      permissions: [""],
    },
    {
      id: "inventory_manager",
      label: "INVENTORY_MANAGER",
      displayLabel: "Quản lý kho",
      permissions: [""],
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getUserToken();
        const response = await axios.get(
          `http://localhost:8081/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 3000);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setUserData((prevData) => ({
        ...prevData,
        avatar: files[0],
      }));
    } else if (name.includes("address")) {
      const addressField = name.split(".")[1];
      setUserData((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [addressField]: value,
        },
      }));
    } else {
      setUserData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    const role = rolesList.find((r) => r.id === value);

    if (role) {
      setUserData((prevData) => {
        let updatedRoles = [...prevData.roles];
        if (checked) {
          if (!updatedRoles.some((r) => r.roleName === role.label)) {
            updatedRoles.push({ roleName: role.label });
          }
        } else {
          updatedRoles = updatedRoles.filter((r) => r.roleName !== role.label);
        }

        return {
          ...prevData,
          roles: updatedRoles,
        };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      phoneNumber: userData.phoneNumber,
      avatar: userData.avatar,
      address: userData.address,
      roles: userData.roles,
    };

    try {
      const token = getUserToken();
      const response = await axios.put(
        `http://localhost:8081/api/users/${userId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          navigate("/user-list");
        }, 3000);
      } else {
        throw new Error("Có lỗi xảy ra khi cập nhật người dùng.");
      }
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
    userData,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    rolesList,
    handleChange,
    handleRoleChange,
    handleSubmit,
  };
};

export default useEditUser;
