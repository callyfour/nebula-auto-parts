require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
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

// --- Optional: Product Schema & Model for future use ---
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  brand: String,
  image: String,
});

const Product = mongoose.model("Product", productSchema, "products");

// --- Seed Featured Items if empty ---
mongoose.connection.once("open", async () => {
  try {
    const count = await FeaturedItem.countDocuments();
    if (count === 0) {
      await FeaturedItem.insertMany([
        { title: "Item One", description: "Description for item one.", image: "https://via.placeholder.com/300x200" },
        { title: "Item Two", description: "Description for item two.", image: "https://via.placeholder.com/300x200" },
        { title: "Item Three", description: "Description for item three.", image: "https://via.placeholder.com/300x200" },
      ]);
      console.log("🌱 Seeded database with 3 featured items.");
    }
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  }
});

// --- Routes ---
app.get("/", (req, res) => res.send("✅ Backend is running!"));

// Get featured items (limit 3)
app.get("/api/featured-items", async (req, res) => {
  try {
    const items = await FeaturedItem.find().limit(3);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products (future use)
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Start Server ---
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
