import React, { useEffect, useState } from "react";
import "./FeaturedItems.css";
import pagebreak from "../assets/white-pagebreak.png";

const FeaturedSection = () => {
  const API_BASE =
    import.meta.env.MODE === "development"
      ? "http://localhost:5000"
      : "https://your-render-app.onrender.com"; // replace with your Render URL

  useEffect(() => {
    fetch(`${API_BASE}/api/featured-items`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  }, []);
  if (loading) return <p>Loading featured items...</p>;

  return (
    <>
      <section className="featured-section">
        <h2 className="section-title">Featured Collections</h2>
        <div className="cards-container">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item._id} className="card">
                <img src={item.image} alt={item.title} className="card-image" />
                <h3 className="card-title">{item.title}</h3>
                <p className="card-price">₱ {item.price}</p>
              </div>
            ))
          ) : (
            <p>No featured items found.</p>
          )}
        </div>
      </section>
      <img src={pagebreak} alt="pagebreak" className="white-pagebreak" />
    </>
  );
};

export default FeaturedSection;
