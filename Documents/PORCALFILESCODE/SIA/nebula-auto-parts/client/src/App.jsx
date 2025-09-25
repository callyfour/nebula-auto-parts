import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar/Navbar.jsx";
import Header from "./Header/Header.jsx";
import Carousel from "./CarouselSection/CarouselSection.jsx";
import AppointBanner from "./AppointBanner/AppointBanner.jsx";
import FeaturedSection from "./FeaturedItems/FeaturedItems.jsx";
import PromoSection from "./PromoSection/PromoSection.jsx";
import Footer from "./Footer/Footer.jsx";
import Shop from "./Shop.jsx";
import ProductPage from "./ProductPage/ProductPage.jsx";
import Login from "./Login/Login.jsx";
import Register from "./Register/Register.jsx";
import ShoppingCart from "./ShoppingCart/ShoppingCart.jsx";
import Checkout from "./Checkout/Checkout.jsx";
import ProfilePage from "./ProfilePage/ProfilePage.jsx";
import AdminDashboard from "./AdminDashboard/AdminDashboard.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import GoogleCallback from "./GoogleCallback/GoogleCallback.jsx"; // ✅ import the new callback page
import "boxicons/css/boxicons.min.css";

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <Carousel />
              <AppointBanner />
              <FeaturedSection />
              <PromoSection />
            </>
          }
        />
        <Route path="/shop/*" element={<Shop />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<ShoppingCart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* ✅ Google OAuth success callback route */}
        <Route path="/google-success" element={<GoogleCallback />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
