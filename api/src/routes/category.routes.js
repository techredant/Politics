// routes/categoryRoutes.js
const express = require("express");
const Category = require("../models/category");

const router = express.Router();

// ------------------- Create category -------------------
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, category });
  } catch (err) {
    console.error("Error creating category:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------- Get all categories -------------------
router.get("/", async (_req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
