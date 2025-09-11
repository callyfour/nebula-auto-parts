require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const featuredItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
});
const FeaturedItem = mongoose.model("FeaturedItem", featuredItemSchema, "featuredItems");

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  description: String,
  price: Number,
  brand: String,
  image: String,
});
const Product = mongoose.model("Product", productSchema, "productItems");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema, "users");

const cartItemSchema = new mongoose.Schema({
  productId: Number,
  name: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 },
});
const CartItem = mongoose.model("CartItem", cartItemSchema, "cartItems");

app.get("/", (req, res) => res.send("✅ Backend is running!"));

app.get("/api/featured-items", async (req, res) => {
  try {
    const items = await FeaturedItem.find().limit(3);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ success: true, message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    res.json({ success: true, message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

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

app.get("/api/cart", async (req, res) => {
  try {
    const cart = await CartItem.find();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.put("/api/cart/:id", async (req, res) => {
  try {
    const { type } = req.body;
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

app.delete("/api/cart/:id", async (req, res) => {
  try {
    await CartItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
