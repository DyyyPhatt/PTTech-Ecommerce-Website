import React from "react";
import EditUserForm from "../../components/User/EditUserForm";

const EditUser = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-white">
        Chỉnh sửa thông tin người dùng
      </h1>
      <EditUserForm />
    </div>
  );
};

export default EditUser;
