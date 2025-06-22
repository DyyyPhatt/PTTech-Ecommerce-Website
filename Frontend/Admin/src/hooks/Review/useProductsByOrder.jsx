import { useState, useEffect } from "react";
import axios from "axios";

const useProductsByOrder = (orderId) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserToken = () => localStorage.getItem("userToken");

  useEffect(() => {
    if (!orderId) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      const userToken = getUserToken();
      try {
        const response = await axios.get(
          `http://localhost:8081/api/orders/${orderId}`,
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        setProducts(response.data.items || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [orderId]);

  return { products, loading, error };
};

export default useProductsByOrder;
