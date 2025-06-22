import { useState } from "react";

const useAddUser = () => {
  const [user, setUser] = useState({
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

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setUser((prevData) => ({
        ...prevData,
        avatar: files[0],
      }));
    } else if (name.includes("address")) {
      const addressField = name.split(".")[1];
      setUser((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [addressField]: value,
        },
      }));
    } else {
      setUser((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    const role = rolesList.find((r) => r.id === value);

    if (checked) {
      setUser((prevData) => ({
        ...prevData,
        roles: [...prevData.roles, { roleName: role.label }],
      }));
    } else {
      setUser((prevData) => ({
        ...prevData,
        roles: prevData.roles.filter((r) => r.roleName !== role.label),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    const payload = {
      username: user.username,
      email: user.email,
      password: user.password,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      address: user.address,
      roles: user.roles,
    };

    try {
      const token = getUserToken();

      const response = await fetch("http://localhost:8081/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi thêm người dùng.");
      }

      setUser({
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

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
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
    user,
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

export default useAddUser;
