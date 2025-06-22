import React, { useState, useEffect } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { validateEmail } from "../utils/validationRules";
import { toast } from "react-toastify";
import { TbLogin2 } from "react-icons/tb";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const isLoggedIn = Cookies.get("accessToken");

  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [policies, setPolicies] = useState([]);

  const handleAccountClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate("/login");
    }
  };

  const handleOrdersClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate("/login");
    }
  };

  const showToast = (message, type = "info") => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const errorMessage = validateEmail(email);
    if (errorMessage) {
      setError(errorMessage);
      setSuccess(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8081/api/users/subscribe",
        null,
        {
          params: { email },
        }
      );

      if (response.status === 200) {
        setSuccess(true);
        setError(null);
        setEmail("");
        showToast("Đăng ký nhận bản tin thành công!", "success");
      } else {
        const errorMsg = response.data || "Đã có lỗi xảy ra.";
        setError(errorMsg);
        setSuccess(false);
        showToast(errorMsg, "error");
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra khi đăng ký.");
      setSuccess(false);
      showToast(
        "Đã có lỗi xảy ra khi đăng ký nhận thông báo qua email.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/policies");
        setPolicies(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách chính sách:", error);
      }
    };

    fetchPolicies();
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Liên hệ Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-2">
              <p className="text-gray-400">
                Số 1 Võ Văn Ngân
                <br />
                Phường Linh Chiểu, TP.Thủ Đức
                <br />
                Thành phố Hồ Chí Minh
              </p>
              <p className="flex flex-col space-y-2 text-gray-400">
                <span className="font-medium">Email:</span>
                <div className="flex flex-col space-y-1">
                  <Link
                    to="mailto:21110270@student.hcmute.edu.vn"
                    className="hover:text-[#fc0621] transition duration-300"
                  >
                    21110270@student.hcmute.edu.vn
                  </Link>
                  <Link
                    to="mailto:21110318@student.hcmute.edu.vn"
                    className="hover:text-[#fc0621] transition duration-300"
                  >
                    21110318@student.hcmute.edu.vn
                  </Link>
                </div>
              </p>

              <p className="flex flex-col space-y-2 text-gray-400 mt-4">
                <span className="font-medium">Điện thoại:</span>
                <div className="flex flex-col space-y-1">
                  <Link
                    to="tel:+0865577718"
                    className="hover:text-[#fc0621] transition duration-300"
                  >
                    Duy Phát: (086) 557-7718
                  </Link>
                  <Link
                    to="tel:+0816724726"
                    className="hover:text-[#fc0621] transition duration-300"
                  >
                    Á Tiên: (081) 672-4726
                  </Link>
                </div>
              </p>
            </div>
          </div>

          {/* Chính sách Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Chính sách</h3>
            <ul className="space-y-2 text-gray-400">
              {policies.map((policy) => (
                <li key={policy.id}>
                  <Link
                    to={`/policy/${policy.type}`}
                    className="hover:text-[#fc0621] transition duration-300"
                  >
                    {policy.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mạng xã hội Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Tài khoản</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  to="/profile"
                  onClick={handleAccountClick}
                  className="hover:text-[#fc0621] transition duration-300"
                >
                  Tài khoản của tôi
                </Link>
              </li>
              <li>
                <Link
                  to="/favorites"
                  className="hover:text-[#fc0621] transition duration-300"
                >
                  Danh sách yêu thích
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  onClick={handleOrdersClick}
                  className="hover:text-[#fc0621] transition duration-300"
                >
                  Đơn hàng của tôi
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="hover:text-[#fc0621] transition duration-300"
                >
                  Giỏ hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Bản tin Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Đăng ký nhận bản tin</h3>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="w-full px-4 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={handleEmailChange}
                value={email}
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-[#fc0621] text-white rounded-md hover:bg-[#d70018] flex items-center justify-center gap-3 transition duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg
                    aria-hidden="true"
                    role="status"
                    className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="#1C64F2"
                    />
                  </svg>
                ) : (
                  <TbLogin2 className="text-2xl" />
                )}
                {isLoading ? "Đang đăng ký..." : "Đăng ký"}
              </button>
            </form>
            <h3 className="text-xl font-semibold mb-4">
              Kết nối với chúng tôi
            </h3>
            <div className="flex space-x-4 text-gray-400">
              <div className="relative group">
                <Link
                  to="#"
                  aria-label="Facebook"
                  className="hover:text-[#fc0621] transition duration-300"
                >
                  <FaFacebook className="text-2xl" />
                </Link>
                <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Facebook
                </div>
              </div>

              <div className="relative group">
                <Link
                  to="#"
                  aria-label="Twitter"
                  className="hover:text-[#fc0621] transition duration-300"
                >
                  <FaTwitter className="text-2xl" />
                </Link>
                <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Twitter
                </div>
              </div>

              <div className="relative group">
                <Link
                  to="#"
                  aria-label="Instagram"
                  className="hover:text-[#fc0621] transition duration-300"
                >
                  <FaInstagram className="text-2xl" />
                </Link>
                <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Instagram
                </div>
              </div>

              <div className="relative group">
                <Link
                  to="#"
                  aria-label="LinkedIn"
                  className="hover:text-[#fc0621] transition duration-300"
                >
                  <FaLinkedin className="text-2xl" />
                </Link>
                <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  LinkedIn
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phần bản quyền */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {currentYear} Đào Duy Phát & Trần Thị Á Tiên - Khóa Luận Tốt
            Nghiệp - Khoa Công nghệ Thông tin, Trường Đại Học Sư Phạm Kỹ Thuật
            TPHCM.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
