import { useState, useEffect } from "react";
import axios from "axios";

const useDiscountCodes = () => {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscountCodes = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/discount-codes/usable"
        );
        setDiscountCodes(response.data);
      } catch (err) {
        setError("Lỗi khi lấy mã giảm giá có thể sử dụng");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountCodes();
  }, []);

  return { discountCodes, loading, error };
};

export default useDiscountCodes;
