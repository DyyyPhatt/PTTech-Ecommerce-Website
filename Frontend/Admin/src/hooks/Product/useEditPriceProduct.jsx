import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useEditPriceProduct = (productId, userToken) => {
  const [product, setProduct] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const navigate = useNavigate();
  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  useEffect(() => {
    const fetchProduct = async () => {
      const userToken = getUserToken();
      try {
        const response = await axios.get(
          `http://localhost:8081/api/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        setProduct(response.data);
        setNewPrice(response.data.pricing?.current || "");
        setLoading(false);
      } catch (error) {
        setError("Không thể tải thông tin sản phẩm.");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, userToken]);

  const handlePriceChange = async () => {
    const userToken = getUserToken();
    try {
      await axios.put(
        `http://localhost:8081/api/products/update-price/${productId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          params: { newPrice: parseFloat(newPrice) },
        }
      );

      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/product-list");
      }, 3000);
    } catch (error) {
      setError("Cập nhật giá không thành công.");
      setShowErrorMessage(true);

      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  return {
    product,
    newPrice,
    setNewPrice,
    loading,
    error,
    showSuccessMessage,
    showErrorMessage,
    handlePriceChange,
  };
};

export default useEditPriceProduct;
