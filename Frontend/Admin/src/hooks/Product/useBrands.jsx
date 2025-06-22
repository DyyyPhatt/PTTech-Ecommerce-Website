import { useState, useEffect } from "react";
import axios from "axios";

const useBrands = (userToken) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
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
  }, [userToken]);
  return { brands, loading, error };
};

export default useBrands;
