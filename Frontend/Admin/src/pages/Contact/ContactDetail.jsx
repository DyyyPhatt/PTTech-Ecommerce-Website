import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaClock,
  FaBullseye,
} from "react-icons/fa";
import BackButton from "../../components/BackButton";

const ContactDetail = () => {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getUserToken = () => {
    return localStorage.getItem("userToken");
  };

  useEffect(() => {
    const fetchContactDetail = async () => {
      const userToken = getUserToken();
      try {
        const response = await axios.get(
          `http://localhost:8081/api/contacts/${id}`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        setContact(response.data);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin liên hệ.");
        setLoading(false);
      }
    };

    fetchContactDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-blue-600">Đang tải thông tin...</div>
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

  if (!contact) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Không có dữ liệu liên hệ.</div>
      </div>
    );
  }

  const {
    companyName,
    email,
    phoneNumber,
    address,
    socialMedia,
    supportHours,
    isActive,
  } = contact;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-6">
      <div className="max-w-4xl mx-auto flex justify-center items-center space-x-4">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white text-center">
          Chi tiết liên hệ
        </h1>
      </div>
      <div className="max-w-4xl mx-auto flex justify-between mt-4">
        <BackButton path="/contact-list" />
        <button
          onClick={() => navigate(`/edit-contact/${id}`)}
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
          <span>Chỉnh sửa liên hệ</span>
        </button>
      </div>
      <div className="max-w-4xl mx-auto mt-4 bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="px-6 py-5 sm:px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-6">
            <div>
              <h3 className="text-3xl font-semibold">{companyName}</h3>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaEnvelope className="inline mr-2 text-blue-500" />
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {email}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaPhoneAlt className="inline mr-2 text-green-500" />
                Số điện thoại
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {phoneNumber}
              </dd>
            </div>

            {address && (
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  <FaMapMarkerAlt className="inline mr-2 text-red-500" />
                  Địa chỉ
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {`${address.street}, ${address.district}, ${address.city}, ${address.country}`}
                </dd>
              </div>
            )}

            {socialMedia && (
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  Mạng xã hội
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2 space-y-1">
                  {socialMedia.facebook && (
                    <a
                      href={socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <FaFacebook className="inline mr-2" />
                      Facebook
                    </a>
                  )}
                  <br />
                  {socialMedia.instagram && (
                    <a
                      href={socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:underline dark:text-pink-400"
                    >
                      <FaInstagram className="inline mr-2" />
                      Instagram
                    </a>
                  )}
                  <br />
                  {socialMedia.twitter && (
                    <a
                      href={socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline dark:text-blue-300"
                    >
                      <FaTwitter className="inline mr-2" />
                      Twitter
                    </a>
                  )}
                  <br />
                  {socialMedia.zalo && (
                    <a
                      href={socialMedia.zalo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-800 hover:underline dark:text-blue-600"
                    >
                      Zalo
                    </a>
                  )}
                </dd>
              </div>
            )}

            {supportHours && (
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  <FaClock className="inline mr-2 text-yellow-500" />
                  Giờ hỗ trợ
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  <span className="font-semibold">Ngày thường:</span>{" "}
                  {supportHours.weekdays}
                  <br />
                  <span className="font-semibold">Cuối tuần:</span>{" "}
                  {supportHours.weekends}
                </dd>
              </div>
            )}

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                <FaBullseye className="inline mr-2 text-green-500" />
                Trạng thái
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {isActive ? (
                  <span className="text-green-500 font-semibold">Hiển thị</span>
                ) : (
                  <span className="text-red-500 font-semibold">
                    Không hoạt động
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex justify-between mt-4">
        <BackButton path="/contact-list" />
        <button
          onClick={() => navigate(`/edit-contact/${id}`)}
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
          <span>Chỉnh sửa liên hệ</span>
        </button>
      </div>
    </div>
  );
};

export default ContactDetail;
