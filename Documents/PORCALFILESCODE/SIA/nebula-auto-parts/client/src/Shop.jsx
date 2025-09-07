import { Routes, Route } from "react-router-dom";
import ShopParts from "./ShopParts/ShopParts.jsx";
import Products from "./Products/Products.jsx";
import ProductPage from "./ProductPage/ProductPage.jsx";
import Carousel from "./CarouselSection/CarouselSection.jsx";
import AppointBanner from "./AppointBanner/AppointBanner.jsx";
import FeaturedSection from "./FeaturedItems/FeaturedItems.jsx";
import PromoSection from "./PromoSection/PromoSection.jsx";

function Shop() {
  return (
    <Routes>
      {/* Main shop page */}
      <Route
        path="/"
        element={
          <>
            <ShopParts />
            <Products />
            <Carousel />
            <AppointBanner />
            <FeaturedSection />
            <PromoSection />
          </>
        }
      />
      {/* Product detail page under /shop */}
      <Route path="product/:id" element={<ProductPage />} />
    </Routes>
  );
}

export default Shop;
