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

// --- Product Schema & Model ---
const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // numeric ID for easy frontend linking
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  brand: { type: String, required: true },
  image: { type: String, required: true },
});

const Product = mongoose.model("Product", productSchema, "productItems");

// --- Seed Featured Items ---
mongoose.connection.once("open", async () => {
  try {
    const featuredCount = await FeaturedItem.countDocuments();
    if (featuredCount === 0) {
      await FeaturedItem.insertMany([
        { title: "Item One", description: "Description for item one.", image: "https://via.placeholder.com/300x200" },
        { title: "Item Two", description: "Description for item two.", image: "https://via.placeholder.com/300x200" },
        { title: "Item Three", description: "Description for item three.", image: "https://via.placeholder.com/300x200" },
      ]);
      console.log("🌱 Seeded database with 3 featured items.");
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany([
        { id: 1, name: "Brake Pad", description: "High-quality brake pads for safety.", price: 1500, brand: "Toyota", image: "https://via.placeholder.com/400x300?text=Brake+Pad" },
        { id: 2, name: "Oil Filter", description: "Durable oil filter for smooth engine performance.", price: 700, brand: "Toyota", image: "https://via.placeholder.com/400x300?text=Oil+Filter" },
        { id: 3, name: "Air Filter", description: "Keeps air intake clean and efficient.", price: 800, brand: "Honda", image: "https://via.placeholder.com/400x300?text=Air+Filter" },
        { id: 4, name: "Spark Plug", description: "Reliable spark plugs for consistent ignition.", price: 400, brand: "Honda", image: "https://via.placeholder.com/400x300?text=Spark+Plug" },
        { id: 5, name: "Battery", description: "Long-lasting battery for all weather conditions.", price: 3000, brand: "Nissan", image: "https://via.placeholder.com/400x300?text=Battery" },
        { id: 6, name: "Brake Disc", description: "Premium brake disc for optimal stopping power.", price: 2200, brand: "Nissan", image: "https://via.placeholder.com/400x300?text=Brake+Disc" },
        { id: 7, name: "Clutch Kit", description: "Complete clutch kit for smooth gear changes.", price: 4500, brand: "Toyota", image: "https://via.placeholder.com/400x300?text=Clutch+Kit" },
        { id: 8, name: "Timing Belt", description: "Durable timing belt to prevent engine damage.", price: 1200, brand: "Honda", image: "https://via.placeholder.com/400x300?text=Timing+Belt" },
        { id: 9, name: "Radiator", description: "High-efficiency radiator to prevent overheating.", price: 3500, brand: "Nissan", image: "https://via.placeholder.com/400x300?text=Radiator" },
      ]);
      console.log("🌱 Seeded database with 9 products.");
    }
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  }
});

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

// --- Start Server ---
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
