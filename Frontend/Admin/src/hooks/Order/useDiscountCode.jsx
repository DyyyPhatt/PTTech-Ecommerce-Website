import { useState, useEffect } from "react";
import axios from "axios";

const useDiscountCode = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const userToken = getUserToken();
        const response = await axios.get(
          "http://localhost:8081/api/discount-codes",
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        setDiscounts(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  return { discounts, loading, error };
};

export default useDiscountCode;
