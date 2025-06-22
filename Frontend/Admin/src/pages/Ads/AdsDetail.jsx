import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaLink,
  FaImage,
  FaBullseye,
  FaCalendarAlt,
  FaTag,
} from "react-icons/fa";
import BackButton from "../../components/BackButton";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) {
    return "Ngày không hợp lệ";
  }
  return new Intl.DateTimeFormat("vi-VN").format(date);
};

const getUserToken = () => {
  return localStorage.getItem("userToken");
};

const AdsDetail = () => {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdDetail = async () => {
      try {
        const userToken = getUserToken();
        const response = await axios.get(
          `http://localhost:8081/api/ad-images/${id}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        setAd(response.data);
      } catch (error) {
        setError("Không thể tải thông tin quảng cáo.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAdDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-blue-600">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Không tìm thấy quảng cáo.</div>
      </div>
    );
  }

  const {
    title,
    description,
    image,
    link,
    startDate,
    endDate,
    isActive,
    adType,
  } = ad;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto flex justify-center items-center space-x-4">
        <h1 className="text-3xl font-semibold text-gray-800 text-center dark:text-white">
          Chi tiết quảng cáo
        </h1>
      </div>
      <div className="max-w-4xl mx-auto flex justify-between mt-4">
        <BackButton path="/ads-list" />
        <button
          onClick={() => navigate(`/edit-ads/${id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
            />
          </svg>
          <span>Chỉnh sửa quảng cáo</span>
        </button>
      </div>
      <div className="max-w-4xl mx-auto mt-4 bg-white overflow-hidden shadow-lg rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-6 py-5 sm:px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-6">
            <img
              className="w-24 h-24 rounded-full border-4 border-white"
              src={image}
              alt={title}
            />
            <div>
              <h3 className="text-3xl font-semibold dark:text-white">
                {title}
              </h3>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:p-0 dark:border-gray-600">
          <dl className="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-white">
                <FaImage className="inline mr-2 text-orange-500" />
                Mô tả
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-white">
                {description}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-white">
                <FaLink className="inline mr-2 text-blue-500" />
                Liên kết
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-white">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
                >
                  {link}
                </a>
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-white">
                <FaBullseye className="inline mr-2 text-green-500" />
                Trạng thái
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-white">
                {isActive ? (
                  <span className="text-green-500 font-semibold">
                    Hoạt động
                  </span>
                ) : (
                  <span className="text-red-500 font-semibold">
                    Không hoạt động
                  </span>
                )}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-white">
                <FaTag className="inline mr-2 text-yellow-500" />
                Loại quảng cáo
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-white">
                {adType === "main"
                  ? "Chính"
                  : adType === "secondary"
                  ? "Phụ"
                  : adType}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-white">
                <FaCalendarAlt className="inline mr-2 text-blue-500" />
                Ngày bắt đầu
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-white">
                {formatDate(startDate)}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-white">
                <FaCalendarAlt className="inline mr-2 text-red-500" />
                Ngày kết thúc
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-white">
                {formatDate(endDate)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="max-w-4xl mx-auto flex justify-between mt-4">
        <BackButton path="/ads-list" />
        <button
          onClick={() => navigate(`/edit-ads/${id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg shadow flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
            />
          </svg>
          <span>Chỉnh sửa quảng cáo</span>
        </button>
      </div>
    </div>
  );
};

export default AdsDetail;
