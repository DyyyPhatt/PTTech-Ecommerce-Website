import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiSettings,
  FiShield,
  FiHelpCircle,
  FiZap,
  FiTrendingUp,
  FiTruck,
} from "react-icons/fi";
import Marquee from "react-fast-marquee";
import FeatureCard from "../components/Card/FeatureCard";
import ProductCard from "../components/Card/ProductCard";
import { TbPlayerTrackNext } from "react-icons/tb";
import Carousel from "../components/Carousel/Carousel";
import useCategories from "../hooks/useCategories";
import usePromotions from "../hooks/usePromotions";
import useBrands from "../hooks/useBrands";
import useProducts from "../hooks/useProducts";
import Cookies from "js-cookie";
import useCart from "../hooks/useCart";
import { ToastContainer } from "react-toastify";

const Home = () => {
  const {
    products,
    topSellingProducts,
    topRatedProducts,
    loadingProducts,
    loadingTopSelling,
    loadingTopRated,
    errorProducts,
    errorTopSelling,
    errorTopRated,
    filterProducts,
  } = useProducts();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    promotions,
    loading: promotionsLoading,
    error: promotionsError,
  } = usePromotions();

  const { brands, loading: brandsLoading, error: brandsError } = useBrands();

  const userId = Cookies.get("userId");
  const token = Cookies.get("accessToken");
  const { fetchCart } = useCart(userId);

  useEffect(() => {
    if (token && userId) {
      fetchCart();
    }
  }, [token, userId, fetchCart]);

  const location = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location]);

  useEffect(() => {
    filterProducts({ visibilityType: "Khuyến Mãi" });
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="bg-gray-100 dark:bg-neutral-800 p-6">
        <Carousel
          items={promotions}
          autoSlide={true}
          autoSlideInterval={5000}
        />
      </div>

      <div className="p-6 bg-gradient-to-r from-[#f7f8fa] to-[#e2e8f0] dark:from-gray-700 dark:to-gray-800">
        <div className="relative mb-6 p-6 bg-gradient-to-r from-[#ff6b81] to-[#ff8e97] text-white rounded-xl shadow-xl dark:from-[#b2495b] dark:to-[#c3646a]">
          <h1 className="text-3xl font-extrabold text-white tracking-wide text-center">
            Sản phẩm khuyến mãi
          </h1>
          <p className="text-center text-sm mt-2 max-w-xl mx-auto dark:text-gray-200">
            Khám phá những sản phẩm công nghệ hàng đầu được yêu thích nhất!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {loadingProducts ? (
            <div className="col-span-full flex justify-center items-center min-h-[300px] relative">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"></div>
              <span className="ml-4 text-blue-600 font-medium text-lg dark:text-blue-400">
                Đang tải sản phẩm...
              </span>
            </div>
          ) : errorProducts ? (
            <div className="col-span-full text-center text-red-500 dark:text-red-400 py-8">
              <p className="text-xl font-semibold">
                Đã xảy ra lỗi khi tải sản phẩm
              </p>
              <p className="text-sm mt-2">{errorProducts}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076507.png"
                alt="No products"
                className="w-24 h-24 mx-auto mb-4 opacity-60"
              />
              <p className="text-lg font-medium">
                Không có sản phẩm nào phù hợp.
              </p>
            </div>
          ) : (
            products
              .slice(0, 10)
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  brands={brands}
                />
              ))
          )}
        </div>

        <div className="text-end mt-8">
          <a
            href="/visibility-type/Khuyến%20Mãi"
            className="inline-flex items-center bg-gradient-to-r from-[#ff6b81] to-[#ff8e97] text-white py-3 px-10 rounded-full font-semibold text-lg shadow-xl hover:bg-[#ff8e97] hover:from-[#ff6b81] hover:to-[#ffc3c9] dark:hover:from-[#b2495b] dark:hover:to-[#cc7d86] transition duration-300 transform hover:scale-105"
            aria-label="Xem tất cả sản phẩm khuyến mãi"
          >
            <TbPlayerTrackNext className="mr-3 text-xl" />
            Xem thêm
          </a>
        </div>
      </div>

      <div className="p-10 bg-white dark:bg-neutral-800 transition-colors duration-300">
        <Marquee speed={40} gradient={true} pauseOnClick={true}>
          <div className="flex items-center gap-10 px-10">
            {brandsLoading ? (
              <div className="text-gray-700 dark:text-gray-300">
                Đang tải các thương hiệu...
              </div>
            ) : brandsError ? (
              <div className="text-center text-red-600 dark:text-red-400 py-2">
                {brandsError}
              </div>
            ) : (
              brands.map((brand) => (
                <Link key={brand.id} to={`/brand/${brand.name}`}>
                  <img
                    src={brand.logo}
                    alt={brand.alt}
                    className="w-28 h-auto object-contain rounded-lg hover:scale-105 transition-transform duration-200 dark:shadow-lg"
                  />
                </Link>
              ))
            )}
          </div>
        </Marquee>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-800 dark:via-gray-900 dark:to-pink-900 py-16 px-8 sm:px-12">
        <div className="container mx-auto">
          <div className="relative text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200 drop-shadow-md">
              Khám Phá Các Tính Năng Đặc Biệt Của Chúng Tôi
            </h2>
            <div className="h-1 w-52 bg-gradient-to-r from-pink-500 to-yellow-400 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            <FeatureCard
              icon={<FiSettings size={50} />}
              title="Tùy Chỉnh"
              content="Tùy chỉnh sản phẩm của chúng tôi để phù hợp với nhu cầu của bạn. Mở rộng phạm vi tiếp cận với mạng lưới toàn cầu của chúng tôi."
            />
            <FeatureCard
              icon={<FiShield size={50} />}
              title="Bảo Mật"
              content="Dữ liệu của bạn được bảo vệ bởi các biện pháp bảo mật mới nhất."
            />
            <FeatureCard
              icon={<FiHelpCircle size={50} />}
              title="Hỗ Trợ"
              content="Hỗ trợ khách hàng 24/7 cho tất cả các thắc mắc của bạn."
            />
            <FeatureCard
              icon={<FiZap size={50} />}
              title="Hiệu Suất"
              content="Trải nghiệm hiệu suất nhanh chóng với sản phẩm của chúng tôi."
            />
            <FeatureCard
              icon={<FiTrendingUp size={50} />}
              title="Khả Năng Mở Rộng"
              content="Doanh nghiệp của bạn có thể phát triển dễ dàng nhờ vào cơ sở hạ tầng mở rộng của chúng tôi."
            />
            <FeatureCard
              icon={<FiTruck size={50} />}
              title="Giao Hàng Nhanh"
              content="Đơn hàng của bạn sẽ được xử lý và giao đến tay bạn trong thời gian ngắn nhất với các đối tác vận chuyển uy tín."
            />
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-[#f7f8fa] to-[#e2e8f0] dark:from-gray-700 dark:to-gray-800 transition-colors duration-300">
        <div className="relative mb-6 p-6 bg-gradient-to-r from-[#ff7eb3] to-[#ff9bc8] text-white rounded-xl shadow-xl dark:from-[#b25a94] dark:to-[#c77ba8]">
          <h1 className="text-4xl font-extrabold text-white tracking-wide text-center">
            Sản phẩm bán chạy
          </h1>
          <p className="text-center text-sm mt-3 max-w-xl mx-auto dark:text-gray-200">
            Khám phá những sản phẩm công nghệ hàng đầu được yêu thích nhất!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {loadingTopSelling ? (
            <div className="col-span-full flex justify-center items-center min-h-[300px] relative">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"></div>
              <span className="ml-4 text-blue-600 font-medium text-lg dark:text-blue-400">
                Đang tải sản phẩm bán chạy...
              </span>
            </div>
          ) : errorTopSelling ? (
            <div className="col-span-full text-center text-red-500 dark:text-red-400 py-8">
              <p className="text-xl font-semibold">
                Đã xảy ra lỗi khi tải sản phẩm bán chạy
              </p>
              <p className="text-sm mt-2">{errorTopSelling}</p>
            </div>
          ) : topSellingProducts.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076507.png"
                alt="No products"
                className="w-24 h-24 mx-auto mb-4 opacity-60"
              />
              <p className="text-lg font-medium">
                Không có sản phẩm bán chạy nào.
              </p>
            </div>
          ) : (
            topSellingProducts.map((product) => (
              <ProductCard key={product.id} product={product} brands={brands} />
            ))
          )}
        </div>

        <div className="text-right mt-8">
          <a
            href="/products"
            className="inline-flex items-center bg-gradient-to-r from-[#ff7eb3] to-[#ff9bc8] text-white py-3 px-10 rounded-full font-semibold text-lg shadow-xl hover:bg-[#ff9bc8] hover:from-[#ff7eb3] hover:to-[#ffb6d1] dark:hover:from-[#b25a94] dark:hover:to-[#d593b9] transition duration-300 transform hover:scale-105"
            aria-label="Xem tất cả sản phẩm"
          >
            <TbPlayerTrackNext className="mr-3 text-xl" />
            Xem thêm
          </a>
        </div>
      </div>

      <div className="p-10 bg-white dark:bg-neutral-800 transition-colors duration-300">
        <Marquee speed={40} gradient={true} pauseOnClick={true}>
          <div className="flex items-center gap-12 px-12">
            {categoriesLoading ? (
              <div className="text-gray-700 dark:text-gray-300">
                Đang tải danh mục...
              </div>
            ) : categoriesError ? (
              <div className="text-center text-red-600 dark:text-red-400 py-2">
                {categoriesError}
              </div>
            ) : (
              categories.map((category) => (
                <React.Fragment key={category.id}>
                  {/* Render danh mục cha */}
                  <Link to={`/category/${category.name}`}>
                    <div className="flex flex-col items-center">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-24 h-auto object-contain mb-2 hover:scale-105 transition-transform duration-200 dark:shadow-lg"
                      />
                      <span className="text-sm mt-1 text-gray-700 dark:text-gray-200">
                        {category.name}
                      </span>
                    </div>
                  </Link>

                  {/* Render các danh mục con */}
                  {category.children &&
                    category.children.length > 0 &&
                    category.children.map((child) => (
                      <Link key={child.id} to={`/category/${child.name}`}>
                        <div className="flex flex-col items-center ml-4">
                          <img
                            src={child.image}
                            alt={child.name}
                            className="w-20 h-auto object-contain mb-1 hover:scale-105 transition-transform duration-200 dark:shadow-md"
                          />
                          <span className="text-xs mt-0.5 text-gray-600 dark:text-gray-400">
                            {child.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                </React.Fragment>
              ))
            )}
          </div>
        </Marquee>
      </div>

      <div className="p-6 bg-gradient-to-r from-[#f7f8fa] to-[#e2e8f0] dark:from-gray-700 dark:to-gray-800 transition-colors duration-300">
        <div className="relative mb-6 p-6 bg-gradient-to-r from-[#ff6b81] to-[#ff8e97] text-white rounded-xl shadow-xl dark:from-[#b2495b] dark:to-[#c3646a]">
          <h1 className="text-3xl font-extrabold text-white tracking-wide text-center">
            Sản phẩm đánh giá cao
          </h1>
          <p className="text-center text-sm mt-2 max-w-xl mx-auto dark:text-gray-200">
            Khám phá những sản phẩm công nghệ hàng đầu được yêu thích nhất!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {loadingTopRated ? (
            <div className="col-span-full flex justify-center items-center min-h-[300px] relative">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid"></div>
              <span className="ml-4 text-blue-600 font-medium text-lg dark:text-blue-400">
                Đang tải sản phẩm đánh giá cao...
              </span>
            </div>
          ) : errorTopRated ? (
            <div className="col-span-full text-center text-red-500 dark:text-red-400 py-8">
              <p className="text-xl font-semibold">
                Đã xảy ra lỗi khi tải sản phẩm đánh giá cao
              </p>
              <p className="text-sm mt-2">{errorTopRated}</p>
            </div>
          ) : topRatedProducts.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076507.png"
                alt="No products"
                className="w-24 h-24 mx-auto mb-4 opacity-60"
              />
              <p className="text-lg font-medium">
                Không có sản phẩm đánh giá cao nào.
              </p>
            </div>
          ) : (
            topRatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} brands={brands} />
            ))
          )}
        </div>

        <div className="text-end mt-8">
          <a
            href="/products"
            className="inline-flex items-center bg-gradient-to-r from-[#ff6b81] to-[#ff8e97] text-white py-3 px-10 rounded-full font-semibold text-lg shadow-xl hover:bg-[#ff8e97] hover:from-[#ff6b81] hover:to-[#ffc3c9] dark:hover:from-[#b2495b] dark:hover:to-[#cc7d86] transition duration-300 transform hover:scale-105"
            aria-label="Xem tất cả sản phẩm"
          >
            <TbPlayerTrackNext className="mr-3 text-xl" />
            Xem thêm
          </a>
        </div>
      </div>

      <div className="p-10 bg-white dark:bg-neutral-800 transition-colors duration-300">
        <Marquee speed={30} gradient={true} pauseOnClick={true}>
          <div className="flex items-center gap-10 px-10">
            {promotionsLoading ? (
              <div className="text-gray-700 dark:text-gray-300">
                Đang tải quảng cáo...
              </div>
            ) : promotionsError ? (
              <div className="text-center text-red-600 dark:text-red-400 py-2">
                {promotionsError}
              </div>
            ) : (
              promotions.map((promo) => (
                <Link key={promo.id} to={promo.link}>
                  <img
                    src={promo.image}
                    alt={promo.alt}
                    className="w-44 h-auto object-cover rounded-lg shadow hover:scale-105 transition-transform duration-200 dark:shadow-lg"
                  />
                </Link>
              ))
            )}
          </div>
        </Marquee>
      </div>
    </>
  );
};

export default Home;
