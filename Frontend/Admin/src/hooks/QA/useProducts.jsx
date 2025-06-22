import { useState, useEffect } from "react";
import axios from "axios";

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const userToken = getUserToken();

      try {
        const response = await axios.get("http://localhost:8081/api/products", {
          params: {
            sortBy: "name",
            sortOrder: "asc",
          },
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        setProducts(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

export default useProducts;
