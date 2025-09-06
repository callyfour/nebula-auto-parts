require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Define Schema & Model ---
const featuredItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String
});

const FeaturedItem = mongoose.model("FeaturedItem", featuredItemSchema, "featuredItems");

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", (err) => console.error("❌ MongoDB connection error:", err));
db.once("open", async () => {
  console.log("✅ Connected to MongoDB");

  // Seed database if empty
  try {
    const count = await FeaturedItem.countDocuments();
    if (count === 0) {
      await FeaturedItem.insertMany([
        { title: "Item One", description: "This is the description for item one.", image: "https://via.placeholder.com/300x200" },
        { title: "Item Two", description: "This is the description for item two.", image: "https://via.placeholder.com/300x200" },
        { title: "Item Three", description: "This is the description for item three.", image: "https://via.placeholder.com/300x200" },
      ]);
      console.log("🌱 Seeded database with 3 featured items.");
    }
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  }
});

// --- Root Endpoint for Testing ---
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// --- API Endpoint ---
app.get("/api/featured-items", async (req, res) => {
  try {
    const items = await FeaturedItem.find().limit(3);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Start Server ---
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
