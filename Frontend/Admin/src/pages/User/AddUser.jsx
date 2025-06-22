import React from "react";
import AddUserForm from "../../components/User/AddUserForm";
import useAddUser from "../../hooks/User/useAddUser";

const AddUser = () => {
  const { userData, handleChange, handleSubmit } = useAddUser();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
        Thêm người dùng mới
      </h1>
      <AddUserForm
        userData={userData}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AddUser;
