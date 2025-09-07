import Navbar from "./Navbar/Navbar.jsx";
import Header from "./Header/Header.jsx";
import Carousel from "../CarouselSection/CarouselSection.jsx";
import AppointBanner from "./AppointBanner/AppointBanner.jsx";
import FeaturedSection from "../FeaturedItems/FeaturedItems.jsx";
import PromoSection from "./PromoSection/PromoSection.jsx";

import "boxicons/css/boxicons.min.css";
import Footer from "./Footer/Footer.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Header />
      <Carousel />
      <AppointBanner />
      <FeaturedSection />
      <PromoSection />
      <Footer />
    </>
  );
}

export default App;
