import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaFacebook, FaUserPlus } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { HiUser, HiMail, HiPhone, HiLockClosed } from "react-icons/hi";
import InputField from "../components/InputField";
import useRegisterForm from "../hooks/useRegisterForm";
import TermsModal from "../components/Modal/TermsModal";
import { GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login";
import { ToastContainer } from "react-toastify";
import Breadcrumb from "../components/Breadcrumb";
import { FaHome } from "react-icons/fa";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    formData,
    errors,
    handleChange,
    isLoading,
    isFormValid,
    handleSubmitForm,
    handleGoogleSuccess,
    handleGoogleFailure,
    handleFacebookLogin,
  } = useRegisterForm();

  const location = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location]);

  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const handleCheckboxChange = () => {
    setAgreedToTerms((prev) => !prev);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await handleSubmitForm(agreedToTerms);
  };

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: FaHome },
    { label: "Đăng ký", href: "/register", icon: FaUserPlus },
  ];

  return (
    <>
      <ToastContainer />
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex justify-center items-center bg-gray-100 dark:bg-neutral-800 p-4 md:p-8 min-h-screen">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700">
          <h2 className="text-3xl font-bold text-center mb-6 text-[#900c1b] dark:text-red-400">
            Đăng ký tài khoản
          </h2>
          <form onSubmit={handleFormSubmit} className="space-y-5">
            <InputField
              type="text"
              name="firstName"
              value={formData.firstName}
              placeholder="Họ"
              onChange={handleChange}
              onBlur={handleChange}
              icon={HiUser}
              error={errors.firstName}
              className="dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
            />
            <InputField
              type="text"
              name="lastName"
              value={formData.lastName}
              placeholder="Tên"
              onChange={handleChange}
              onBlur={handleChange}
              icon={HiUser}
              error={errors.lastName}
              className="dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
            />
            <InputField
              type="email"
              name="email"
              value={formData.email}
              placeholder="Email"
              onChange={handleChange}
              onBlur={handleChange}
              icon={HiMail}
              error={errors.email}
              className="dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
            />
            <InputField
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              placeholder="Số điện thoại"
              onChange={handleChange}
              onBlur={handleChange}
              icon={HiPhone}
              error={errors.phoneNumber}
              className="dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
            />
            <InputField
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              placeholder="Mật khẩu"
              onChange={handleChange}
              onBlur={handleChange}
              icon={HiLockClosed}
              error={errors.password}
              showToggle={showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              toggleVisibility={() => setShowPassword((prev) => !prev)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
            />
            <InputField
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              placeholder="Xác nhận mật khẩu"
              onChange={handleChange}
              onBlur={handleChange}
              icon={HiLockClosed}
              error={errors.confirmPassword}
              showToggle={
                showConfirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />
              }
              toggleVisibility={() => setShowConfirmPassword((prev) => !prev)}
              className="dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreedToTerms}
                onChange={handleCheckboxChange}
                className="mr-2 accent-red-700"
              />
              <label
                htmlFor="agreeToTerms"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Tôi đồng ý với{" "}
                <button
                  type="button"
                  onClick={openModal}
                  className="text-blue-500 hover:underline dark:text-blue-400"
                >
                  các điều khoản bảo mật
                </button>
              </label>
            </div>

            {!agreedToTerms && (
              <div className="text-red-500 text-xs">
                Bạn cần đồng ý với các điều khoản bảo mật để tiếp tục.
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-3 text-white text-lg transition ${
                isFormValid(agreedToTerms) && !isLoading
                  ? "bg-red-700 hover:bg-red-900"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!isFormValid(agreedToTerms) || isLoading}
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
                  <FaUserPlus className="text-2xl" />
                  Đăng ký
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-gray-500 dark:text-gray-400">
              Bạn đã có tài khoản?
            </span>
            <Link
              to="/login"
              className="text-[#900c1b] hover:underline ml-1 font-medium dark:text-red-400"
            >
              Đăng nhập
            </Link>
          </div>

          <div className="flex items-center mt-6">
            <hr className="flex-grow border-gray-300 dark:border-gray-600" />
            <span className="mx-2 text-gray-400 dark:text-gray-500">HOẶC</span>
            <hr className="flex-grow border-gray-300 dark:border-gray-600" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 mt-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap
              theme="filled_blue"
              shape="circle"
              width="250px"
            />
            <FacebookLogin
              appId="648208938135117"
              fields="name,email,picture"
              callback={handleFacebookLogin}
              icon={<FaFacebook />}
              textButton="Đăng ký với Facebook"
              cssClass="social-button facebook-button"
            />
          </div>
        </div>
      </div>

      <TermsModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default RegisterForm;
