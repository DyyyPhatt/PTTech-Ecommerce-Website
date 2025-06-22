import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDiscountCode from "./useDiscountCode";

const useEditOrder = (orderId) => {
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
    discountAmount: 0,
    paymentStatus: "",
    returnRejectionReason: "",
  });
  const [errors, setErrors] = useState({});
  const [isDiscountValid, setIsDiscountValid] = useState(true);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  useEffect(() => {
    fetch("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then((response) => response.json())
      .then((data) => {
        console.log("Provinces data:", data);
        if (data.error === 0) {
          setProvinces(data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching provinces:", err);
      });
  }, []);

  useEffect(() => {
    if (!orderId) return;
    const userToken = getUserToken();
    fetch(`http://localhost:8081/api/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setOrder(data);
          const { shippingAddress } = data;

          handleProvinceChange({ target: { value: shippingAddress.city } });

          if (shippingAddress.district) {
            handleDistrictChange({
              target: { value: shippingAddress.district },
            });
          }

          if (shippingAddress.communes) {
            handleCommuneChange({
              target: { value: shippingAddress.communes },
            });
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching order:", err);
      });
  }, [orderId]);

  const handleProvinceChange = (e) => {
    const selectedProvinceFullName = e.target.value;
    const selectedProvince = provinces.find(
      (province) => province.full_name === selectedProvinceFullName
    );

    if (selectedProvince) {
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
        })
        .catch((err) => {
          console.error("Error fetching districts:", err);
        });
    }
  };

  const handleDistrictChange = (e) => {
    const selectedDistrictFullName = e.target.value;
    const selectedDistrict = districts.find(
      (district) => district.full_name === selectedDistrictFullName
    );

    if (selectedDistrict) {
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
          console.log("Communes data:", data);
          if (data.error === 0) {
            setCommunes(data.data);
          } else {
            console.error("Error fetching communes:", data);
          }
        })
        .catch((err) => {
          console.error("Error fetching communes:", err);
        });
    }
  };

  const handleCommuneChange = (e) => {
    const selectedCommuneFullName = e.target.value;
    const selectedCommune = communes.find(
      (commune) => commune.full_name === selectedCommuneFullName
    );

    if (selectedCommune) {
      setOrder((prev) => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          communes: selectedCommune.full_name,
        },
      }));
    } else {
      console.error("Selected commune not found:", selectedCommuneFullName);
    }
  };

  const cancelOrder = async (reason) => {
    const userToken = getUserToken();
    try {
      const response = await fetch(
        `http://localhost:8081/api/orders/${orderId}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ cancellationReason: reason }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setOrder(result);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Hủy đơn hàng thất bại:", error.message);
      setErrors({ cancel: error.message });
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  const requestReturn = async (reason) => {
    const userToken = getUserToken();
    try {
      const response = await fetch(
        `http://localhost:8081/api/orders/${orderId}/return`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ returnReason: reason }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setOrder(result);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Yêu cầu trả hàng thất bại:", error.message);
      setErrors({ return: error.message });
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  const confirmReturn = async () => {
    const userToken = getUserToken();
    try {
      const response = await fetch(
        `http://localhost:8081/api/orders/${orderId}/complete-return`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setOrder(result);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Xác nhận trả hàng thất bại:", error.message);
      setErrors({ returnConfirm: error.message });
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  const rejectReturn = async (rejectionReason) => {
    const userToken = getUserToken();
    try {
      if (!rejectionReason.trim())
        throw new Error("Vui lòng nhập lý do từ chối trả hàng.");
      console.log(rejectionReason);
      const response = await fetch(
        `http://localhost:8081/api/orders/${orderId}/reject-return?rejectionReason=${rejectionReason}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const result = await response.json();
      console.log(result);
      if (!response.ok) throw new Error(result.message);

      setOrder(result);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Từ chối trả hàng thất bại:", error.message);
      setErrors({ returnReject: error.message });
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "orderStatus" && value === "Đã giao") {
      setOrder((prev) => ({
        ...prev,
        [name]: value,
        paymentStatus: "Đã thanh toán",
      }));
    } else {
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

    const userToken = getUserToken();

    try {
      const response = await fetch(
        `http://localhost:8081/api/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(order),
        }
      );

      const result = await response.json();

      console.log("Kết quả trả về từ API:", result);

      if (!response.ok) throw new Error(result.message);

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/order-list");
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
    cancelOrder,
    requestReturn,
    confirmReturn,
    rejectReturn,
  };
};

export default useEditOrder;
