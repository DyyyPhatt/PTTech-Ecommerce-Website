import React from "react";
import { useForgotPassword } from "../../hooks/Login/useForgotPassword";
import { Mail } from "lucide-react"; // sử dụng icon từ lucide

const ForgotPassword = () => {
  const { email, error, success, handleEmailChange, handleSubmit } =
    useForgotPassword();

  return (
    <main className="flex items-center justify-center w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-2xl border border-indigo-200 dark:border-gray-700 px-8 py-10">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          Đặt lại mật khẩu
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Nhập email để nhận liên kết đặt lại mật khẩu
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="relative">
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="nhapemail@domain.com"
                className="pl-10 pr-4 py-2.5 w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          {success && (
            <p className="text-sm text-green-600 dark:text-green-400">
              ✅ Kiểm tra email để đặt lại mật khẩu.
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold text-sm shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Gửi liên kết
          </button>

          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Đã nhớ mật khẩu?{" "}
            <a
              href="/login"
              className="text-indigo-600 hover:underline font-medium"
            >
              Đăng nhập ngay
            </a>
          </p>
        </form>
      </div>
    </main>
  );
};

export default ForgotPassword;
