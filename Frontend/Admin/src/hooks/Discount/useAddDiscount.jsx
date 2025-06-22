import { useState, useEffect } from "react";

const useAddDiscount = () => {
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
    usedByUsers: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errors, setErrors] = useState({});
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

        if (Array.isArray(productsData)) {
          setProducts(productsData);
        } else {
          console.error("Dữ liệu sản phẩm không hợp lệ:", productsData);
        }

        if (!Array.isArray(categoriesData)) {
          console.error("Dữ liệu categories không hợp lệ:", categoriesData);
        }
      } catch (err) {
        console.error("Error fetching categories/products:", err);
      }
    };

    fetchCategoriesAndProducts();
  }, []);

  const handleCategoryChange = (value) => {
    if (value.length === categories.length) {
      setDiscount((prevDiscount) => ({
        ...prevDiscount,
        applicableCategories: categories.map((category) => category.id),
      }));
    } else {
      setDiscount((prevDiscount) => ({
        ...prevDiscount,
        applicableCategories: value,
      }));
    }
  };

  const handleProductChange = (checkedValues) => {
    setDiscount((prevDiscount) => ({
      ...prevDiscount,
      applicableProducts: checkedValues,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" || type === "select-multiple") {
      if (name === "applicableCategories" || name === "applicableProducts") {
        const updatedArray = Array.from(
          e.target.selectedOptions,
          (option) => option.value
        );
        setDiscount((prevDiscount) => ({
          ...prevDiscount,
          [name]: updatedArray,
        }));
      }
    } else {
      setDiscount((prevDiscount) => ({
        ...prevDiscount,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
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

      console.log("Sending JSON data: ", discountData);

      const response = await fetch("http://localhost:8081/api/discount-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(discountData),
      });

      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi thêm mã giảm giá.");
      }

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      setErrors({ submit: err.message });
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
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
    handleChange,
    handleCategoryChange,
    handleProductChange,
    handleSubmit,
  };
};

export default useAddDiscount;
