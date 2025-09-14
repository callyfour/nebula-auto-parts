import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ProductPage.css";

const placeholderImg = "https://via.placeholder.com/400x300?text=Car+Part";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const API_BASE =
    import.meta.env.MODE === "development"
      ? "http://localhost:5000"
      : import.meta.env.VITE_API_BASE;

  // ✅ Get token from localStorage
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct({ ...data, image: data.image || placeholderImg });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, API_BASE]);

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (!product) return;

    if (!isLoggedIn) {
      alert("Please log in to add items to your cart.");
      return navigate("/login");
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ send token
        },
        body: JSON.stringify({
          productId: product.id || product._id, // support both id types
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to add to cart");
      }

      const data = await res.json();
      alert(`${product.name} added to cart!`);
      console.log("🛒 Cart updated:", data);
    } catch (err) {
      console.error("❌ Add to cart error:", err);
      alert("Something went wrong adding to cart.");
    }
  };

  // Handle Buy Now
  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      alert("Please log in to continue with purchase.");
      return navigate("/login");
    }
    await handleAddToCart();
    navigate("/cart");
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!product) return <p>Product not found.</p>;

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
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </label>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button className="buy-now-btn" onClick={handleBuyNow}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
