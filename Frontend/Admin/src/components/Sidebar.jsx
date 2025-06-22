import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AiOutlineUser,
  AiOutlineTags,
  AiOutlineShoppingCart,
  AiOutlineBarChart,
  AiFillDatabase,
  AiOutlineInbox,
  AiOutlineFileDone,
  AiOutlineShopping,
  AiOutlineFileImage,
  AiOutlinePhone,
  AiOutlineLike,
  AiOutlineQuestionCircle,
  AiFillProduct,
  AiFillBug,
  AiFillSafetyCertificate,
} from "react-icons/ai";

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (paths) =>
    Array.isArray(paths) && paths.some((path) => currentPath.startsWith(path));

  const navItems = [
    {
      mainPath: "/statistic-list",
      matchPaths: ["/statistic-list", "/statistic-detail"],
      icon: <AiOutlineBarChart size={20} />,
      label: "Thống kê",
    },
    {
      mainPath: "/user-list",
      matchPaths: ["/user-list", "/user-detail", "/add-user", "/edit-user"],
      icon: <AiOutlineUser size={20} />,
      label: "Người dùng",
    },
    {
      mainPath: "/product-list",
      matchPaths: [
        "/product-list",
        "/product-detail",
        "/add-product",
        "/add-product-schedule",
        "/edit-product",
        "/edit-price-product",
      ],
      icon: <AiOutlineInbox size={20} />,
      label: "Sản phẩm",
    },
    {
      mainPath: "/brand-list",
      matchPaths: [
        "/brand-list",
        "/brand-detail",
        "/add-brand",
        "/add-brand-schedule",
        "/edit-brand",
      ],
      icon: <AiFillProduct size={20} />,
      label: "Thương hiệu",
    },
    {
      mainPath: "/category-list",
      matchPaths: [
        "/category-list",
        "/category-detail",
        "/add-category",
        "/add-category-schedule",
        "/edit-category",
      ],
      icon: <AiOutlineTags size={20} />,
      label: "Danh mục",
    },
    {
      mainPath: "/discount-list",
      matchPaths: [
        "/discount-list",
        "/discount-detail",
        "/add-discount",
        "/edit-discount",
        "/add-discount-schedule",
      ],
      icon: <AiFillDatabase size={20} />,
      label: "Mã giảm giá",
    },
    {
      mainPath: "/inventory-list",
      matchPaths: ["/inventory-list", "/inventory-detail", "/add-inventory"],
      icon: <AiOutlineShopping size={20} />,
      label: "Nhập kho",
    },
    {
      mainPath: "/order-list",
      matchPaths: ["/order-list", "/order-detail", "/add-order", "/edit-order"],
      icon: <AiOutlineFileDone size={20} />,
      label: "Đơn hàng",
    },
    {
      mainPath: "/cart-list",
      matchPaths: ["/cart-list", "/cart-detail"],
      icon: <AiOutlineShoppingCart size={20} />,
      label: "Giỏ hàng",
    },
    {
      mainPath: "/policy-list",
      matchPaths: [
        "/policy-list",
        "/policy-detail",
        "/add-policy",
        "/edit-policy",
        "/add-policy-schedule",
      ],
      icon: <AiFillSafetyCertificate size={20} />,
      label: "Chính sách",
    },
    {
      mainPath: "/ads-list",
      matchPaths: [
        "/ads-list",
        "/ads-detail",
        "/add-ads",
        "/edit-ads",
        "/add-ads-schedule",
      ],
      icon: <AiOutlineFileImage size={20} />,
      label: "Quảng cáo",
    },
    {
      mainPath: "/contact-list",
      matchPaths: [
        "/contact-list",
        "/contact-detail",
        "/add-contact",
        "/edit-contact",
        "/add-contact-schedule",
      ],
      icon: <AiOutlinePhone size={20} />,
      label: "Liên hệ",
    },
    {
      mainPath: "/review-list",
      matchPaths: [
        "/review-list",
        "/review-detail",
        "/add-review",
        "/edit-review",
      ],
      icon: <AiOutlineLike size={20} />,
      label: "Đánh giá",
    },
    {
      mainPath: "/qa-list",
      matchPaths: ["/qa-list", "/qa-detail", "/add-qa"],
      icon: <AiOutlineQuestionCircle size={20} />,
      label: "Hỏi & Đáp",
    },
    {
      mainPath: "/bug-list",
      matchPaths: ["/bug-list", "/bug-detail", "/add-bug"],
      icon: <AiFillBug size={20} />,
      label: "Lỗi",
    },
  ];

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-48"
      } h-screen bg-gray-800 text-white flex flex-col p-2 transition-all duration-300 overflow-y-auto`}
    >
      <h2 className="text-xl font-semibold text-white mt-4 mb-6 flex items-center justify-center">
        {!collapsed && (
          <Link to="/" className="hover:text-gray-400">
            PTTech Admin
          </Link>
        )}
      </h2>

      <ul className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <li key={item.mainPath}>
            <Link
              to={item.mainPath}
              className={`flex items-center gap-2 hover:text-gray-400 p-2 rounded-md transition-all ${
                isActive(item.matchPaths)
                  ? "bg-gray-700 text-blue-400 font-semibold"
                  : ""
              }`}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
