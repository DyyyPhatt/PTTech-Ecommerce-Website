import { useState } from "react";
import { validateAddBrandForm } from "../../utils/validationRules";

const getUserToken = () => {
  return localStorage.getItem("userToken");
};

const useAddBrandSchedule = () => {
  const [schedule, setSchedule] = useState({
    name: "",
    description: "",
    logo: "",
    country: "",
    website: "",
    scheduledDate: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);

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

    if (name === "logo" && files?.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setPreviewLogo(imageUrl);
      setSchedule((prevSchedule) => ({
        ...prevSchedule,
        logo: file,
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

  console.log(schedule);

  const uploadImage = async (file) => {
    const userToken = getUserToken();
    setUploading(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateAddBrandForm(schedule);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);

      let logoUrl = schedule.logo;

      if (schedule.logo instanceof File) {
        logoUrl = await uploadImage(schedule.logo);
      }

      if (logoUrl) {
        const brandData = {
          name: schedule.name,
          description: schedule.description,
          country: schedule.country,
          website: schedule.website,
          logo: logoUrl,
          scheduledDate: schedule.scheduledDate,
        };
        const userToken = getUserToken();
        try {
          const response = await fetch(
            "http://localhost:8081/api/brands/schedule-create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
              body: JSON.stringify(brandData),
            }
          );

          const result = await response.json();

          if (!response.ok) throw new Error(result.message);

          console.log("Thêm lịch tạo thương hiệu thành công:", result);
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
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
    }
  };

  return {
    schedule,
    previewLogo,
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

export default useAddBrandSchedule;
