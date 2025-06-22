import React from "react";

const UnauthorizedPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-12 rounded-lg shadow-lg max-w-lg w-full text-center">
        <h1 className="text-5xl font-bold text-red-600 mb-6">
          Không có quyền truy cập!
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ với quản
          trị viên để được cấp quyền truy cập.
        </p>
        <a
          href="/"
          className="text-blue-500 hover:underline text-lg font-medium"
        >
          Quay lại trang chủ
        </a>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
