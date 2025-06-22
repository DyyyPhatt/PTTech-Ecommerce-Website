import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/Dashboard/StatCard";
import CartListTable from "../../components/Cart/CartListTable";
import useCartSearch from "../../hooks/Cart/useCartSearch";

const CartList = () => {
  const {
    searchQuery,
    searchInput,
    searchHistory,
    showHistory,
    handleSearchChange,
    handleFocus,
    handleBlur,
  } = useCartSearch();
  const [carts, setCarts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [cartsPerPage] = useState(10);
  const [selectedUserId, setSelectedUserId] = useState("all");
  const [filterOption, setFilterOption] = useState("all-A-Z");
  const [users, setUsers] = useState({});

  const navigate = useNavigate();
  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const fetchCarts = async () => {
    try {
      const token = getUserToken();
      console.log(token);
      const response = await axios.get("http://localhost:8081/api/carts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCarts(response.data);
    } catch (error) {
      console.error("Error fetching carts:", error);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchUserName = async (userId) => {
    const userToken = getUserToken();
    try {
      const response = await axios.get(
        `http://localhost:8081/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      return response.data.username;
    } catch (error) {
      console.error("Error fetching username:", error);
      return "N/A";
    }
  };
  useEffect(() => {
    const fetchUsers = async () => {
      const usernames = {};
      for (const cart of carts) {
        const id = cart.userId;
        if (!usernames[id]) {
          const username = await fetchUserName(id);
          usernames[id] = username;
        }
      }
      setUsers(usernames);
    };

    if (carts.length > 0) {
      fetchUsers();
    }
  }, [carts]);

  const handleFilterChange = (value) => {
    setFilterOption(value);
  };

  const indexOfLastCart = currentPage * cartsPerPage;
  const indexOfFirstCart = indexOfLastCart - cartsPerPage;

  const nonEmptyCarts = carts.filter((cart) => cart.totalItems > 0);

  const filteredCarts = nonEmptyCarts.filter((cart) => {
    if (selectedUserId === "all") return true;
    return cart.userId === selectedUserId;
  });

  const searchedCarts = filteredCarts.filter((cart) => {
    const cartId = cart.cartId ? cart.cartId.toLowerCase() : "";
    const username = users[cart.userId]?.toLowerCase() || "";
    return (
      cartId.includes(searchQuery.toLowerCase()) ||
      username.includes(searchQuery.toLowerCase())
    );
  });

  const applyFilterAndSort = (carts) => {
    let filteredCarts = [...carts];

    if (filterOption === "active") {
      filteredCarts = filteredCarts.filter((cart) => cart.isActive);
    } else if (filterOption === "inactive") {
      filteredCarts = filteredCarts.filter((cart) => !cart.isActive);
    }

    if (
      filterOption === "all-A-Z" ||
      filterOption === "active-A-Z" ||
      filterOption === "inactive-A-Z"
    ) {
      filteredCarts = filteredCarts.sort((a, b) =>
        a.userId.localeCompare(b.userId)
      );
    } else if (
      filterOption === "all-Z-A" ||
      filterOption === "active-Z-A" ||
      filterOption === "inactive-Z-A"
    ) {
      filteredCarts = filteredCarts.sort((a, b) =>
        b.userId.localeCompare(a.userId)
      );
    } else if (filterOption === "totalItems-asc") {
      filteredCarts = filteredCarts.sort((a, b) => a.totalItems - b.totalItems);
    } else if (filterOption === "totalItems-desc") {
      filteredCarts = filteredCarts.sort((a, b) => b.totalItems - a.totalItems);
    } else if (filterOption === "totalPrice-asc") {
      filteredCarts = filteredCarts.sort((a, b) => a.totalPrice - b.totalPrice);
    } else if (filterOption === "totalPrice-desc") {
      filteredCarts = filteredCarts.sort((a, b) => b.totalPrice - a.totalPrice);
    }

    return filteredCarts;
  };
  const sortedCarts = applyFilterAndSort(searchedCarts);

  const currentCarts = sortedCarts.slice(indexOfFirstCart, indexOfLastCart);
  const totalPages = Math.ceil(sortedCarts.length / cartsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <div className="mt-4 relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <StatCard
            title="Tổng Giỏ Hàng"
            value={carts.filter((cart) => cart.totalItems > 0).length}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg hover:scale-105 transform transition-all duration-300"
          />
        </div>
        <div className="flex items-center justify-between flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-4 w-full max-w-lg mt-3">
            <form className="flex items-center space-x-4 w-full">
              <label
                htmlFor="search"
                className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
              >
                Tìm kiếm
              </label>
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  id="search"
                  value={searchInput}
                  onChange={handleSearchChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Nhập tên người dùng"
                />
                {showHistory && searchHistory.length > 0 && (
                  <div
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-md 
                  dark:bg-gray-800 dark:border-gray-700"
                  >
                    <ul className="text-sm text-gray-900 dark:text-white">
                      {searchHistory.map((item, index) => (
                        <li
                          key={index}
                          onMouseDown={() =>
                            handleSearchChange({ target: { value: item } })
                          }
                          className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </form>
            <div className="flex items-center space-x-4 mt-4 mb-4">
              <select
                className="p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 
               focus:ring-blue-500 focus:border-blue-500 
               dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={filterOption}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="all-Z-A">A-Z</option>
                <option value="all-A-Z">Z-A</option>
                <option value="totalItems-asc">Số lượng tăng dần</option>
                <option value="totalItems-desc">Số lượng giảm dần</option>
                <option value="totalPrice-asc">Giá trị tăng dần</option>
                <option value="totalPrice-desc">Giá trị giảm dần</option>
              </select>
            </div>
          </div>
        </div>

        <CartListTable carts={currentCarts} setCarts={setCarts} />
      </div>

      <div className="flex justify-end mt-6">
        <nav aria-label="Page navigation">
          <ul className="flex items-center space-x-1 text-sm">
            <li>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-l-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50
                     dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <li key={pageNumber}>
                  <button
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-4 py-2 border rounded-lg ${
                      currentPage === pageNumber
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    } dark:border-gray-600`}
                  >
                    {pageNumber}
                  </button>
                </li>
              )
            )}
            <li>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-r-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50
                     dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default CartList;
