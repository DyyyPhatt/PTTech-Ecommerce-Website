import React from "react";
import { useResetPassword } from "../../hooks/Login/useResetPassword";

const ResetPassword = () => {
  const {
    password,
    confirmPassword,
    error,
    isSuccess,
    isLoading,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
  } = useResetPassword();

  return (
    <main className="flex items-center justify-center w-full min-h-screen p-6 sm:px-8 md:px-12 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white border-2 border-indigo-300 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 w-full max-w-md">
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Đặt lại mật khẩu
          </h1>

          {error && (
            <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
          )}
          {isSuccess && (
            <p className="text-sm text-green-600 mb-4 text-center">
              Đặt lại mật khẩu thành công.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
              >
                Mật khẩu mới
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
              >
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                name="confirm-password"
                id="confirm-password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 inline-flex justify-center items-center gap-2 rounded-md font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all text-sm"
            >
              {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
            Quay lại{" "}
            <a
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              đăng nhập
            </a>
          </p>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
