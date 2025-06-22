import { useState } from "react";

const useAddAd = () => {
  const [ad, setAd] = useState({
    title: "",
    image: "",
    link: "",
    adType: "",
    description: "",
    startDate: "",
    endDate: "",
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files?.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setAd((prevAd) => ({
        ...prevAd,
        image: file,
      }));
    } else {
      setAd((prevAd) => ({
        ...prevAd,
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

    let imageUrl = ad.image;

    if (ad.image instanceof File) {
      imageUrl = await uploadImage(ad.image);
    }

    if (imageUrl) {
      const adData = {
        title: ad.title,
        description: ad.description,
        link: ad.link,
        image: imageUrl,
        adType: ad.adType,
        startDate: ad.startDate,
        endDate: ad.endDate,
      };

      try {
        const userToken = getUserToken();
        const response = await fetch("http://localhost:8081/api/ad-images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(adData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message);
        }

        console.log("Thêm quảng cáo thành công:", result);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
        setAd({
          title: "",
          image: "",
          link: "",
          adType: "",
          description: "",
          startDate: "",
          endDate: "",
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
    ad,
    previewImage,
    errors,
    isSubmitting,
    uploading,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
  };
};

export default useAddAd;
