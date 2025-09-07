import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ProductPage.css";

const placeholderImg = "https://via.placeholder.com/400x300?text=Car+Part";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) =>
        setProduct({ ...data, image: data.image || placeholderImg })
      )
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-page">
      <div className="product-page-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-page-image"
        />
      </div>
      <div className="product-page-info">
        <h2 className="product-page-title">{product.name}</h2>
        <p className="product-page-description">{product.description}</p>
        <p className="product-page-price">₱ {product.price}</p>

        <div className="product-page-actions">
          <label>
            Quantity:
            <input type="number" defaultValue={1} min={1} />
          </label>
          <button className="add-to-cart-btn">Add to Cart</button>
          <button className="buy-now-btn">Buy Now</button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
