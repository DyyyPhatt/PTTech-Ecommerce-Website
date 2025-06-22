import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8081/api/bug-reports";

const useCreateReportBug = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const createReport = useCallback(
    async ({
      bugType,
      description,
      email,
      imageFiles = [],
      videoFiles = [],
    }) => {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("bugType", bugType);
        formData.append("description", description);
        formData.append("email", email);

        imageFiles.forEach((file) => {
          formData.append("imageFiles", file);
        });

        videoFiles.forEach((file) => {
          formData.append("videoFiles", file);
        });

        const response = await axios.post(API_BASE, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setReport(response.data);
        return response.data;
      } catch (err) {
        setError(err.response?.data || err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createReport,
    loading,
    error,
    report,
  };
};

export default useCreateReportBug;
