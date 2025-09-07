import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("All");

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  const brands = ["All", ...new Set(products.map((p) => p.brand))];
  const filteredProducts =
    selectedBrand === "All"
      ? products
      : products.filter((p) => p.brand === selectedBrand);

  return (
    <section className="shopparts-products-section">
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

      <div className="shopparts-product-container">
        {filteredProducts.map((product) => (
          <Link to={`/product/${product._id}`} key={product._id}>
            <div className="shopparts-product-card">
              <img
                src={product.image}
                alt={product.name}
                className="shopparts-product-image"
              />
              <h3 className="shopparts-product-title">{product.name}</h3>
              <p className="shopparts-product-price">₱ {product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Products;
