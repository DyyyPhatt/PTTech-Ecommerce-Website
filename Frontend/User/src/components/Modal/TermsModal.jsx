import React from "react";
import { FaRegSmileBeam } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 dark:bg-black dark:bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out opacity-100">
      <div className="bg-white dark:bg-gray-900 w-full max-w-xl p-8 rounded-lg shadow-lg border-2 border-gray-300 dark:border-gray-700 transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <FaRegSmileBeam className="text-yellow-500 text-3xl" />
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-200">
              Điều khoản bảo mật
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition transform hover:scale-125 duration-200"
          >
            <IoMdClose />
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <p>
            Chúng tôi cam kết bảo mật thông tin của bạn và chỉ sử dụng cho mục
            đích cụ thể. Chi tiết về các quyền và nghĩa vụ của bạn có thể tham
            khảo tại đây.
          </p>
          <p>
            Vui lòng đọc kỹ điều khoản và điều kiện trước khi sử dụng dịch vụ
            của chúng tôi. Việc đồng ý các điều khoản này là rất quan trọng để
            đảm bảo bạn có trải nghiệm tốt nhất với chúng tôi.
          </p>
          <p>
            Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên
            hệ với chúng tôi qua các kênh hỗ trợ.
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="bg-red-600 text-white py-2 px-8 rounded-lg hover:bg-red-800 dark:hover:bg-red-700 transition duration-200 transform hover:scale-105"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
