// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret"; // ⚠️ set in .env

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* ======================
   🔹 SCHEMAS & MODELS
   ====================== */

// Featured Items
const featuredItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
});
const FeaturedItem = mongoose.model("FeaturedItem", featuredItemSchema, "featuredItems");

// Products
const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  description: String,
  price: Number,
  brand: String,
  image: String,
});
const Product = mongoose.model("Product", productSchema, "productItems");

// Users
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  phone: { type: String },
  gender: { type: String, enum: ["Male", "Female"] },
  address: { type: String },
});
const User = mongoose.model("User", userSchema, "users");

// Cart
const cartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: Number,
  name: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 },
});
const CartItem = mongoose.model("CartItem", cartItemSchema, "cartItems");

// Orders
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: Number,
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model("Order", orderSchema, "orders");

/* ======================
   🔹 AUTH MIDDLEWARE
   ====================== */
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1]; // Expect "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach user id to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

/* ======================
   🔹 ROUTES
   ====================== */

// Root
app.get("/", (req, res) => res.send("🚀 Backend is running!"));

// --- Featured ---
app.get("/api/featured-items", async (req, res) => {
  try {
    const items = await FeaturedItem.find().limit(3);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Products ---
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REGISTER ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone, gender, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, phone, gender, address });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        gender: newUser.gender,
        address: newUser.address,
      },
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// --- LOGIN ---
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- PROFILE (NEW) ---
app.get("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, gender, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, gender, address },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Search Products ---
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Search query is required" });

    const products = await Product.find({ name: { $regex: query, $options: "i" } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- Cart (Protected) ---
app.get("/api/cart", authMiddleware, async (req, res) => {
  try {
    const cart = await CartItem.find({ userId: req.user.id });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/cart", authMiddleware, async (req, res) => {
  try {
    const { productId, name, price, image, quantity } = req.body;

    let existing = await CartItem.findOne({ userId: req.user.id, productId });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.json(existing);
    }

    const newItem = new CartItem({
      userId: req.user.id,
      productId,
      name,
      price,
      image,
      quantity,
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/cart/:id", authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // "inc" or "dec"
    const item = await CartItem.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (type === "inc") item.quantity++;
    if (type === "dec" && item.quantity > 1) item.quantity--;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/cart/:id", authMiddleware, async (req, res) => {
  try {
    await CartItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BUY / CHECKOUT (Protected) ---
app.post("/api/checkout", authMiddleware, async (req, res) => {
  try {
    const cartItems = await CartItem.find({ userId: req.user.id });
    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = new Order({
      userId: req.user.id,
      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice,
    });

    await newOrder.save();
    await CartItem.deleteMany({ userId: req.user.id }); // clear cart

    res.json({ success: true, message: "Checkout successful", order: newOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   🔹 START SERVER
   ====================== */
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
