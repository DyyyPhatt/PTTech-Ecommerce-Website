import { useState } from "react";

const getUserToken = () => {
  return localStorage.getItem("userToken");
};

const useAddBugReport = () => {
  const [bugReport, setBugReport] = useState({
    bugType: "",
    description: "",
    email: "",
    imageFiles: [],
    videoFiles: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setBugReport((prev) => ({
        ...prev,
        [name]: Array.from(files),
      }));
    } else {
      setBugReport((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!bugReport.bugType) errs.bugType = "Loại lỗi không được để trống";
    if (!bugReport.description)
      errs.description = "Mô tả lỗi không được để trống";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("bugType", bugReport.bugType);
      formData.append("description", bugReport.description);
      formData.append("email", bugReport.email);

      bugReport.imageFiles.forEach((file) =>
        formData.append("imageFiles", file)
      );
      bugReport.videoFiles.forEach((file) =>
        formData.append("videoFiles", file)
      );

      try {
        const response = await fetch("http://localhost:8081/api/bug-reports", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getUserToken()}`,
          },
          body: formData,
        });

        const result = await response.json();

        if (!response.ok)
          throw new Error(result.message || "Tạo báo lỗi thất bại");

        console.log("Báo lỗi thành công:", result);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } catch (error) {
        console.error("Error:", error.message);
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 3000);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return {
    bugReport,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
  };
};

export default useAddBugReport;
