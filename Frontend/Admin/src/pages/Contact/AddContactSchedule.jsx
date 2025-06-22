import React from "react";
import AddContactScheduleForm from "../../components/Contact/AddContactScheduleForm";

const AddContactSchedule = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-6">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Đặt lịch liên hệ
      </h1>
      <AddContactScheduleForm />
    </div>
  );
};

export default AddContactSchedule;
