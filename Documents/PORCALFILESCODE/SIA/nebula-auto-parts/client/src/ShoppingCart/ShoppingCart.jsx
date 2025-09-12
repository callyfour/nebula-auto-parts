import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import for routing
import "./ShoppingCart.css";

const ShoppingCart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ Initialize navigation

  const API_BASE =
    import.meta.env.MODE === "development"
      ? "http://localhost:5000"
      : import.meta.env.VITE_API_BASE;

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/cart`);
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCart(data);
      } catch (err) {
        console.error("❌ Cart fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [API_BASE]);

  const handleIncrease = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "inc" }),
      });
      const updated = await res.json();
      setCart((prev) => prev.map((item) => (item._id === id ? updated : item)));
    } catch (err) {
      console.error("❌ Increase error:", err);
    }
  };

  const handleDecrease = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/cart/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "dec" }),
      });
      const updated = await res.json();
      setCart((prev) => prev.map((item) => (item._id === id ? updated : item)));
    } catch (err) {
      console.error("❌ Decrease error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/api/cart/${id}`, { method: "DELETE" });
      setCart((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (loading) return <p>Loading cart...</p>;

  return (
    <div className="shopping-cart">
      {/* Step Tracker */}
      <div className="step-tracker">
        <div className="step active">
          1<br />
          Shopping Cart
        </div>
        <div className="step">
          2<br />
          Checking details
        </div>
        <div className="step">
          3<br />
          Order Complete
        </div>
      </div>

      {/* Select All + Delete */}
      <div className="cart-header">
        <label>
          <input type="checkbox" /> Select All
        </label>
        <button className="delete-btn">Delete</button>
      </div>

      {/* Cart Items */}
      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        cart.map((item) => (
          <div key={item._id} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item-image" />
            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <p>Quantity {item.quantity}</p>
              <p className="price">₱ {item.price.toLocaleString()}</p>
              <div className="cart-item-controls">
                <button onClick={() => handleDecrease(item._id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => handleIncrease(item._id)}>+</button>
              </div>
            </div>
            <button
              className="remove-icon"
              onClick={() => handleDelete(item._id)}
            >
              🗑
            </button>
          </div>
        ))
      )}

      {/* Bottom Buttons */}
      <div className="cart-footer">
        <div className="cart-footer-left">
          <button onClick={() => navigate("/orders")}>Track my order</button>
          <button onClick={() => navigate("/purchases")}>My Purchases</button>
          <button onClick={() => navigate("/shop")}>Shop more</button>
        </div>
        <div className="cart-footer-right">
          <button
            className="checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
