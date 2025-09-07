import "./ShopParts.css";
import { useState, useEffect } from "react";

import car1 from "../assets/shopparts/shopparts-1.png";
import car2 from "../assets/shopparts/shopparts-2.png";
import car3 from "../assets/shopparts/shopparts-3.png";
import car4 from "../assets/shopparts/shopparts-4.png";
import car5 from "../assets/shopparts/shopparts-5.png";
import car6 from "../assets/shopparts/shopparts-6.png";
import car7 from "../assets/shopparts/shopparts-7.png";
import car8 from "../assets/shopparts/shopparts-8.png";
import car9 from "../assets/shopparts/shopparts-9.png";
import pagebreak from "../assets/nebula-pagebreak.png";

const ShopParts = () => {
  // Product list with brand/category
  const products = [
    { id: 1, image: car1, brand: "Toyota", name: "Brake Pad", price: 1500 },
    { id: 2, image: car2, brand: "Toyota", name: "Oil Filter", price: 700 },
    { id: 3, image: car3, brand: "Honda", name: "Air Filter", price: 800 },
    { id: 4, image: car4, brand: "Honda", name: "Spark Plug", price: 400 },
    { id: 5, image: car5, brand: "Nissan", name: "Battery", price: 3000 },
    { id: 6, image: car6, brand: "Nissan", name: "Brake Disc", price: 2200 },
    { id: 7, image: car7, brand: "Toyota", name: "Clutch Kit", price: 4500 },
    { id: 8, image: car8, brand: "Honda", name: "Timing Belt", price: 1200 },
    { id: 9, image: car9, brand: "Nissan", name: "Radiator", price: 3500 },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState("All");

  const brands = ["All", ...new Set(products.map((p) => p.brand))];
  const filteredProducts =
    selectedBrand === "All"
      ? products
      : products.filter((p) => p.brand === selectedBrand);

  // Auto-slide every 6s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [products.length]);

  return (
    <section className="shopparts-carousel">
      {/* Carousel */}
      <div className="shopparts-carousel-wrapper">
        {products.map((product, i) => (
          <div
            key={product.id}
            className={`shopparts-slide ${i === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: `url(${product.image})` }}
          />
        ))}
      </div>

      {/* Carousel arrows */}
      <button
        className="shopparts-btn shopparts-left"
        onClick={() =>
          setCurrentSlide(
            (prev) => (prev - 1 + products.length) % products.length
          )
        }
      >
        &#10094;
      </button>
      <button
        className="shopparts-btn shopparts-right"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % products.length)}
      >
        &#10095;
      </button>

      {/* Dots */}
      <div className="shopparts-dots">
        {products.map((_, i) => (
          <span
            key={i}
            className={`shopparts-dot ${i === currentSlide ? "active" : ""}`}
            onClick={() => setCurrentSlide(i)}
          />
        ))}
      </div>

      {/* Product Category Filter */}
      <div className="shopparts-product-category">
        {brands.map((brand) => (
          <button
            key={brand}
            className={`brand-btn ${selectedBrand === brand ? "active" : ""}`}
            onClick={() => setSelectedBrand(brand)}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="shopparts-product-container">
        {filteredProducts.map((product) => (
          <div key={product.id} className="shopparts-product-card">
            <img
              src={product.image}
              alt={product.name}
              className="shopparts-product-image"
            />
            <h3 className="shopparts-product-title">{product.name}</h3>
            <p className="shopparts-product-price">₱ {product.price}</p>
          </div>
        ))}
      </div>

      {/* Pagebreak */}
    </section>
  );
};

export default ShopParts;
