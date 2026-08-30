const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

const products = [
    {
        name: "Everyday Running Shoes",
        category: "Footwear",
        price: 2499,
        oldPrice: 3499,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        description: "Comfortable everyday running shoes designed for daily movement.",
        rating: 4.5,
        badge: "BESTSELLER"
    },
    {
        name: "Classic Cotton T-Shirt",
        category: "Fashion",
        price: 799,
        oldPrice: 1199,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
        description: "Soft cotton t-shirt with a clean everyday style.",
        rating: 4.4,
        badge: "NEW"
    },
    {
        name: "Minimal Backpack",
        category: "Bags",
        price: 1499,
        oldPrice: 2199,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        description: "Minimal and practical backpack for everyday use.",
        rating: 4.6,
        badge: "POPULAR"
    },
    {
        name: "Wireless Headphones",
        category: "Electronics",
        price: 2999,
        oldPrice: 4499,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        description: "Wireless headphones with immersive sound and comfortable fit.",
        rating: 4.5,
        badge: "TRENDING"
    },
    {
        name: "Smart Watch",
        category: "Electronics",
        price: 3999,
        oldPrice: 5999,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        description: "Smart everyday watch with a sleek modern design.",
        rating: 4.3,
        badge: "NEW"
    },
    {
        name: "Ceramic Coffee Mug",
        category: "Home",
        price: 499,
        oldPrice: 699,
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=800&q=80",
        description: "Elegant ceramic mug for your everyday coffee or tea.",
        rating: 4.7,
        badge: ""
    },
    {
        name: "Premium Sunglasses",
        category: "Accessories",
        price: 1299,
        oldPrice: 1999,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
        description: "Stylish sunglasses with a premium everyday look.",
        rating: 4.4,
        badge: "TRENDING"
    },
    {
        name: "Classic Analog Watch",
        category: "Accessories",
        price: 2199,
        oldPrice: 3299,
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
        description: "Classic analog watch with a timeless minimalist design.",
        rating: 4.6,
        badge: "POPULAR"
    }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected ✅");

        await Product.deleteMany();

        await Product.insertMany(products);

        console.log(`${products.length} products added successfully 🎉`);

        process.exit();
    } catch (error) {
        console.error("Error seeding products ❌");
        console.error(error.message);
        process.exit(1);
    }
};

seedProducts();