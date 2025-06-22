import { useState, useEffect } from "react";
import axios from "axios";

const useBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/brands", {
          params: {
            sortBy: "name",
            sortOrder: "asc",
          },
        });
        setBrands(response.data);
      } catch (error) {
        setError("Lỗi khi lấy thương hiệu");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return { brands, loading, error };
};

export default useBrands;
