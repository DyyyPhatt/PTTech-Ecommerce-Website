import { useState, useEffect } from "react";

const useAddDiscountSchedule = () => {
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
    scheduledDate: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const convertUtcToLocalFormat = (utcDate) => {
    if (!utcDate) return "";

    const localDate = new Date(utcDate);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const convertLocalToUtc = (localDate) => {
    const date = new Date(localDate);
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return utcDate.toISOString().slice(0, -1) + "+07:00";
  };

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
      scheduledDate: discount.scheduledDate,
    };

    try {
      const response = await fetch(
        "http://localhost:8081/api/discount-codes/schedule-create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(discountData),
        }
      );

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
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleCategoryChange,
    handleProductChange,
    handleSubmit,
    convertUtcToLocalFormat,
  };
};

export default useAddDiscountSchedule;
