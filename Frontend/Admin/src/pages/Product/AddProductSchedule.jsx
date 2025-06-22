import React from "react";
import AddProductScheduleForm from "../../components/Product/AddProductScheduleForm";

const AddProductSchedule = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Đặt lịch sản phẩm
      </h1>
      <AddProductScheduleForm />
    </div>
  );
};

export default AddProductSchedule;
