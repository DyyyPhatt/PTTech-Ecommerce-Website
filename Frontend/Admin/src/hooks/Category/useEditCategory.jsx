import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const getUserToken = () => {
  return localStorage.getItem("userToken");
};

const useEditCategory = (id) => {
  const [formData, setFormData] = useState({
    name: "",
    parentCategoryId: "",
    image: "",
    oldImage: "",
    tags: [],
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  const getCategoryById = async () => {
    const userToken = getUserToken();

    try {
      const response = await axios.get(
        `http://localhost:8081/api/categories/${id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      setFormData((prevFormData) => ({
        ...prevFormData,
        ...response.data,
        oldImage: response.data.image,
      }));
    } catch (error) {
      console.error("Error fetching category:", error);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  const handleInputChange = (event) => {
    const { name, value, type, files } = event.target;

    if (type === "file") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: files[0],
      }));
    } else if (name === "tags") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        tags: value.split(",").map((tag) => tag.trim()),
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleImageUpload = async (file) => {
    const userToken = getUserToken();

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    try {
      const response = await fetch(
        "http://localhost:8081/api/categories/upload-images",
        {
          method: "POST",
          body: uploadFormData,
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const result = await response.json();

      if (response.ok) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          image: result.data,
        }));
      } else {
        throw new Error(result.message || "Image upload failed");
      }
    } catch (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        image: error.message,
      }));
    }
  };

  const handleCategoryChange = (value) => {
    const userToken = getUserToken();

    setFormData((prevData) => ({
      ...prevData,
      parentCategoryId: value.length > 0 ? value : null,
    }));
  };

  const deleteOldImage = async () => {
    const userToken = getUserToken();

    if (formData.oldImage && formData.image !== formData.oldImage) {
      try {
        await axios.delete(
          `http://localhost:8081/api/categories/delete-image/${id}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        console.log("Old image deleted successfully");
      } catch (error) {
        console.error("Error deleting old image:", error);
        setErrors({ ...errors, image: "Cannot delete old image" });
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Category name cannot be empty.";
    if (!formData.tags) newErrors.tags = "Tags cannot be empty.";
    if (!formData.description)
      newErrors.description = "Description cannot be empty.";
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    await deleteOldImage();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    if (formData.parentCategoryId !== null) {
      formDataToSend.append("parentCategoryId", formData.parentCategoryId);
    }
    formDataToSend.append("tags", formData.tags.join(","));
    formDataToSend.append("description", formData.description);
    if (formData.image instanceof File) {
      formDataToSend.append("image", formData.image);
    } else if (formData.image) {
      formDataToSend.append("image", formData.image);
    }
    const userToken = getUserToken();

    try {
      const response = await fetch(
        `http://localhost:8081/api/categories/${id}`,
        {
          method: "PUT",
          body: formDataToSend,
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      setIsSubmitting(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/category-list");
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
      getCategoryById();
    }
  }, [id]);

  return {
    formData,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    getCategoryById,
    handleInputChange,
    handleSubmit,
    handleImageUpload,
    handleCategoryChange,
  };
};

export default useEditCategory;
