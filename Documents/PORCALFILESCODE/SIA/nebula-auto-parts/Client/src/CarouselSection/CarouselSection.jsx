import { useState, useEffect } from "react";
import "./CarouselSection.css";

import car1 from "../assets/carousel-1.png";
import car2 from "../assets/carousel-2.png";
import car3 from "../assets/carousel-3.png";
import pagebreak from "../assets/red-pagebreak.png";

const Carousel = () => {
  const images = [car1, car2, car3];
  const [index, setIndex] = useState(0);

  // Auto-slide every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <>
      <section className="carousel-section">
        <div className="carousel-wrapper">
          {images.map((img, i) => (
            <div
              key={i}
              className={`carousel-slide ${i === index ? "active" : ""}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          className="carousel-btn left"
          onClick={() =>
            setIndex((prev) => (prev - 1 + images.length) % images.length)
          }
        >
          &#10094;
        </button>
        <button
          className="carousel-btn right"
          onClick={() => setIndex((prev) => (prev + 1) % images.length)}
        >
          &#10095;
        </button>
        <img src={pagebreak} alt="pagebreak" className="carousel-pagebreak" />
        {/* Dots indicator */}
        <div className="carousel-dots">
          {images.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default Carousel;
