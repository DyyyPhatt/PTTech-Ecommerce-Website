import React from "react";
import EditOrderForm from "../../components/Order/EditOrderForm";

const EditOrder = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Chỉnh sửa đơn đặt hàng
      </h1>
      <EditOrderForm />
    </div>
  );
};

export default EditOrder;
