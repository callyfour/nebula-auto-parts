import { useEffect, useState } from "react";
import "./Header.css";
import bg1 from "../assets/banner.jpg";
import bg2 from "../assets/banner2.jpg";
import bg3 from "../assets/banner3.jpg";
import bg4 from "../assets/banner4.jpg";
import pageBreak from "../assets/nebula-pagebreak.png";
import nebulaLogo from "../assets/logo-words.png";
import nebulaSection from "../assets/nebula-section.png";
const Header = () => {
  const images = [bg1, bg2, bg3, bg4];
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // start fade out
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % images.length);
        setFade(true); // fade in new image
      }, 500); // match fade duration
    }, 5000); // change every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section
        className={`header-section ${fade ? "fade-in" : "fade-out"}`}
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0,0,0,0.2)),url(${images[index]})`,
          backgroundSize: "cover", // makes it fill the whole area
          backgroundPosition: "center", // keeps subject centered
          backgroundRepeat: "no-repeat",
          width: "100vw",
        }}
      >
        <div className="header-text">
          <h1>Your One-Stop Shop for Quality Auto Parts</h1>
          <p>
            Your go-to online destination for reliable auto parts and
            accessories.
          </p>
          <div class="header-buttons">
            <button class="svg-btn">
              <svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
                <polygon
                  points="12,0 200,0 200,30 188,50 0,50 0,12"
                  stroke="white"
                  stroke-width="2"
                  fill="black"
                />
                <text
                  x="50%"
                  y="60%"
                  text-anchor="middle"
                  fill="white"
                  font-size="14"
                  font-family="Poppins, sans-serif"
                >
                  LEARN MORE
                </text>
              </svg>
            </button>

            <button class="svg-btn">
              <svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
                <polygon
                  points="12,0 200,0 200,30 188,50 0,50 0,12"
                  stroke="white"
                  stroke-width="2"
                  fill="black"
                />
                <text
                  x="50%"
                  y="60%"
                  text-anchor="middle"
                  fill="white"
                  font-size="12"
                  font-family="Poppins, sans-serif"
                >
                  CONTACT US TODAY
                </text>
              </svg>
            </button>
          </div>
        </div>
      </section>
      <img src={nebulaLogo} alt="" className="nebula-logo" />
      <img src={pageBreak} alt="" className="page-break" />
      <img src={nebulaSection} alt="" className="nebula-section" />
    </>
  );
};

export default Header;
