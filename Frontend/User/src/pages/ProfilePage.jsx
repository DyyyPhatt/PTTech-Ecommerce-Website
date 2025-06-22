import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  HiUser,
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiLockClosed,
} from "react-icons/hi";
import {
  FaAddressCard,
  FaCamera,
  FaUserEdit,
  FaStreetView,
  FaCity,
  FaSave,
  FaHome,
  FaTrashAlt,
} from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FaMapLocationDot } from "react-icons/fa6";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdLocationCity } from "react-icons/md";
import InputField from "../components/InputField";
import Breadcrumb from "../components/Breadcrumb";
import useProfileEdit from "../hooks/useProfileEdit";
import ConfirmModal from "../components/Modal/ConfirmModal";

const ProfileEdit = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    profileData,
    errors,
    showPassword,
    isLoading,
    handleChange,
    handleSubmit,
    handleImageChange,
    togglePasswordVisibility,
    deleteUserProfile,
  } = useProfileEdit();

  const handleDeleteAccount = async () => {
    try {
      await deleteUserProfile();
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản:", error);
    }
    setIsModalOpen(false);
  };

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: FaHome },
    { label: "Thông tin cá nhân", href: "/profile", icon: FaUserEdit },
  ];

  return (
    <>
      <ToastContainer />
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex justify-center items-center bg-gray-100 dark:bg-neutral-800 py-10 px-4 md:px-8">
        <div className="w-full max-w-3xl bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg space-y-8">
          <h2 className="text-4xl font-bold text-center text-[#900c1b] dark:text-red-400 flex items-center justify-center space-x-3">
            <FaUserEdit className="text-4xl" />
            <span>Thông tin cá nhân</span>
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex justify-center mb-6">
              <label htmlFor="avatar" className="cursor-pointer relative">
                <div className="w-36 h-36 rounded-full overflow-hidden shadow-xl transform transition duration-300 hover:scale-105 hover:shadow-2xl">
                  <img
                    src={profileData.avatar || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <FaCamera
                  size={26}
                  className="absolute p-1 top-0 right-0 text-white bg-black dark:bg-gray-600 rounded-full cursor-pointer transition duration-300 transform hover:scale-110 hover:bg-gray-600"
                />
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* User Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                type="text"
                name="username"
                value={profileData.username}
                placeholder="Tên đăng nhập"
                onChange={handleChange}
                icon={HiUser}
                error={errors.username}
              />
              <InputField
                type="email"
                name="email"
                value={profileData.email}
                placeholder="Email"
                onChange={handleChange}
                icon={HiMail}
                error={errors.email}
              />
              <InputField
                type="text"
                name="phone"
                value={profileData.phone}
                placeholder="Số điện thoại"
                onChange={handleChange}
                icon={HiPhone}
                error={errors.phone}
              />
            </div>

            {/* Address Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center space-x-2">
                <FaAddressCard className="text-red-700 text-2xl" />
                <span className="text-red-700">Địa chỉ</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField
                  type="text"
                  name="street"
                  value={profileData.street}
                  placeholder="Đường phố"
                  onChange={handleChange}
                  icon={FaStreetView}
                  error={errors.street}
                />
                <InputField
                  type="text"
                  name="communes"
                  value={profileData.communes}
                  placeholder="Xã/phường"
                  onChange={handleChange}
                  icon={HiLocationMarker}
                  error={errors.communes}
                />
                <InputField
                  type="text"
                  name="district"
                  value={profileData.district}
                  placeholder="Quận/huyện"
                  onChange={handleChange}
                  icon={MdLocationCity}
                  error={errors.district}
                />
                <InputField
                  type="text"
                  name="city"
                  value={profileData.city}
                  placeholder="Thành phố"
                  onChange={handleChange}
                  icon={FaCity}
                  error={errors.city}
                />
                <InputField
                  type="text"
                  name="country"
                  value={profileData.country}
                  placeholder="Quốc gia"
                  onChange={handleChange}
                  icon={FaMapLocationDot}
                  error={errors.country}
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center space-x-2">
                <RiLockPasswordFill className="text-red-700 text-2xl" />
                <span className="text-red-700">Mật khẩu</span>
              </h3>
              <InputField
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={profileData.newPassword}
                placeholder="Mật khẩu mới"
                onChange={handleChange}
                icon={HiLockClosed}
                error={errors.newPassword}
                showToggle={
                  showPassword ? <AiFillEyeInvisible /> : <AiFillEye />
                }
                toggleVisibility={togglePasswordVisibility}
              />
              <InputField
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={profileData.confirmPassword}
                placeholder="Xác nhận mật khẩu"
                onChange={handleChange}
                icon={HiLockClosed}
                error={errors.confirmPassword}
                showToggle={
                  showPassword ? <AiFillEyeInvisible /> : <AiFillEye />
                }
                toggleVisibility={togglePasswordVisibility}
              />
            </div>

            <div className="flex items-center space-x-3 mt-6">
              <input
                type="checkbox"
                name="subscribedToEmails"
                id="subscribedToEmails"
                checked={profileData.subscribedToEmails}
                onChange={handleChange}
                className="h-6 w-6 text-red-700 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-red-500 cursor-pointer transition-all duration-300 transform hover:scale-110 hover:border-red-600"
              />
              <label
                htmlFor="subscribedToEmails"
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                Nhận thông báo qua email
              </label>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                type="submit"
                className="w-full md:w-auto bg-red-700 text-white py-3 px-8 rounded-xl font-semibold text-lg hover:bg-red-800 hover:scale-105 transition-all duration-300 transform shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="#1C64F2"
                      />
                    </svg>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <FaSave size={22} />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="w-full md:w-auto bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700 text-white py-3 px-8 rounded-xl font-semibold text-lg hover:bg-gray-800 hover:scale-105 transition-all duration-300 transform shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center justify-center space-x-2"
                onClick={() => setIsModalOpen(true)}
              >
                {isLoading ? (
                  <>
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="#1C64F2"
                      />
                    </svg>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <FaTrashAlt size={22} />
                    <span>Xóa tài khoản</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </>
  );
};

export default ProfileEdit;
