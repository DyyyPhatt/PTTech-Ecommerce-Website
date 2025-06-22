import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useEditContact from "../../hooks/Contact/useEditContact";
import BackButton from "../BackButton";
import { useParams } from "react-router-dom";
import {
  FaBuilding,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaTag,
  FaCalendarAlt,
} from "react-icons/fa";

const EditContactForm = () => {
  const { id } = useParams();
  const {
    contact,
    errors,
    isSubmitting,
    showSuccessMessage,
    showErrorMessage,
    handleChange,
    handleSubmit,
    getContactById,
  } = useEditContact(id);

  useEffect(() => {
    if (id) {
      getContactById();
    }
  }, [id]);

  return (
    <>
      <div className="mb-4">
        <BackButton path="/contact-list" />
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        {showErrorMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-white bg-red-500 rounded-lg shadow-lg"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-white bg-red-400 rounded-lg">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0Zm1 14h-2v-2h2v2Zm0-4h-2V6h2v4Z" />
              </svg>
            </div>
            <div className="ml-3 text-sm font-normal">
              Sửa liên hệ thất bại. Vui lòng thử lại!
            </div>
          </div>
        )}

        {showSuccessMessage && (
          <div
            className="fixed top-4 right-4 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:bg-gray-700 dark:text-green-200"
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            </div>
            <div className="ml-3 text-sm font-normal">
              Sửa liên hệ thành công.
            </div>
          </div>
        )}

        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="companyName"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaBuilding className="mr-2 text-blue-500" /> Tên công ty
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={contact.companyName || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Tên công ty"
              required
            />
            {errors.companyName && (
              <span className="text-red-500 text-sm">{errors.companyName}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaEnvelope className="mr-2 text-green-500" /> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={contact.email || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Email"
              required
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaPhoneAlt className="mr-2 text-yellow-500" /> Số điện thoại
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={contact.phoneNumber || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Số điện thoại"
              required
            />
            {errors.phoneNumber && (
              <span className="text-red-500 text-sm">{errors.phoneNumber}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="address.street"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaMapMarkerAlt className="mr-2 text-red-500" /> Đường
            </label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={contact.address.street || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
      focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
      dark:bg-gray-700 dark:border-gray-600 dark:text-white
      dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Địa chỉ"
              required
            />
            {errors.address?.street && (
              <span className="text-red-500 text-sm">
                {errors.address.street}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="address.district"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaMapMarkerAlt className="mr-2 text-orange-500" /> Quận/Huyện
            </label>
            <input
              type="text"
              id="address.district"
              name="address.district"
              value={contact.address.district || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
      focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
      dark:bg-gray-700 dark:border-gray-600 dark:text-white
      dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Quận"
              required
            />
            {errors.address?.district && (
              <span className="text-red-500 text-sm">
                {errors.address.district}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="address.city"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaMapMarkerAlt className="mr-2 text-purple-500" /> Tỉnh/Thành phố
            </label>
            <input
              type="text"
              id="address.city"
              name="address.city"
              value={contact.address.city || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
      focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
      dark:bg-gray-700 dark:border-gray-600 dark:text-white
      dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Thành phố"
              required
            />
            {errors.address?.city && (
              <span className="text-red-500 text-sm">
                {errors.address.city}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="address.country"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaMapMarkerAlt className="mr-2 text-teal-500" /> Quốc gia
            </label>
            <input
              type="text"
              id="address.country"
              name="address.country"
              value={contact.address.country || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
      focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
      dark:bg-gray-700 dark:border-gray-600 dark:text-white
      dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Quốc gia"
              required
            />
            {errors.address?.country && (
              <span className="text-red-500 text-sm">
                {errors.address.country}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="supportHours.weekdays"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaCalendarAlt className="mr-2 text-red-500" />
              Giờ làm việc (Thứ Hai đến Thứ Sáu)
            </label>
            <input
              type="text"
              id="supportHours.weekdays"
              name="supportHours.weekdays"
              value={contact.supportHours.weekdays || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
      focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
      dark:bg-gray-700 dark:border-gray-600 dark:text-white
      dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Giờ hỗ trợ trong tuần"
            />
            {errors.supportHours && (
              <span className="text-red-500 text-sm">
                {errors.supportHours}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="supportHours.weekends"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaCalendarAlt className="mr-2 text-gray-500" />
              Giờ làm việc (Cuối tuần)
            </label>
            <input
              type="text"
              id="supportHours.weekends"
              name="supportHours.weekends"
              value={contact.supportHours.weekends || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
      focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
      dark:bg-gray-700 dark:border-gray-600 dark:text-white
      dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Giờ hỗ trợ cuối tuần"
            />
          </div>

          <div>
            <label
              htmlFor="socialMedia.facebook"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaFacebook className="mr-2 text-blue-600" /> Facebook
            </label>
            <input
              type="text"
              id="socialMedia.facebook"
              name="socialMedia.facebook"
              value={contact.socialMedia.facebook || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
      focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
      dark:bg-gray-700 dark:border-gray-600 dark:text-white
      dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Facebook"
            />
          </div>

          <div>
            <label
              htmlFor="socialMedia.instagram"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaInstagram className="mr-2 text-pink-500" /> Instagram
            </label>
            <input
              type="text"
              id="socialMedia.instagram"
              name="socialMedia.instagram"
              value={contact.socialMedia.instagram || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
      focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
      dark:bg-gray-700 dark:border-gray-600 dark:text-white
      dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Instagram"
            />
          </div>

          <div>
            <label
              htmlFor="socialMedia.twitter"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaTwitter className="mr-2 text-blue-400" />
              Twitter
            </label>
            <input
              type="text"
              id="socialMedia.twitter"
              name="socialMedia.twitter"
              value={contact.socialMedia.twitter || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
      focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
      dark:bg-gray-700 dark:border-gray-600 dark:text-white
      dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Twitter"
            />
          </div>

          <div>
            <label
              htmlFor="socialMedia.zalo"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
            >
              <FaTag className="mr-2 text-green-500" />
              Zalo
            </label>
            <input
              type="text"
              id="socialMedia.zalo"
              name="socialMedia.zalo"
              value={contact.socialMedia.zalo || ""}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
      focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
      dark:bg-gray-700 dark:border-gray-600 dark:text-white
      dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Zalo"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isSubmitting ? "Đang sửa..." : "Sửa thông tin liên hệ"}
          </button>
        </div>
      </form>
      <div className="mt-4">
        <BackButton path="/contact-list" />
      </div>
    </>
  );
};

export default EditContactForm;
