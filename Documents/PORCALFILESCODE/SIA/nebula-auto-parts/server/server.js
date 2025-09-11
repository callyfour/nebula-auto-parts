// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

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
  id: { type: Number, required: true, unique: true }, // numeric ID
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
  password: { type: String, required: true }, // ⚠️ hash later in production
});
const User = mongoose.model("User", userSchema, "users");

// Cart
const cartItemSchema = new mongoose.Schema({
  productId: Number, // matches Product.id
  name: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 },
});
const CartItem = mongoose.model("CartItem", cartItemSchema, "cartItems");

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

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    // JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

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

// --- Search Products ---
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const products = await Product.find({
      name: { $regex: query, $options: "i" },
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- Cart Routes ---
// Get cart items
app.get("/api/cart", async (req, res) => {
  try {
    const cart = await CartItem.find();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add to cart
app.post("/api/cart", async (req, res) => {
  try {
    const { productId, name, price, image, quantity } = req.body;

    let existing = await CartItem.findOne({ productId });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.json(existing);
    }

    const newItem = new CartItem({ productId, name, price, image, quantity });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update cart item qty
app.put("/api/cart/:id", async (req, res) => {
  try {
    const { type } = req.body; // "inc" or "dec"
    const item = await CartItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (type === "inc") item.quantity++;
    if (type === "dec" && item.quantity > 1) item.quantity--;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete from cart
app.delete("/api/cart/:id", async (req, res) => {
  try {
    await CartItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   🔹 START SERVER
   ====================== */
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
