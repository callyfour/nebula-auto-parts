const express = require("express");
const Cart = require("../models/Cart");
const auth = require("../middleware/auth");

const router = express.Router();

// Get logged-in user's cart
router.get("/", auth, async (req, res) => {
  try {
    const items = await Cart.find({ userId: req.user.id });
    res.json(items);
  } catch (err) {
    console.error("❌ Fetch cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add item to cart
router.post("/", auth, async (req, res) => {
  try {
    const { productId, name, price, image, quantity } = req.body;

    let existing = await Cart.findOne({ userId: req.user.id, productId });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.json(existing);
    }

    const newItem = new Cart({
      userId: req.user.id,
      productId,
      name,
      price,
      image,
      quantity,
    });

    await newItem.save();
    res.json(newItem);
  } catch (err) {
    console.error("❌ Cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete item
router.delete("/:id", auth, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Item removed" });
  } catch (err) {
    console.error("❌ Delete cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
