import React, { useEffect, useState } from "react";
import axios from "axios";

const AddressModal = ({
  tempAddress,
  onChangeInput,
  onChangeSelect,
  onClose,
  onConfirm,
}) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(
          "https://provinces.open-api.vn/api/?depth=1"
        );
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (tempAddress.province.code) {
        try {
          const response = await axios.get(
            `https://provinces.open-api.vn/api/p/${tempAddress.province.code}?depth=2`
          );
          setDistricts(response.data.districts);
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      } else {
        setDistricts([]);
        setCommunes([]);
      }
    };
    fetchDistricts();
  }, [tempAddress.province.code]);

  useEffect(() => {
    const fetchCommunes = async () => {
      if (tempAddress.district.code) {
        try {
          const response = await axios.get(
            `https://provinces.open-api.vn/api/d/${tempAddress.district.code}?depth=2`
          );
          setCommunes(response.data.wards);
        } catch (error) {
          console.error("Error fetching communes:", error);
        }
      } else {
        setCommunes([]);
      }
    };
    fetchCommunes();
  }, [tempAddress.district.code]);

  const handleProvinceChange = (e) => {
    const selectedProvince = provinces.find(
      (province) => String(province.code) === e.target.value
    );
    if (selectedProvince) {
      onChangeSelect({
        ...tempAddress,
        province: { name: selectedProvince.name, code: selectedProvince.code },
        district: { name: "", code: "" },
        commune: { name: "", code: "" },
      });
    }
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = districts.find(
      (district) => String(district.code) === e.target.value
    );
    if (selectedDistrict) {
      onChangeSelect({
        ...tempAddress,
        district: { name: selectedDistrict.name, code: selectedDistrict.code },
        commune: { name: "", code: "" },
      });
    }
  };

  const handleCommuneChange = (e) => {
    const selectedCommune = communes.find(
      (commune) => String(commune.code) === e.target.value
    );
    if (selectedCommune) {
      onChangeSelect({
        ...tempAddress,
        commune: { name: selectedCommune.name, code: selectedCommune.code },
      });
    }
  };

  const isFormValid =
    tempAddress.street.trim() &&
    tempAddress.province.code &&
    tempAddress.district.code &&
    tempAddress.commune.code &&
    tempAddress.country;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center dark:text-blue-400">
          Nhập địa chỉ giao hàng
        </h2>

        <div className="space-y-4">
          {/* Địa chỉ đường */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Địa chỉ đường
            </label>
            <input
              name="street"
              value={tempAddress.street || ""}
              onChange={onChangeInput}
              placeholder="VD: 123 Lê Lợi"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-500"
            />
          </div>

          {/* Tỉnh/Thành phố */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Tỉnh/Thành phố
            </label>
            <select
              name="provinceCode"
              value={tempAddress.province.code || ""}
              onChange={handleProvinceChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-500"
            >
              <option value="">-- Chọn tỉnh/thành phố --</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quận/Huyện */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Quận/Huyện
            </label>
            <select
              name="districtCode"
              value={tempAddress.district.code || ""}
              onChange={handleDistrictChange}
              disabled={!tempAddress.province.code}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-500 dark:disabled:bg-gray-600"
            >
              <option value="">-- Chọn quận/huyện --</option>
              {districts.map((district) => (
                <option key={district.code} value={district.code}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          {/* Phường/Xã */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Phường/Xã
            </label>
            <select
              name="communeCode"
              value={tempAddress.commune.code || ""}
              onChange={handleCommuneChange}
              disabled={!tempAddress.district.code}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-500 dark:disabled:bg-gray-600"
            >
              <option value="">-- Chọn phường/xã --</option>
              {communes.map((commune) => (
                <option key={commune.code} value={commune.code}>
                  {commune.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quốc gia */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Quốc gia
            </label>
            <input
              name="country"
              value={tempAddress.country || ""}
              readOnly
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-600 hover:underline rounded-lg dark:text-gray-300 dark:hover:text-gray-400"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={!isFormValid}
            className={`px-5 py-2 rounded-lg font-semibold transition-colors ${
              isFormValid
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
            }`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
