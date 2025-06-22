import { useState, useEffect } from "react";
import axios from "axios";

const useBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const userToken = getUserToken();

        const response = await axios.get("http://localhost:8081/api/brands", {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        setBrands(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return { brands, loading, error };
};

export default useBrands;
