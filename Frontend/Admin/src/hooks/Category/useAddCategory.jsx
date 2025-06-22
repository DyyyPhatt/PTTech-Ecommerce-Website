import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAddCategory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    parentCategoryId: "",
    tags: [],
  });

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [categories, setCategories] = useState([]);

  const handleCategoryChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      parentCategoryId: value,
    }));
  };

  const handleInputChange = (event) => {
    const { name, value, type, files } = event.target;

    if (type === "file") {
      setPreviewImage(URL.createObjectURL(files[0]));
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));
    } else if (name === "tags") {
      setFormData((prevData) => ({
        ...prevData,
        tags: value.split(",").map((tag) => tag.trim()),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const uploadImage = async (file) => {
    const userToken = getUserToken();
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://localhost:8081/api/categories/upload-images",
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
        return result.data;
      } else {
        throw new Error(result.message || "Tải ảnh lên thất bại");
      }
    } catch (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        logo: error.message,
      }));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);

    let imageUrl = formData.image;

    if (formData.image instanceof File) {
      imageUrl = await uploadImage(formData.image);
    }

    if (imageUrl) {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);

      if (formData.parentCategoryId !== "") {
        formDataToSend.append("parentCategoryId", formData.parentCategoryId);
      }

      formDataToSend.append("tags", formData.tags.join(","));
      formDataToSend.append("image", imageUrl);

      formDataToSend.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      const userToken = getUserToken();
      try {
        const response = await fetch("http://localhost:8081/api/categories", {
          method: "POST",
          body: formDataToSend,
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message);

        console.log("Category added successfully:", result);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          navigate("/category-list");
        }, 3000);
      } catch (error) {
        setErrors({ api: error.message });
        setShowErrorMessage(true);
        setTimeout(() => {
          setShowErrorMessage(false);
        }, 3000);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return {
    formData,
    previewImage,
    errors,
    isSubmitting,
    uploading,
    showSuccessMessage,
    showErrorMessage,
    categories,
    handleInputChange,
    handleCategoryChange,
    handleSubmit,
  };
};

export default useAddCategory;
