import React from "react";
import AddOrderForm from "../../components/Order/AddOrderForm";

const AddOrder = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Thêm đơn đặt hàng mới
      </h1>
      <AddOrderForm />
    </div>
  );
};

export default AddOrder;
