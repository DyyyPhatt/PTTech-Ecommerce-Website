import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ContactListTable = ({
  contacts,
  setContacts,
  selectedContactIds,
  handleToggleSelect,
  handleSelectAll,
  isAllSelected,
}) => {
  const navigate = useNavigate();

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  const handleViewDetail = (id) => {
    navigate(`/contact-detail/${id}`);
  };

  return (
    <div>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-white mt-4">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-white">
          <tr>
            <th scope="col" className="px-6 py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th scope="col" className="px-6 py-3">
              Website
            </th>
            <th scope="col" className="px-6 py-3">
              Email
            </th>
            <th scope="col" className="px-6 py-3">
              Số điện thoại
            </th>
            <th scope="col" className="px-6 py-3">
              Trạng thái
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {" "}
              <td className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedContactIds.includes(contact.id)}
                  onChange={() => handleToggleSelect(contact.id)}
                />
              </td>
              <td
                className="px-6 py-4 relative dark:text-white"
                onClick={() => handleViewDetail(contact.id)}
              >
                <span className="group relative cursor-pointer hover:text-blue-500 hover:underline">
                  {contact.companyName}
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                    Xem chi tiết liên hệ
                  </span>
                </span>
              </td>
              <td className="px-6 py-4 dark:text-white">{contact.email}</td>
              <td className="px-6 py-4 dark:text-white">
                {contact.phoneNumber}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded font-medium
      ${
        contact.isActive
          ? "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900"
          : "text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900"
      }`}
                >
                  {contact.isActive ? "Đang hiển thị" : "Đã ẩn"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactListTable;
