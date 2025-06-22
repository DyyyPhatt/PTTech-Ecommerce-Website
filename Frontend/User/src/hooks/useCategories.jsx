import { useState, useEffect } from "react";
import axios from "axios";

const useCategories = () => {
  const [structuredCategories, setStructuredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/categories",
          {
            params: { sortBy: "name", sortOrder: "asc" },
          }
        );

        const allCategories = response.data;

        // Tạo danh sách cha và con
        const parents = allCategories.filter((cat) => !cat.parentCategoryId);
        const children = allCategories.filter((cat) => cat.parentCategoryId);

        // Gán children vào parent tương ứng
        const structured = parents.map((parent) => ({
          ...parent,
          children: children.filter(
            (child) => child.parentCategoryId === parent.id
          ),
        }));

        setStructuredCategories(structured);
      } catch (error) {
        setError("Lỗi khi lấy danh mục");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories: structuredCategories, loading, error };
};

export default useCategories;
