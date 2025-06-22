import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const getUserToken = () => {
  return localStorage.getItem("userToken");
};

const useEditBrand = (id) => {
  const [brand, setBrand] = useState({
    name: "",
    description: "",
    logo: "",
    country: "",
    website: "",
    oldLogo: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const navigate = useNavigate();

  const getBrandById = async () => {
    const userToken = getUserToken();
    try {
      const response = await axios.get(
        `http://localhost:8081/api/brands/${id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      setBrand((prevBrand) => ({
        ...prevBrand,
        ...response.data,
        oldLogo: response.data.logo,
      }));
    } catch (error) {
      console.error("Error fetching brand:", error);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  const handleChange = (e) => {
    setBrand({ ...brand, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (file) => {
    const userToken = getUserToken();
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(
        "http://localhost:8081/api/brands/upload-images",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const result = await response.json();

      if (response.ok) {
        setBrand({ ...brand, logo: result.data });
      } else {
        throw new Error(result.message || "Tải ảnh lên thất bại");
      }
    } catch (error) {
      setErrors({ ...errors, logo: error.message });
    }
  };

  const deleteOldImage = async () => {
    const userToken = getUserToken();
    if (brand.oldLogo && brand.logo !== brand.oldLogo) {
      try {
        await axios.delete(
          `http://localhost:8081/api/brands/delete-image/${id}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        console.log("Xóa ảnh cũ thành công");
      } catch (error) {
        console.error("Error deleting old image:", error);
        setErrors({ ...errors, logo: "" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await deleteOldImage();

    const formData = new FormData();
    formData.append("name", brand.name);
    formData.append("description", brand.description);
    formData.append("country", brand.country);
    formData.append("website", brand.website);

    if (brand.logo instanceof File) {
      formData.append("logo", brand.logo);
    } else if (brand.logo) {
      formData.append("logo", brand.logo);
    }
    const userToken = getUserToken();
    try {
      const response = await fetch(`http://localhost:8081/api/brands/${id}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      setIsSubmitting(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/brand-list");
      }, 3000);
    } catch (error) {
      setErrors(error.response?.data || {});
      setIsSubmitting(false);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  useEffect(() => {
    if (id) {
      getBrandById();
    }
  }, [id]);

  return {
    brand,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    getBrandById,
    handleChange,
    handleSubmit,
    handleImageUpload,
  };
};

export default useEditBrand;
