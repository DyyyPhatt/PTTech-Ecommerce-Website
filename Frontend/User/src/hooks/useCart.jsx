import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = "http://localhost:8081/api/carts";

const useCart = (userId) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeader = () => {
    const token = Cookies.get("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCart = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/user/${userId}`, {
        headers: getAuthHeader(),
      });
      setCart(response.data);
    } catch (err) {
      setError("Không thể lấy giỏ hàng");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addItem = useCallback(async (cartId, itemDTO) => {
    try {
      const response = await axios.post(
        `${API_BASE}/${cartId}/items`,
        itemDTO,
        { headers: getAuthHeader() }
      );
      setCart(response.data);
      window.dispatchEvent(new Event("guest_cart_updated"));
    } catch (err) {
      setError("Không thể thêm sản phẩm vào giỏ hàng");
      console.error(err);
    }
  }, []);

  const removeItem = useCallback(async (cartId, productId, variantId) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/${cartId}/items/${productId}/${variantId}`,
        { headers: getAuthHeader() }
      );
      setCart(response.data);
      window.dispatchEvent(new Event("guest_cart_updated"));
    } catch (err) {
      setError("Không thể xóa sản phẩm khỏi giỏ hàng");
      console.error(err);
    }
  }, []);

  const increaseQuantity = useCallback(async (cartId, productId, variantId) => {
    try {
      const response = await axios.put(
        `${API_BASE}/${cartId}/increase/${productId}/${variantId}`,
        {},
        { headers: getAuthHeader() }
      );
      setCart(response.data);
      window.dispatchEvent(new Event("guest_cart_updated"));
    } catch (err) {
      setError("Không thể tăng số lượng");
      console.error(err);
    }
  }, []);

  const decreaseQuantity = useCallback(async (cartId, productId, variantId) => {
    try {
      const response = await axios.put(
        `${API_BASE}/${cartId}/decrease/${productId}/${variantId}`,
        {},
        { headers: getAuthHeader() }
      );
      setCart(response.data);
      window.dispatchEvent(new Event("guest_cart_updated"));
    } catch (err) {
      setError("Không thể giảm số lượng");
      console.error(err);
    }
  }, []);

  const changeVariant = useCallback(
    async (cartId, productId, oldVariantId, newVariantId) => {
      try {
        const response = await axios.put(
          `${API_BASE}/${cartId}/change-variant/${productId}/${oldVariantId}/${newVariantId}`,
          {},
          { headers: getAuthHeader() }
        );
        setCart(response.data);
      } catch (err) {
        setError("Không thể thay đổi biến thể");
        console.error(err);
      }
    },
    []
  );

  const syncGuestCartToServer = useCallback(
    async (guestItems) => {
      try {
        const response = await axios.post(
          `${API_BASE}/sync-guest-cart/${userId}`,
          guestItems,
          { headers: getAuthHeader() }
        );
        setCart(response.data);
        localStorage.removeItem("guest_cart");
        window.dispatchEvent(new Event("guest_cart_updated"));
      } catch (err) {
        setError("Không thể đồng bộ giỏ hàng");
        console.error(err);
      }
    },
    [userId]
  );

  const deleteCart = useCallback(async (cartId) => {
    try {
      await axios.delete(`${API_BASE}/${cartId}`, {
        headers: getAuthHeader(),
      });
      setCart(null);
    } catch (err) {
      setError("Không thể xóa giỏ hàng");
      console.error(err);
    }
  }, []);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    changeVariant,
    deleteCart,
    syncGuestCartToServer,
  };
};

export default useCart;
