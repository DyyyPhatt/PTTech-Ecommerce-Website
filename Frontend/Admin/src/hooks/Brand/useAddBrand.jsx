import { useState } from "react";
import { validateAddBrandForm } from "../../utils/validationRules";

const getUserToken = () => {
  return localStorage.getItem("userToken");
};

const useAddBrand = () => {
  const [brand, setBrand] = useState({
    name: "",
    description: "",
    logo: "",
    country: "",
    website: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo" && files?.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setPreviewLogo(imageUrl);
      setBrand((prevBrand) => ({
        ...prevBrand,
        logo: file,
      }));
    } else {
      setBrand((prevBrand) => ({
        ...prevBrand,
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
    const validationErrors = validateAddBrandForm(brand);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);

      let logoUrl = brand.logo;

      if (brand.logo instanceof File) {
        logoUrl = await uploadImage(brand.logo);
      }

      if (logoUrl) {
        const formData = new FormData();
        formData.append("name", brand.name);
        formData.append("description", brand.description);
        formData.append("country", brand.country);
        formData.append("website", brand.website);
        formData.append("logo", logoUrl);

        const userToken = getUserToken();

        try {
          const response = await fetch("http://localhost:8081/api/brands", {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          });

          const result = await response.json();

          if (!response.ok) throw new Error(result.message);

          console.log("Thêm thương hiệu thành công:", result);
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
    brand,
    previewLogo,
    errors,
    isSubmitting,
    uploading,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
  };
};

export default useAddBrand;
