import { useState, useEffect } from "react";
import axios from "axios";

const usePromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/ad-images");
        setPromotions(response.data);
      } catch (error) {
        setError("Lỗi khi lấy quảng cáo");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  return { promotions, loading, error };
};

export default usePromotions;
