import { useState } from "react";

const useAddInventory = () => {
  const [inventory, setInventory] = useState({
    products: [],
    supplier: {
      name: "",
      contact: "",
      address: "",
    },
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("supplier")) {
      setInventory((prev) => ({
        ...prev,
        supplier: {
          ...prev.supplier,
          [name.split(".")[1]]: value,
        },
      }));
    } else {
      setInventory((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleProductChange = (e, index, variantIndex) => {
    const { name, value } = e.target;
    const newProducts = [...inventory.products];

    if (name === "quantity" || name === "unitPrice") {
      const updatedVariant = {
        ...newProducts[index].productVariants[variantIndex],
        [name]: parseFloat(value),
        totalValue:
          parseFloat(value) *
          newProducts[index].productVariants[variantIndex].unitPrice,
      };
      newProducts[index].productVariants[variantIndex] = updatedVariant;
    } else {
      newProducts[index].productVariants[variantIndex][name] = value;
    }

    setInventory({ ...inventory, products: newProducts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Dữ liệu trước khi gửi:", inventory);

    setIsSubmitting(true);
    const token = getUserToken();
    try {
      const response = await fetch("http://localhost:8081/api/inventories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(inventory),
      });

      const result = await response.json();

      console.log("Kết quả trả về từ API:", result);

      if (!response.ok) throw new Error(result.message);

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error.message);
      setErrors({ api: error.message });
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    inventory,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleProductChange,
    handleSubmit,
    setInventory,
  };
};

export default useAddInventory;
