import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAddCategorySchedule = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState({
    name: "",
    description: "",
    image: "",
    parentCategoryId: "",
    tags: [],
    scheduledDate: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [categories, setCategories] = useState([]);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const handleCategoryChange = (value) => {
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      parentCategoryId: value,
    }));
  };

  const convertUtcToLocalFormat = (utcDate) => {
    if (!utcDate) return "";

    const localDate = new Date(utcDate);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const convertLocalToUtc = (localDate) => {
    const date = new Date(localDate);
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return utcDate.toISOString().slice(0, -1) + "+07:00";
  };

  const handleInputChange = (event) => {
    const { name, value, type, files } = event.target;

    if (type === "file" && files?.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setSchedule((prevSchedule) => ({
        ...prevSchedule,
        image: file,
      }));
    } else if (name === "scheduledDate") {
      const formattedDate = convertLocalToUtc(value);
      setSchedule((prevSchedule) => ({
        ...prevSchedule,
        scheduledDate: formattedDate,
      }));
    } else if (name === "tags") {
      setSchedule((prevSchedule) => ({
        ...prevSchedule,
        tags: value.split(",").map((tag) => tag.trim()),
      }));
    } else {
      setSchedule((prevSchedule) => ({
        ...prevSchedule,
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
        image: error.message,
      }));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);

    let imageUrl = schedule.image;

    if (schedule.image instanceof File) {
      imageUrl = await uploadImage(schedule.image);
    }

    if (imageUrl) {
      const categoryData = {
        name: schedule.name,
        description: schedule.description,
        parentCategoryId: schedule.parentCategoryId || null,
        tags: schedule.tags,
        image: imageUrl,
        scheduledDate: schedule.scheduledDate,
      };

      console.log(categoryData);
      const userToken = getUserToken();

      try {
        const response = await fetch(
          "http://localhost:8081/api/categories/schedule-create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify(categoryData),
          }
        );

        const result = await response.json();

        if (!response.ok) throw new Error(result.message);

        console.log("Thêm lịch tạo danh mục thành công:", result);
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
    schedule,
    previewImage,
    errors,
    isSubmitting,
    uploading,
    showSuccessMessage,
    showErrorMessage,
    handleInputChange,
    handleCategoryChange,
    handleSubmit,
    convertUtcToLocalFormat,
  };
};

export default useAddCategorySchedule;
