import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const InventoryListTable = ({
  inventories,
  setInventories,
  selectedInventoryIds,
  handleToggleSelect,
  handleSelectAll,
  isAllSelected,
}) => {
  const navigate = useNavigate();

  const handleViewDetail = (id) => {
    navigate(`/inventory-detail/${id}`);
  };

  return (
    <div>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-white mt-4">
        <thead className="text-xs text-gray-700 dark:text-white uppercase bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th scope="col" className="px-6 py-3">
              Ngày nhập kho
            </th>
            <th scope="col" className="px-6 py-3">
              Sản phẩm
            </th>
            <th scope="col" className="px-6 py-3">
              Tổng số lượng
            </th>
            <th scope="col" className="px-6 py-3">
              Tổng giá trị
            </th>
            <th scope="col" className="px-6 py-3">
              Nhà cung cấp
            </th>
          </tr>
        </thead>
        <tbody>
          {inventories.map((inventory) => (
            <tr
              key={inventory.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedInventoryIds.includes(inventory.id)}
                  onChange={() => handleToggleSelect(inventory.id)}
                />
              </td>

              <td className="px-6 py-4 dark:text-white">
                {format(new Date(inventory.receivedDate), "dd-MM-yyyy HH:mm")}
              </td>
              <td
                className="px-6 py-4 relative dark:text-white"
                onClick={() => handleViewDetail(inventory.id)}
              >
                <span className="group relative cursor-pointer hover:text-blue-500 hover:underline">
                  <ul>
                    {inventory.products.map((product) => (
                      <li
                        key={product.productId}
                        className="text-sm dark:text-white"
                      >
                        <strong>{product.productName}</strong>
                      </li>
                    ))}
                  </ul>{" "}
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow">
                    Xem chi tiết nhập kho
                  </span>
                </span>
              </td>
              <td className="px-6 py-4 dark:text-white">
                {inventory.totalQuantity}
              </td>
              <td className="px-6 py-4 dark:text-white">
                {inventory.totalAmount.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </td>
              <td className="px-6 py-4 dark:text-white">
                {inventory.supplier?.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryListTable;
