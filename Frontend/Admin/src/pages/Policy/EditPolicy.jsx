import React from "react";
import EditPolicyForm from "../../components/Policy/EditPolicyForm";

const EditPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Chỉnh sửa chính sách
      </h1>
      <EditPolicyForm />
    </div>
  );
};

export default EditPolicy;
