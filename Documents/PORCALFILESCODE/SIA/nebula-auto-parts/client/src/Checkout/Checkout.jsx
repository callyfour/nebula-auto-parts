import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState("");
  const navigate = useNavigate();

  const API_BASE =
    import.meta.env.MODE === "development"
      ? "http://localhost:5000"
      : import.meta.env.VITE_API_BASE;

  // Helper for authenticated requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch cart items from MongoDB
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/cart`, {
          headers: getAuthHeaders(),
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          return navigate("/login");
        }
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
  }, [API_BASE, navigate]);

  const handleIncrease = async (id) => {
    const res = await fetch(`${API_BASE}/api/cart/${id}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "inc" }),
    });
    if (res.status === 401) {
      localStorage.removeItem("token");
      return navigate("/login");
    }
    const updated = await res.json();
    setCart((prev) => prev.map((item) => (item._id === id ? updated : item)));
  };

  const handleDecrease = async (id) => {
    const res = await fetch(`${API_BASE}/api/cart/${id}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "dec" }),
    });
    if (res.status === 401) {
      localStorage.removeItem("token");
      return navigate("/login");
    }
    const updated = await res.json();
    setCart((prev) => prev.map((item) => (item._id === id ? updated : item)));
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${API_BASE}/api/cart/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.status === 401) {
      localStorage.removeItem("token");
      return navigate("/login");
    }
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  // Checkout (call backend to place order, then clear cart)
  const handleCheckout = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/checkout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        return navigate("/login");
      }
      if (!res.ok) {
        alert("❌ Failed to place order.");
        return;
      }
      alert("✅ Order placed successfully!");
      setCart([]);
    } catch (err) {
      alert("❌ Error placing order.");
    }
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const discount = voucher === "DISCOUNT1000" ? 1000 : 0;
  const total = subtotal - discount;

  if (loading) return <p>Loading cart...</p>;

  return (
    <div className="checkout-page">
      <h1>Your Shopping Cart</h1>

      {/* Step tracker */}
      <div className="step-tracker">
        <div className="step">
          1<br />
          Shopping Cart
        </div>
        <div className="step active">
          2<br />
          Checking details
        </div>
        <div className="step">
          3<br />
          Order Complete
        </div>
      </div>

      {/* Cart items */}
      <div className="cart-list">
        {cart.map((item) => (
          <div className="cart-item" key={item._id}>
            <img src={item.image} alt={item.name} />
            <div className="item-info">
              <h3>{item.name}</h3>
              <p>Stock •</p>
              <p>Quantity</p>
              <div className="quantity-controls">
                <button onClick={() => handleDecrease(item._id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => handleIncrease(item._id)}>+</button>
              </div>
              <p className="price">₱ {item.price.toLocaleString()}</p>
            </div>
            <button
              className="remove-btn"
              onClick={() => handleDelete(item._id)}
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="checkout-footer">
        <input
          type="text"
          placeholder="Enter voucher code"
          value={voucher}
          onChange={(e) => setVoucher(e.target.value)}
        />
        <div className="footer-buttons">
          <button>Shop more</button>
          <button className="checkout-btn" onClick={handleCheckout}>
            Check out
          </button>
        </div>
        <div className="payment-icons">
          <img src="/visa.png" alt="Visa" />
          <img src="/mastercard.png" alt="Mastercard" />
          <img src="/paypal.png" alt="PayPal" />
        </div>
      </div>

      {/* Totals */}
      <div className="totals">
        <p>Subtotal: ₱ {subtotal.toLocaleString()}</p>
        <p>Voucher: ₱ {discount.toLocaleString()}</p>
        <h3>Total: ₱ {total.toLocaleString()}</h3>
      </div>
    </div>
  );
};

export default Checkout;
