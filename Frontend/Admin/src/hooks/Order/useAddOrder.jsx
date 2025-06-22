import { useState, useEffect } from "react";
import useDiscountCode from "./useDiscountCode";

const useAddOrder = () => {
  const { discounts, loading, error } = useDiscountCode();
  const [order, setOrder] = useState({
    userId: "",
    items: [],
    shippingPrice: 30000,
    discountCode: "",
    phoneNumber: "",
    shippingAddress: {
      street: "",
      communes: "",
      district: "",
      city: "",
      country: "Việt Nam",
    },
    paymentMethod: "",
    shippingMethod: "",
    orderNotes: "",
  });
  const [errors, setErrors] = useState({});
  const [isDiscountValid, setIsDiscountValid] = useState(true);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  useEffect(() => {
    fetch("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then((response) => response.json())
      .then((data) => {
        if (data.error === 0) {
          setProvinces(data.data);
        }
      });
  }, []);

  const handleProvinceChange = (e) => {
    const selectedProvinceFullName = e.target.value;
    const selectedProvince = provinces.find(
      (province) => province.full_name === selectedProvinceFullName
    );

    setOrder((prev) => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        city: selectedProvince.full_name,
      },
    }));

    fetch(`https://esgoo.net/api-tinhthanh/2/${selectedProvince.id}.htm`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error === 0) {
          setDistricts(data.data);
          setCommunes([]);
        }
      });
  };

  const handleDistrictChange = (e) => {
    const selectedDistrictFullName = e.target.value;
    const selectedDistrict = districts.find(
      (district) => district.full_name === selectedDistrictFullName
    );

    setOrder((prev) => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        district: selectedDistrict.full_name,
      },
    }));

    fetch(`https://esgoo.net/api-tinhthanh/3/${selectedDistrict.id}.htm`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error === 0) {
          setCommunes(data.data);
        }
      });
  };

  const handleCommuneChange = (e) => {
    const selectedCommuneFullName = e.target.value;
    const selectedCommune = communes.find(
      (commune) => commune.full_name === selectedCommuneFullName
    );

    setOrder((prev) => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        communes: selectedCommune.full_name,
      },
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "discountCode" && value === "") {
      setOrder((prev) => ({
        ...prev,
        [name]: "",
      }));
    } else {
      if (name.startsWith("shippingAddress")) {
        const field = name.split(".")[1];
        setOrder((prev) => ({
          ...prev,
          shippingAddress: {
            ...prev.shippingAddress,
            [field]: value,
          },
        }));
      } else {
        setOrder((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    const totalPrice = order.items.reduce(
      (total, item) => total + item.totalPrice,
      0
    );

    setOrder((prev) => ({
      ...prev,
      totalPrice: totalPrice + prev.shippingPrice - prev.discountAmount,
    }));

    console.log("Dữ liệu gửi đi khi submit:", JSON.stringify(order, null, 2));

    if (order.discountCode !== "" && !isDiscountValid) {
      setErrors({ discountCode: "Mã giảm giá không hợp lệ!" });
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 3000);
      setIsSubmitting(false);
      return;
    }

    try {
      const userToken = getUserToken();

      const response = await fetch("http://localhost:8081/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(order),
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
    order,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    provinces,
    districts,
    communes,
    handleChange,
    handleSubmit,
    handleProvinceChange,
    handleDistrictChange,
    setOrder,
    handleCommuneChange,
    isDiscountValid,
  };
};

export default useAddOrder;
