import "./PromoSection.css";
import logo from "../assets/logo.png";
import promoBanner from "../assets/promo-banner.png";
import { BsDiamondFill } from "react-icons/bs";

const PromoSection = () => {
  return (
    <>
      <div className="promo-banner">
        <img src={logo} alt="Banner" className="promo-bg" />
        <div className="promo-content">
          <h1>Save some money.</h1>
          <p>
            You deserve it. Check out our discounts and specials for new
            customers, students, service industry professionals, and more!
          </p>
        </div>

        <div className="promo-banner-cards">
          <div className="promo-card">
            <div className="promo-card-content">
              <h3>OIL CHANGE</h3>
            </div>
            <div className="promo-card-icon">
              <BsDiamondFill size={40} color="white" />
            </div>
          </div>
          <div className="promo-card">
            <div className="promo-card-content">
              <h3>DISCOUNT FOR NEW CUSTOMER</h3>
            </div>
            <div className="promo-card-icon">
              <BsDiamondFill size={40} color="white" />
            </div>
          </div>
          <div className="promo-card">
            <div className="promo-card-content">
              <h3>STUDENT DISCOUNT</h3>
            </div>
            <div className="promo-card-icon">
              <BsDiamondFill size={40} color="white" />
            </div>
          </div>
        </div>
      </div>
      <img src={promoBanner} alt="" className="banner-promo" />
    </>
  );
};

export default PromoSection;
