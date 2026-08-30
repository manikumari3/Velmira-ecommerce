const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const productRoutes =
    require("./routes/productRoutes");

const orderRoutes =
    require("./routes/OrderRoutes");

const authRoutes =
    require("./routes/authRoutes");


dotenv.config();


const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());


// =====================================================
// DATABASE
// =====================================================

connectDB();


// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {

    res.send(
        "Velmira Backend + MongoDB is running 🚀"
    );

});


// =====================================================
// AUTH
// =====================================================

app.use(
    "/api/auth",
    (req, res, next) => {

        console.log(
            "AUTH API HIT:",
            req.method,
            req.url
        );

        next();

    },
    authRoutes
);


// =====================================================
// PRODUCTS
// =====================================================

app.use(
    "/api/products",
    (req, res, next) => {

        console.log(
            "PRODUCT API HIT:",
            req.method,
            req.url
        );

        next();

    },
    productRoutes
);


// =====================================================
// ORDERS
// =====================================================

app.use(
    "/api/orders",
    (req, res, next) => {

        console.log(
            "ORDER API HIT:",
            req.method,
            req.url
        );

        next();

    },
    orderRoutes
);


// =====================================================
// SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log(
        `Velmira server running on http://localhost:${PORT}`
    );

});