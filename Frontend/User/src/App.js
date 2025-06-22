import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import CartPage from "./pages/Cart";
import RegisterForm from "./pages/RegisterForm";
import LoginForm from "./pages/LoginForm";
import ForgotPasswordForm from "./pages/ForgotPasswordForm";
import ResetPasswordForm from "./pages/ResetPasswordForm";
import ViewedHistory from "./pages/ViewedHistory";
import FavoritePage from "./pages/FavoritePage";
import SearchPage from "./pages/SearchPage";
import SortByBrand from "./pages/SortByBrand";
import SortByCategory from "./pages/SortByCategory";
import SortByVisibilityType from "./pages/SortByVisibilityType";
import ProfilePage from "./pages/ProfilePage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import PolicyPage from "./pages/PolicyPage";
import ProductDetail from "./pages/ProductDetail";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AllProducts from "./pages/AllProducts";
import { ToastContainer } from "react-toastify";
import OrderSuccess from "./components/Order/OrderSuccess";
import PaymentFailed from "./components/Order/PaymentFailed";
import SpendingAnalyticsPage from "./pages/SpendingAnalyticsPage";

const App = () => {
  return (
    <>
      <ToastContainer />
      <GoogleOAuthProvider clientId="99750422196-cp0va3lft8pindu7u759jj0dg46jbkkt.apps.googleusercontent.com">
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPasswordForm />}
              />
              <Route path="/viewed-history" element={<ViewedHistory />} />
              <Route path="/favorites" element={<FavoritePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/category/:name" element={<SortByCategory />} />
              <Route path="/brand/:name" element={<SortByBrand />} />
              <Route
                path="/visibility-type/:name"
                element={<SortByVisibilityType />}
              />
              <Route path="/products" element={<AllProducts />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route
                path="/monthly-spending"
                element={<SpendingAnalyticsPage />}
              />
              <Route
                path="/order-success/:orderId"
                element={<OrderSuccess />}
              />
              <Route
                path="/payment-failed/:orderId"
                element={<PaymentFailed />}
              />
              <Route path="/policy/:type" element={<PolicyPage />} />
              <Route
                path="/product-details/:productId"
                element={<ProductDetail />}
              />
            </Routes>
          </Layout>
        </Router>
      </GoogleOAuthProvider>
    </>
  );
};

export default App;
