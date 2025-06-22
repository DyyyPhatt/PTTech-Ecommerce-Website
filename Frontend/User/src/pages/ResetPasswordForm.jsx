import React, { useEffect } from "react";
import { HiLockClosed } from "react-icons/hi";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { MdLockReset } from "react-icons/md";
import InputField from "../components/InputField";
import { ToastContainer } from "react-toastify";
import useResetPasswordForm from "../hooks/useResetPasswordForm";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import { FaHome } from "react-icons/fa";

const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const {
    formData,
    errors,
    showPassword,
    showConfirmPassword,
    isLoading,
    handleChange,
    isFormValid,
    handleSubmitForm,
    togglePasswordVisibility,
  } = useResetPasswordForm(token);

  const location = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSubmitForm();
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: FaHome },
    {
      label: "Đặt lại mật khẩu",
      href: `/reset-password/${token}`,
      icon: MdLockReset,
    },
  ];

  return (
    <>
      <ToastContainer />
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex justify-center items-center bg-gray-100 dark:bg-neutral-800 p-4 md:p-8 min-h-screen">
        <div className="w-full max-w-xl bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-700">
          <h2 className="text-3xl font-bold text-center mb-6 text-[#900c1b] dark:text-red-400">
            Đặt lại mật khẩu
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              placeholder="Mật khẩu mới"
              onChange={handleChange}
              icon={HiLockClosed}
              error={errors.password}
              showToggle={showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              toggleVisibility={() => togglePasswordVisibility("password")}
              darkMode // Pass a prop to handle dark styling inside InputField
            />
            <InputField
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              placeholder="Xác nhận mật khẩu"
              onChange={handleChange}
              icon={HiLockClosed}
              error={errors.confirmPassword}
              showToggle={
                showConfirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />
              }
              toggleVisibility={() =>
                togglePasswordVisibility("confirmPassword")
              }
              darkMode
            />
            <button
              type="submit"
              className={`w-full text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-3 transition ${
                isFormValid()
                  ? "bg-red-700 hover:bg-red-900"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!isFormValid()}
            >
              {isLoading ? (
                <svg
                  aria-hidden="true"
                  role="status"
                  className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-400"
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
              ) : (
                <MdLockReset className="text-2xl" />
              )}
              {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordForm;
