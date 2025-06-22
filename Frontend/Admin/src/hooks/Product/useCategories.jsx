import { useState, useEffect } from "react";
import axios from "axios";

const useCategories = (userToken) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/categories",
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        setCategories(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [userToken]);

  return { categories, loading, error };
};

export default useCategories;
