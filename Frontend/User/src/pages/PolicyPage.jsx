import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import PolicyDetail from "../components/PolicyDetail";
import Breadcrumb from "../components/Breadcrumb";
import { FaHome } from "react-icons/fa";
import { MdPolicy } from "react-icons/md";
import { ToastContainer } from "react-toastify";

const PolicyPage = () => {
  const { type } = useParams();
  const [policy, setPolicy] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const location = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location]);

  useEffect(() => {
    const fetchPolicies = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          "http://localhost:8081/api/policies/no-delete",
          {
            params: { sortBy: "title", sortOrder: "asc" },
          }
        );
        setPolicies(response.data);
      } catch (err) {
        console.error("Lỗi khi lấy chính sách:", err);
        setError("Không thể tải danh sách chính sách.");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  useEffect(() => {
    const foundPolicy = policies.find((p) => p.type === type);
    setPolicy(foundPolicy);
  }, [type, policies]);

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: FaHome },
    policy
      ? {
          label: policy.title,
          href: `/policy/${type}`,
          icon: MdPolicy,
        }
      : null,
  ].filter(Boolean);

  return (
    <>
      <ToastContainer />
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex justify-center items-center bg-gray-100 dark:bg-neutral-800 p-4 md:p-8 min-h-screen">
        {loading ? (
          <p className="text-gray-700 dark:text-gray-200">
            Đang tải chính sách...
          </p>
        ) : error ? (
          <p className="text-red-500 dark:text-red-400">{error}</p>
        ) : (
          <PolicyDetail policy={policy} darkMode />
        )}
      </div>
    </>
  );
};

export default PolicyPage;
