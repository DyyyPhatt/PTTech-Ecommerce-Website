import { useState, useEffect } from "react";
import axios from "axios";

const useOrdersByUser = (userId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserToken = () => localStorage.getItem("userToken");

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      const userToken = getUserToken();
      try {
        const response = await axios.get(
          `http://localhost:8081/api/orders/user/${userId}`,
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        setOrders(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  return { orders, loading, error };
};

export default useOrdersByUser;
