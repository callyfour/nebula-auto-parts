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

import "boxicons/css/boxicons.min.css";
import ScrollToTop from "../ScrollToTop.jsx";

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
      </Routes>
      <Footer />
    </>
  );
}

export default App;
