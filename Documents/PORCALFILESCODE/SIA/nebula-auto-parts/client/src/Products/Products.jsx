import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Products.css";
import pagebreak from "../assets/nebula-pagebreak.png";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE =
    import.meta.env.MODE === "development"
      ? "http://localhost:5000"
      : import.meta.env.VITE_API_BASE;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const [selectedBrand, setSelectedBrand] = useState("All");
  const brands = ["All", ...new Set(products.map((p) => p.brand))];
  const filteredProducts =
    selectedBrand === "All"
      ? products
      : products.filter((p) => p.brand === selectedBrand);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section className="shopparts-products-section">
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
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Link
              to={`/product/${product.id}`}
              key={product._id}
              className="shopparts-product-card-link"
            >
              <div className="shopparts-product-card">
                <div className="shopparts-product-image-wrapper">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="shopparts-product-image"
                  />
                </div>
                <div className="shopparts-product-info">
                  <h3 className="shopparts-product-title">{product.name}</h3>
                  <p className="shopparts-product-price">₱ {product.price}</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>

      {/* Pagebreak */}
      <img src={pagebreak} alt="pagebreak" className="shopparts-pagebreak" />
    </section>
  );
};

export default Products;
