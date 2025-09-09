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
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- Featured Item Schema & Model ---
const featuredItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
});
const FeaturedItem = mongoose.model("FeaturedItem", featuredItemSchema, "featuredItems");

// --- Product Schema & Model ---
const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  brand: { type: String, required: true },
  image: { type: String, required: true },
});
const Product = mongoose.model("Product", productSchema, "productItems");

// --- User Schema & Model ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // ⚠️ in production, hash this
});
const User = mongoose.model("User", userSchema, "users");

// --- Routes ---
app.get("/", (req, res) => res.send("✅ Backend is running!"));

// Get featured items
app.get("/api/featured-items", async (req, res) => {
  try {
    const items = await FeaturedItem.find().limit(3);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product by numeric ID
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

// --- Register User ---
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // save new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ success: true, message: "User registered successfully!" });
  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- Login User ---
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password }); // ⚠️ plain check
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({ success: true, message: "Login successful", user });
  } catch (err) {
    console.error("❌ Error logging in:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q; // e.g. /api/search?q=brake
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Case-insensitive regex search
    const products = await Product.find({
      name: { $regex: query, $options: "i" },
    });

    res.json(products);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- Start Server ---
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
