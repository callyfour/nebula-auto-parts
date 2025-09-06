import Navbar from "../src/Navbar/Navbar.jsx";
import Header from "../src/Header/Header.jsx";
import Carousel from "../src/CarouselSection/CarouselSection.jsx";
import AppointBanner from "../src/AppointBanner/AppointBanner.jsx";
import FeaturedSection from "../src/FeaturedItems/FeaturedItems.jsx";
import PromoSection from "../src/PromoSection/PromoSection.jsx";

import "boxicons/css/boxicons.min.css";
import Footer from "../src/Footer/Footer.jsx";

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
