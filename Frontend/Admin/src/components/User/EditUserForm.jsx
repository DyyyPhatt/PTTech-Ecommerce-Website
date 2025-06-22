import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useEditUser from "../../hooks/User/useEditUser";
import BackButton from "../BackButton";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaHome,
  FaMapMarkerAlt,
  FaCity,
  FaGlobe,
  FaCheck,
  FaExclamationCircle,
} from "react-icons/fa";

const EditUserForm = () => {
  const { id } = useParams();
  const {
    userData,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    rolesList,
    handleChange,
    handleRoleChange,
    handleSubmit,
  } = useEditUser(id);
  const navigate = useNavigate();

  useEffect(() => {
    if (showSuccessMessage) {
      setTimeout(() => {
        navigate("/user-list");
      }, 3000);
    }
  }, [showSuccessMessage, navigate]);

  return (
    <>
      <div className="max-w-4xl mx-auto flex justify-start mb-4">
        <BackButton path="/user-list" />
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto"
      >
        {showErrorMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-white bg-red-500 rounded-lg shadow-lg"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-white bg-red-400 rounded-lg">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0Zm1 14h-2v-2h2v2Zm0-4h-2V6h2v4Z" />
              </svg>
            </div>
            <div className="ml-3 text-sm font-normal">
              Cập nhật người dùng thất bại. Vui lòng thử lại!
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white dark:bg-gray-700 dark:text-white rounded-lg shadow-lg"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            </div>
            <div className="ml-3 text-sm font-normal">
              Cập nhật người dùng thành công.
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">
            THÔNG TIN NGƯỜI DÙNG
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="username"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Tên đăng nhập
              </label>
              <div className="flex items-center border rounded-lg p-2">
                <FaUser className="text-blue-500" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={userData.username || ""}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-700 border-0 w-full text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-2"
                  placeholder="Tên đăng nhập"
                  required
                />
              </div>
              {errors.username && (
                <span className="text-red-500 text-sm">{errors.username}</span>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Email
              </label>
              <div className="flex items-center border rounded-lg p-2">
                <FaEnvelope className="text-blue-500" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email || ""}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-700 border-0 w-full text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-2"
                  placeholder="Địa chỉ Email"
                  required
                />
              </div>
              {errors.email && (
                <span className="text-red-500 text-sm">{errors.email}</span>
              )}
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Số điện thoại
              </label>
              <div className="flex items-center border rounded-lg p-2">
                <FaPhone className="text-blue-500" />
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={userData.phoneNumber || ""}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-700 border-0 w-full text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-2"
                  placeholder="Số điện thoại"
                  required
                />
              </div>
              {errors.phoneNumber && (
                <span className="text-red-500 text-sm">
                  {errors.phoneNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-300 dark:border-gray-600" />

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">
            ĐỊA CHỈ
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* STREET */}
            <div>
              <label
                htmlFor="address.street"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Đường
              </label>
              <div className="flex items-center border rounded-lg p-2">
                <FaHome className="text-blue-500" />
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={userData.address.street || ""}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-700 border-0 w-full text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-2"
                  placeholder="Đường"
                  required
                />
              </div>
              {errors.address?.street && (
                <span className="text-red-500 text-sm">
                  {errors.address.street}
                </span>
              )}
            </div>

            {/* COMMUNES */}
            <div>
              <label
                htmlFor="address.communes"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Phường / Xã
              </label>
              <div className="flex items-center border rounded-lg p-2">
                <FaMapMarkerAlt className="text-blue-500" />
                <input
                  type="text"
                  id="address.communes"
                  name="address.communes"
                  value={userData.address.communes || ""}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-700 border-0 w-full text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-2"
                  placeholder="Phường / Xã"
                  required
                />
              </div>
              {errors.address?.communes && (
                <span className="text-red-500 text-sm">
                  {errors.address.communes}
                </span>
              )}
            </div>

            {/* DISTRICT */}
            <div>
              <label
                htmlFor="address.district"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Quận / Huyện
              </label>
              <div className="flex items-center border rounded-lg p-2">
                <FaMapMarkerAlt className="text-blue-500" />
                <input
                  type="text"
                  id="address.district"
                  name="address.district"
                  value={userData.address.district || ""}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-700 border-0 w-full text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-2"
                  placeholder="Quận / Huyện"
                  required
                />
              </div>
              {errors.address?.district && (
                <span className="text-red-500 text-sm">
                  {errors.address.district}
                </span>
              )}
            </div>

            {/* CITY */}
            <div>
              <label
                htmlFor="address.city"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Tỉnh / Thành phố
              </label>
              <div className="flex items-center border rounded-lg p-2">
                <FaCity className="text-blue-500" />
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={userData.address.city || ""}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-700 border-0 w-full text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-2"
                  placeholder="Tỉnh / Thành phố"
                  required
                />
              </div>
              {errors.address?.city && (
                <span className="text-red-500 text-sm">
                  {errors.address.city}
                </span>
              )}
            </div>

            {/* COUNTRY */}
            <div>
              <label
                htmlFor="address.country"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Quốc gia
              </label>
              <div className="flex items-center border rounded-lg p-2">
                <FaGlobe className="text-blue-500" />
                <input
                  type="text"
                  id="address.country"
                  name="address.country"
                  value={userData.address.country || ""}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-700 border-0 w-full text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-2"
                  placeholder="Quốc gia"
                  required
                />
              </div>
              {errors.address?.country && (
                <span className="text-red-500 text-sm">
                  {errors.address.country}
                </span>
              )}
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-300 dark:border-gray-600" />

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">
            VAI TRÒ
          </h2>
          <div>
            {rolesList.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={role.id}
                  name="roles"
                  value={role.id}
                  checked={userData.roles.some(
                    (r) => r.roleName === role.label
                  )}
                  onChange={handleRoleChange}
                  className="h-4 w-4 text-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={role.id}
                  className="text-sm text-gray-900 dark:text-white"
                >
                  {role.displayLabel}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật người dùng"}
          </button>
        </div>
      </form>
      <div className="max-w-4xl mx-auto flex justify-start mt-4">
        <BackButton path="/user-list" />
      </div>
    </>
  );
};

export default EditUserForm;
