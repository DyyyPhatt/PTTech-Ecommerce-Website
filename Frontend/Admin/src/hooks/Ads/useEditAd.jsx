import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useEditAd = (id) => {
  const [ad, setAd] = useState({
    title: "",
    image: "",
    link: "",
    description: "",
    startDate: "",
    endDate: "",
    adType: "",
    oldImage: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const navigate = useNavigate();

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const getAdById = async () => {
    try {
      const userToken = getUserToken();
      const response = await axios.get(
        `http://localhost:8081/api/ad-images/${id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      console.log(response.data);
      const { startDate, endDate } = response.data;
      const formattedStartDate = startDate ? startDate.split("T")[0] : "";
      const formattedEndDate = endDate ? endDate.split("T")[0] : "";
      setAd((prevAd) => ({
        ...prevAd,
        ...response.data,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        oldImage: response.data.image,
      }));
    } catch (error) {
      console.error("Error fetching ad:", error);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  useEffect(() => {
    if (id) {
      getAdById();
    }
  }, [id]);

  const handleChange = (e) => {
    setAd({ ...ad, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (file) => {
    if (!file) {
      setErrors({ ...errors, image: "Chưa chọn tệp ảnh" });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ ...errors, image: "Chỉ hỗ trợ tệp ảnh JPEG hoặc PNG" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const userToken = getUserToken();
      const response = await fetch(
        "http://localhost:8081/api/ad-images/upload-images",
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
        setAd({ ...ad, image: result.data });
      } else {
        throw new Error(result.message || "Tải ảnh lên thất bại");
      }
    } catch (error) {
      setErrors({ ...errors, image: error.message });
    }
  };

  const deleteOldImage = async () => {
    if (ad.oldImage && ad.image !== ad.oldImage) {
      try {
        const userToken = getUserToken();
        await axios.delete(
          `http://localhost:8081/api/ad-images/delete-image/${id}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        console.log("Xóa ảnh cũ thành công");
      } catch (error) {
        console.error("Error deleting old image:", error);
        setErrors({ ...errors, image: "Không thể xóa ảnh cũ" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await deleteOldImage();
    const adData = {
      title: ad.title,
      description: ad.description,
      link: ad.link,
      startDate: ad.startDate,
      endDate: ad.endDate,
      adType: ad.adType,
      image: ad.image,
    };

    try {
      const userToken = getUserToken();
      const response = await axios.put(
        `http://localhost:8081/api/ad-images/${id}`,
        adData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status !== 200) {
        throw new Error(response.data.message || "Có lỗi xảy ra");
      }
      setIsSubmitting(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/ads-list");
      }, 3000);
    } catch (error) {
      console.error("Error submitting ad:", error);
      setErrors({ submit: error.message });
      setIsSubmitting(false);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  return {
    ad,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
    getAdById,
    handleImageUpload,
  };
};

export default useEditAd;
