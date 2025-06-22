import { useState } from "react";

const useAddAdSchedule = () => {
  const [schedule, setSchedule] = useState({
    title: "",
    image: "",
    link: "",
    adType: "",
    description: "",
    startDate: "",
    endDate: "",
    scheduledDate: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files?.length > 0) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    setIsSubmitting(true);

    let imageUrl = schedule.image;

    if (schedule.image instanceof File) {
      imageUrl = await uploadImage(schedule.image);
    }

    if (imageUrl) {
      const adData = {
        title: schedule.title,
        description: schedule.description,
        link: schedule.link,
        adType: schedule.adType,
        image: imageUrl,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        scheduledDate: schedule.scheduledDate,
      };

      try {
        const userToken = getUserToken();
        const response = await fetch(
          "http://localhost:8081/api/ad-images/schedule-create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify(adData),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message);
        }

        console.log("Thêm lịch quảng cáo thành công:", result);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
        setSchedule({
          title: "",
          image: "",
          link: "",
          adType: "",
          description: "",
          startDate: "",
          endDate: "",
          scheduledDate: "",
        });
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
    handleChange,
    handleSubmit,
    convertUtcToLocalFormat,
  };
};

export default useAddAdSchedule;
