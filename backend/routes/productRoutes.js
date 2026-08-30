const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
});

// GET products by category
router.get("/category/:category", async (req, res) => {
    try {
        const products = await Product.find({
            category: req.params.category
        });

        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch category products",
            error: error.message
        });
    }
});

// GET single product
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch product",
            error: error.message
        });
    }
});

// ADD product
router.post("/", async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({
            message: "Failed to add product",
            error: error.message
        });
    }
});

module.exports = router;