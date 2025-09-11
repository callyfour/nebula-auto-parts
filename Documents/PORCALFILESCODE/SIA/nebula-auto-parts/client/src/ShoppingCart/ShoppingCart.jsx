import { useEffect, useState } from "react";
import "./ShoppingCart.css";

const ShoppingCart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE =
    import.meta.env.MODE === "development"
      ? "http://localhost:5000"
      : import.meta.env.VITE_API_BASE;

  // Fetch cart items from backend
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

  // Increase quantity
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

  // Decrease quantity
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

  // Delete item
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/api/cart/${id}`, { method: "DELETE" });
      setCart((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  // Calculate total
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (loading) return <p>Loading cart...</p>;

  return (
    <div className="shopping-cart">
      <h2>🛒 Shopping Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <img
                src={item.image}
                alt={item.name}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>₱ {item.price}</p>
                <div className="cart-item-controls">
                  <button onClick={() => handleDecrease(item._id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleIncrease(item._id)}>+</button>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => handleDelete(item._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="cart-summary">
            <h3>Total: ₱ {totalPrice}</h3>
            <button className="checkout-btn">Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCart;
