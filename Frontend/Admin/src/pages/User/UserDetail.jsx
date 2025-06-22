import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaAddressCard,
  FaUserAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import BackButton from "../../components/BackButton";
import { useParams, useNavigate } from "react-router-dom";

const UserDetail = ({ onBack }) => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const roleMapping = {
    ADMIN: "Quản trị viên",
    MANAGER: "Quản lý",
    CUSTOMER: "Khách hàng",
    CUSTOMER_SUPPORT: "Hỗ trợ khách hàng",
    INVENTORY_MANAGER: "Quản lý kho",
    MARKETING: "Chuyên viên marketing",
  };

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const token = getUserToken();

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(
          `http://localhost:8081/api/users/${id}`,
          config
        );
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin người dùng.");
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center text-lg text-gray-600">
        Đang tải thông tin...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-lg text-red-500">{error}</div>;
  }

  if (!user) {
    return (
      <div className="text-center text-lg text-gray-600">
        Không có dữ liệu người dùng.
      </div>
    );
  }

  const {
    username,
    email,
    phoneNumber,
    avatar,
    address,
    roles,
    isVerified,
    isBlocked,
    blockReason,
    isSubscribedToEmails,
    createdAt,
    updatedAt,
  } = user;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-6 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto flex justify-center items-center space-x-4">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white text-center">
          Chi tiết người dùng
        </h1>
      </div>
      <div className="max-w-4xl mx-auto flex justify-between mt-4">
        <BackButton path="/user-list" />
        <button
          onClick={() => navigate(`/edit-user/${id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
            />
          </svg>
          <span>Chỉnh sửa người dùng</span>
        </button>
      </div>
      <div className="max-w-4xl mx-auto mt-4 bg-white overflow-hidden shadow-lg rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-6 py-5 sm:px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
          <h3 className="text-2xl font-semibold">
            <FaUserAlt className="inline mr-2" />
            {username}
          </h3>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:p-0 dark:border-gray-600">
          <dl className="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaEnvelope className="inline mr-2 text-blue-500" />
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {email}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaPhoneAlt className="inline mr-2 text-blue-500" />
                Số điện thoại
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {phoneNumber}
              </dd>
            </div>

            {address && (
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  <FaAddressCard className="inline mr-2 text-blue-500" />
                  Địa chỉ
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  <span className="font-bold">Đường:</span> {address.street}
                  <br />
                  <span className="font-bold">Phường/Xã:</span>{" "}
                  {address.communes}
                  <br />
                  <span className="font-bold">Quận/Huyện:</span>{" "}
                  {address.district}
                  <br />
                  <span className="font-bold">Tỉnh/Thành phố:</span>{" "}
                  {address.city}
                  <br />
                  <span className="font-bold">Quốc gia:</span> {address.country}
                </dd>
              </div>
            )}

            {roles && roles.length > 0 && (
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Vai trò
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {roles.map((role, index) => (
                    <div key={index} className="mt-2">
                      <span className="font-semibold text-indigo-600">
                        {roleMapping[role.roleName] || role.roleName}{" "}
                      </span>
                    </div>
                  ))}
                </dd>
              </div>
            )}

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                Trạng thái xác thực
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {isVerified ? (
                  <span className="text-green-500">
                    <FaCheckCircle className="inline mr-2" />
                    Đã xác thực
                  </span>
                ) : (
                  <span className="text-red-500">
                    <FaTimesCircle className="inline mr-2" />
                    Chưa xác thực
                  </span>
                )}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                Đăng ký nhận email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {isSubscribedToEmails ? (
                  <span className="text-green-500">
                    <FaCheckCircle className="inline mr-2" /> Đã đăng ký
                  </span>
                ) : (
                  <span className="text-red-500">
                    <FaTimesCircle className="inline mr-2" />
                    Chưa đăng ký
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex justify-between mt-4">
        <BackButton path="/user-list" />
        <button
          onClick={() => navigate(`/edit-user/${id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
            />
          </svg>
          <span>Chỉnh sửa người dùng</span>
        </button>
      </div>
    </div>
  );
  
};

export default UserDetail;
