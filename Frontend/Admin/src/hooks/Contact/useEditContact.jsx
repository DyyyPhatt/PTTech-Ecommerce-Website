import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useEditContact = (id) => {
  const [contact, setContact] = useState({
    companyName: "",
    email: "",
    phoneNumber: "",
    address: {
      street: "",
      city: "",
      district: "",
      country: "",
    },
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      zalo: "",
    },
    supportHours: {
      weekdays: "",
      weekends: "",
    },
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const navigate = useNavigate();

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const getContactById = async () => {
    const userToken = getUserToken();
    if (!userToken) {
      setErrors({ submit: "Người dùng chưa được xác thực." });
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8081/api/contacts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      setContact(response.data);
    } catch (error) {
      console.error("Error fetching contact:", error);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      name.startsWith("address.") ||
      name.startsWith("socialMedia.") ||
      name.startsWith("supportHours.")
    ) {
      const [section, field] = name.split(".");
      setContact({
        ...contact,
        [section]: {
          ...contact[section],
          [field]: value,
        },
      });
    } else {
      setContact({
        ...contact,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const userToken = getUserToken();

    if (!userToken) {
      setErrors({ submit: "Người dùng chưa được xác thực." });
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("companyName", contact.companyName);
    formData.append("email", contact.email);
    formData.append("phoneNumber", contact.phoneNumber);
    formData.append("address.street", contact.address.street);
    formData.append("address.city", contact.address.city);
    formData.append("address.district", contact.address.district);
    formData.append("address.country", contact.address.country);
    formData.append("supportHours.weekdays", contact.supportHours.weekdays);
    formData.append("supportHours.weekends", contact.supportHours.weekends);
    formData.append("socialMedia.facebook", contact.socialMedia.facebook);
    formData.append("socialMedia.instagram", contact.socialMedia.instagram);
    formData.append("socialMedia.twitter", contact.socialMedia.twitter);
    formData.append("socialMedia.zalo", contact.socialMedia.zalo);

    try {
      const response = await axios.put(
        `http://localhost:8081/api/contacts/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.status !== 200)
        throw new Error(response.message || "Cập nhật không thành công");

      setIsSubmitting(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/contact-list");
      }, 3000);
    } catch (error) {
      setErrors(error.response?.data || { api: error.message });
      setIsSubmitting(false);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  useEffect(() => {
    if (id) {
      getContactById();
    }
  }, [id]);

  return {
    contact,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
    getContactById,
  };
};

export default useEditContact;
