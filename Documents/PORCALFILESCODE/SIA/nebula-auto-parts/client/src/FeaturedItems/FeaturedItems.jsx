import React, { useEffect, useState } from "react";
import "./FeaturedItems.css";
import pagebreak from "../assets/white-pagebreak.png";

const FeaturedSection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use backend URL based on environment
  const API_BASE = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/featured-items`);
        if (!res.ok) throw new Error("Failed to fetch featured items");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) return <p>Loading featured items...</p>;
  if (error) return <p>Error: {error}</p>;

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
                {/* Optional price field if your backend has it */}
                {item.price && <p className="card-price">₱ {item.price}</p>}
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
