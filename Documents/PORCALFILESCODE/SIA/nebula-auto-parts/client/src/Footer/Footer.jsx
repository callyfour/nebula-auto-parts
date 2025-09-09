import "./Footer.css";
import nebulaLogo from "../assets/logo-words.png";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";

// Brand logos
import b1 from "../assets/brands/1.png";
import b2 from "../assets/brands/2.png";
import b3 from "../assets/brands/3.png";
import b4 from "../assets/brands/4.png";
import b5 from "../assets/brands/5.png";
import b6 from "../assets/brands/6.png";
import b7 from "../assets/brands/7.png";
import b8 from "../assets/brands/8.png";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Brand Logos Row */}
      <div className="footer-brands">
        <img src={b1} alt="Brand 1" />
        <img src={b2} alt="Brand 2" />
        <img src={b3} alt="Brand 3" />
        <img src={b4} alt="Brand 4" />
        <img src={b5} alt="Brand 5" />
        <img src={b6} alt="Brand 6" />
        <img src={b7} alt="Brand 7" />
        <img src={b8} alt="Brand 8" />
      </div>

      {/* Info Sections */}
      <div className="footer-top">
        <div className="footer-logo">
          <img src={nebulaLogo} alt="Nebula Autoworks Logo" />
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>We’re here for you</h4>
          <p>
            Reach out to{" "}
            <a href="mailto:nebulaautoworks@gmail.com">
              nebulaautoworks@gmail.com
            </a>{" "}
            for any questions or requests, and we’ll get back to you within one
            business day.
          </p>
        </div>

        {/* About */}
        <div className="footer-section">
          <h4>About Nebula Autoworks</h4>
          <ul>
            <li>
              <a href="#">Our Blog</a>
            </li>
            <li>
              <a href="#">Contact us</a>
            </li>
          </ul>
        </div>

        {/* Shop */}
        <div className="footer-section">
          <h4>Shop</h4>
          <ul>
            <li>
              <a href="#">About us</a>
            </li>
            <li>
              <a href="#">Services</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Middle Tagline */}
      <p className="footer-tagline">
        You got a guy. Here at Nebula Autoworks, we take care of the cars and
        people in our community, and we always provide quality without
        compromise.
      </p>

      {/* Social Icons */}
      <div className="footer-socials">
        <a href="#">
          <FaFacebookF />
        </a>
        <a href="#">
          <FaInstagram />
        </a>
        <a href="#">
          <FaXTwitter />
        </a>
        <a href="#">
          <FaTiktok />
        </a>
      </div>

      {/* Bottom Line */}
      <div className="footer-bottom">
        <p>All rights reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
