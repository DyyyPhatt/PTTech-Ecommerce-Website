import React, { useEffect } from "react";
import Header from "./Header";
import DiscountCodePopup from "./Popup/DiscountCodePopup";
import AdPopup from "./Popup/AdPopup";
import Footer from "./Footer";
import { ToastContainer } from "react-toastify";
import ScrollToTopButton from "./Button/ScrollToTopButton";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ToastContainer />
      <main className="flex-grow">{children}</main>
      {/* <DiscountCodePopup />
      <AdPopup /> */}
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Layout;
