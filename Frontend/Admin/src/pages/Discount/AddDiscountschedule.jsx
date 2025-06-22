import React from "react";
import AddDiscountScheduleForm from "../../components/Discount/AddDiscountScheduleForm";

const AddDiscountschedule = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Đặt lịch mã giảm giá
      </h1>
      <AddDiscountScheduleForm />
    </div>
  );
};

export default AddDiscountschedule;
