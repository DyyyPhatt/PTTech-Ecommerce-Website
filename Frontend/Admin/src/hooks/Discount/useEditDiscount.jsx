import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useEditDiscount = (id) => {
  const [discount, setDiscount] = useState({
    code: "",
    description: "",
    discountType: "",
    discountValue: 0,
    minimumPurchaseAmount: 0,
    maxDiscountAmount: 0,
    applicableCategories: [],
    applicableProducts: [],
    appliesTo: "",
    startDate: "",
    endDate: "",
    usageLimit: 0,
    usageCount: 0,
    usedByUsers: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const userToken = getUserToken();

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        const categoriesResponse = await fetch(
          "http://localhost:8081/api/categories",
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        const productsResponse = await fetch(
          "http://localhost:8081/api/products",
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        const productsData = await productsResponse.json();
        setProducts(productsData);
      } catch (err) {
        console.error("Lỗi khi tải categories/products:", err);
      }
    };

    fetchCategoriesAndProducts();
  }, [userToken]);

  const getDiscountById = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8081/api/discount-codes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const data = response.data;

      setDiscount({
        ...data,
        startDate: data.startDate
          ? new Date(data.startDate).toISOString().slice(0, 10)
          : "",
        endDate: data.endDate
          ? new Date(data.endDate).toISOString().slice(0, 10)
          : "",
        usageCount: data.usageCount || 0, // Đảm bảo usageCount được lấy từ API
      });
    } catch (error) {
      console.error("Lỗi khi tải discount:", error);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  useEffect(() => {
    if (id) {
      getDiscountById();
    }
  }, [id]);

  const handleCategoryChange = (value) => {
    setDiscount((prevDiscount) => ({
      ...prevDiscount,
      applicableCategories: value,
    }));
  };

  const handleProductChange = (value) => {
    setDiscount((prevDiscount) => ({
      ...prevDiscount,
      applicableProducts: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDiscount({
      ...discount,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const discountData = {
      code: discount.code,
      description: discount.description,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      minimumPurchaseAmount: discount.minimumPurchaseAmount,
      maxDiscountAmount: discount.maxDiscountAmount,
      appliesTo: discount.appliesTo,
      startDate: new Date(discount.startDate).toISOString(),
      endDate: new Date(discount.endDate).toISOString(),
      usageLimit: discount.usageLimit,
      usageCount: discount.usageCount,
      applicableCategories:
        discount.applicableCategories.length > 0
          ? discount.applicableCategories
          : [],
      applicableProducts:
        discount.applicableProducts.length > 0
          ? discount.applicableProducts
          : [],
      usedByUsers: discount.usedByUsers || [],
    };

    try {
      const response = await axios.put(
        `http://localhost:8081/api/discount-codes/${id}`,
        discountData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.status !== 200) throw new Error("Cập nhật không thành công");

      setIsSubmitting(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/discount-list");
      }, 3000);
    } catch (error) {
      setErrors(error.response?.data || { api: error.message });
      setIsSubmitting(false);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  return {
    discount,
    categories,
    products,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    getDiscountById,
    handleChange,
    handleCategoryChange,
    handleProductChange,
    handleSubmit,
  };
};

export default useEditDiscount;
