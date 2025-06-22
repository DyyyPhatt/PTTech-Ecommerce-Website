import { useState } from "react";

const useAddContact = () => {
  const [contact, setContact] = useState({
    companyName: "",
    email: "",
    phoneNumber: "",
    address: { street: "", city: "", district: "", country: "" },
    supportHours: { weekdays: "", weekends: "" },
    socialMedia: { facebook: "", instagram: "", twitter: "", zalo: "" },
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");

    if (keys.length > 1) {
      setContact((prevContact) => ({
        ...prevContact,
        [keys[0]]: {
          ...prevContact[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else {
      setContact((prevContact) => ({
        ...prevContact,
        [name]: value,
      }));
    }
  };

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    const userToken = getUserToken();
    try {
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

      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      const response = await fetch("http://localhost:8081/api/contacts", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      console.log(formData);

      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi thêm liên hệ.");
      }

      setContact({
        companyName: "",
        email: "",
        phoneNumber: "",
        address: { street: "", city: "", district: "", country: "" },
        supportHours: { weekdays: "", weekends: "" },
        socialMedia: { facebook: "", instagram: "", twitter: "", zalo: "" },
      });

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      setErrors({ submit: err.message });
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    contact,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
  };
};

export default useAddContact;
