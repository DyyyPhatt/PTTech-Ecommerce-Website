import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/Login/ForgotPassword";
import ResetPassword from "./pages/Login/ResetPassword";
import MainLayout from "./layouts/MainLayout";
import UserList from "./pages/User/UserList";
import UserDetail from "./pages/User/UserDetail";
import AddUser from "./pages/User/AddUser";
import EditUser from "./pages/User/EditUser";
import BrandList from "./pages/Brand/BrandList";
import BrandDetail from "./pages/Brand/BrandDetail";
import AddBrand from "./pages/Brand/AddBrand";
import EditBrand from "./pages/Brand/EditBrand";
import CategoryList from "./pages/Category/CategoryList";
import CategoryDetail from "./pages/Category/CategoryDetail";
import AddCategory from "./pages/Category/AddCategory";
import EditCategory from "./pages/Category/EditCategory";
import DiscountList from "./pages/Discount/DiscountList";
import DiscountDetail from "./pages/Discount/DiscountDetail";
import AddDiscount from "./pages/Discount/AddDiscount";
import EditDiscount from "./pages/Discount/EditDiscount";
import PolicyList from "./pages/Policy/PolicyList";
import PolicyDetail from "./pages/Policy/PolicyDetail";
import AddPolicy from "./pages/Policy/AddPolicy";
import EditPolicy from "./pages/Policy/EditPolicy";
import AdsList from "./pages/Ads/AdsList";
import AdsDetail from "./pages/Ads/AdsDetail";
import AddAd from "./pages/Ads/AddAd";
import EditAd from "./pages/Ads/EditAd";
import ContactList from "./pages/Contact/ContactList";
import ContactDetail from "./pages/Contact/ContactDetail";
import AddContact from "./pages/Contact/AddContact";
import EditContact from "./pages/Contact/EditContact";
import OrderList from "./pages/Order/OrderList";
import OrderDetail from "./pages/Order/OrderDetail";
import AddContactSchedule from "./pages/Contact/AddContactSchedule";
import AddBrandSchedule from "./pages/Brand/AddBrandSchedule";
import AddPolicySchedule from "./pages/Policy/AddPolicySchedule";
import AddDiscountschedule from "./pages/Discount/AddDiscountschedule";
import AddAdSchedule from "./pages/Ads/AddAdSchedule";
import AddCategorySchedule from "./pages/Category/AddCategorySchedule";
import ProductList from "./pages/Product/ProductList";
import ProductDetail from "./pages/Product/ProductDetail";
import AddProduct from "./pages/Product/AddProduct";
import AddProductSchedule from "./pages/Product/AddProductSchedule";
import EditProduct from "./pages/Product/EditProduct";
import EditPrice from "./pages/Product/EditPrice";
import CartList from "./pages/Cart/CartList";
import CartDetail from "./pages/Cart/CartDetail";
import ReviewList from "./pages/Review/ReviewList";
import ReviewDetail from "./pages/Review/ReviewDetail";
import InventoryList from "./pages/Inventory/InventoryList";
import InventoryDetail from "./pages/Inventory/InventoryDetail";
import AddInventory from "./pages/Inventory/AddInventory";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import AddOrder from "./pages/Order/AddOrder";
import EditOrder from "./pages/Order/EditOrder";
import StatisticList from "./pages/Statistic/StatisticList";
import StatisticDetail from "./pages/Statistic/StatisticDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import UnauthorizedPage from "./components/UnauthorizedPage ";
import QAList from "./pages/QA/QAList";
import QADetail from "./pages/QA/QADetail";
import BugReportList from "./pages/BugReport/BugReportList";
import BugReportDetail from "./pages/BugReport/BugReportDetail";
import AddReview from "./pages/Review/AddReview";
import EditReview from "./pages/Review/EditReview";
import AddQA from "./pages/QA/AddQA";
import BugReport from "./pages/BugReport/AddBugReport";
import AddBugReport from "./pages/BugReport/AddBugReport";
const allowedRoles = [
  "ADMIN",
  "MANAGER",
  "CUSTOMER_SUPPORT",
  "INVENTORY_MANAGER",
  "MARKETING",
];

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "ADMIN",
                  "MANAGER",
                  "CUSTOMER_SUPPORT",
                  "INVENTORY_MANAGER",
                  "MARKETING",
                ]}
              >
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "CUSTOMER_SUPPORT",
                    "INVENTORY_MANAGER",
                    "MARKETING",
                  ]}
                >
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            {/* User */}
            <Route
              path="/user-list"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "MARKETING",
                    "INVENTORY_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                >
                  <UserList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "MARKETING",
                    "INVENTORY_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                >
                  <UserDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-user"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AddUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-user/:id"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <EditUser />
                </ProtectedRoute>
              }
            />

            {/* Brand */}
            <Route
              path="/brand-list"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <BrandList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/brand-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <BrandDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-brand"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <AddBrand />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-brand-schedule"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <AddBrandSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-brand/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <EditBrand />
                </ProtectedRoute>
              }
            />
            {/* Category */}
            <Route
              path="/category-list"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <CategoryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/category-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <CategoryDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-category"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <AddCategory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-category-schedule"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <AddCategorySchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-category/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <EditCategory />
                </ProtectedRoute>
              }
            />
            {/* Discount */}
            <Route
              path="/discount-list"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "MARKETING"]}
                >
                  <DiscountList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discount-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "MARKETING"]}
                >
                  {" "}
                  <DiscountDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-discount"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "MARKETING"]}
                >
                  {" "}
                  <AddDiscount />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-discount/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "MARKETING"]}
                >
                  {" "}
                  <EditDiscount />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-discount-schedule"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "MARKETING"]}
                >
                  {" "}
                  <AddDiscountschedule />
                </ProtectedRoute>
              }
            />
            {/* Policy */}
            <Route
              path="/policy-list"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <PolicyList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/policy-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  {" "}
                  <PolicyDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-policy-schedule"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  {" "}
                  <AddPolicySchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-policy"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  {" "}
                  <AddPolicy />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-policy/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  {" "}
                  <EditPolicy />
                </ProtectedRoute>
              }
            />
            {/* Ads */}
            <Route
              path="/ads-list"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "MARKETING"]}
                >
                  <AdsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ads-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "MARKETING"]}
                >
                  {" "}
                  <AdsDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-ads"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "MARKETING"]}
                >
                  {" "}
                  <AddAd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-ads/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "MARKETING"]}
                >
                  {" "}
                  <EditAd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-ads-schedule"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "MARKETING"]}
                >
                  {" "}
                  <AddAdSchedule />
                </ProtectedRoute>
              }
            />
            {/* Contact */}
            <Route
              path="/contact-list"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <ContactList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contact-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <ContactDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-contact-schedule"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <AddContactSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-contact"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <AddContact />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-contact/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <EditContact />
                </ProtectedRoute>
              }
            />
            {/* Statistic */}
            <Route
              path="/statistic-list"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "MARKETING",
                    "INVENTORY_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                >
                  <StatisticList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistic-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "MARKETING",
                    "INVENTORY_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                >
                  {" "}
                  <StatisticDetail />
                </ProtectedRoute>
              }
            />

            {/* Order */}
            <Route
              path="/order-list"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "MARKETING",
                    "INVENTORY_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                >
                  <OrderList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "MARKETING",
                    "INVENTORY_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                >
                  <OrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-order"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                  <AddOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-order/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <EditOrder />
                </ProtectedRoute>
              }
            />

            {/* Product */}
            <Route
              path="/product-list"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "MARKETING",
                    "INVENTORY_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                >
                  <ProductList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "MARKETING",
                    "INVENTORY_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                >
                  <ProductDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-product"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "INVENTORY_MANAGER"]}
                >
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-product-schedule"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "INVENTORY_MANAGER"]}
                >
                  <AddProductSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-product/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "INVENTORY_MANAGER"]}
                >
                  <EditProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-price-product/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "INVENTORY_MANAGER"]}
                >
                  <EditPrice />
                </ProtectedRoute>
              }
            />
            {/* Cart */}
            <Route
              path="/cart-list"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "MARKETING",
                    "INVENTORY_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                >
                  <CartList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "MARKETING",
                    "INVENTORY_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                >
                  <CartDetail />
                </ProtectedRoute>
              }
            />
            {/* Review */}
            <Route
              path="/review-list"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <ReviewList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-review"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AddReview />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-review/:id"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <EditReview />
                </ProtectedRoute>
              }
            />

            <Route
              path="/review-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <ReviewDetail />
                </ProtectedRoute>
              }
            />

            {/* Inventory */}
            <Route
              path="/inventory-list"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "MARKETING",
                    "INVENTORY_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                >
                  <InventoryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "MARKETING",
                    "INVENTORY_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                >
                  <InventoryDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-inventory"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "INVENTORY_MANAGER"]}
                >
                  <AddInventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/qa-list"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <QAList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-qa"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AddQA />
                </ProtectedRoute>
              }
            />
            <Route
              path="/qa-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "CUSTOMER_SUPPORT"]}
                >
                  <QADetail />
                </ProtectedRoute>
              }
            />
            {/* BugReport */}

            <Route
              path="/bug-list"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "MARKETING",
                    "INVENTORY_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                >
                  <BugReportList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-bug"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AddBugReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bug-detail/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "MANAGER",
                    "MARKETING",
                    "INVENTORY_MANAGER",
                    "CUSTOMER_SUPPORT",
                  ]}
                >
                  <BugReportDetail />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
