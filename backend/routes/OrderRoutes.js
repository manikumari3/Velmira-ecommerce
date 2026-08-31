```js
const express = require("express");
const Order = require("../models/Order");

const router = express.Router();


/* =========================================
   PLACE ORDER
========================================= */

router.post("/", async (req, res) => {

    try {

        const {
            customer,
            products,
            totalAmount
        } = req.body;


        /* =========================
           VALIDATION
        ========================= */

        if (
            !customer ||
            !customer.name ||
            !customer.email ||
            !customer.phone ||
            !customer.address ||
            !customer.city ||
            !customer.state ||
            !customer.pincode
        ) {

            return res.status(400).json({
                message: "Complete customer details are required"
            });

        }


        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            return res.status(400).json({
                message: "At least one product is required"
            });

        }


        if (
            totalAmount === undefined ||
            totalAmount === null ||
            Number(totalAmount) < 0
        ) {

            return res.status(400).json({
                message: "Valid total amount is required"
            });

        }


        /* =========================
           CREATE ORDER
        ========================= */

        const order = new Order({
            customer,
            products,
            totalAmount: Number(totalAmount)
        });


        const savedOrder =
            await order.save();


        /* =========================
           RESPONSE
        ========================= */

        res.status(201).json({

            message: "Order placed successfully",

            order: savedOrder

        });


    } catch (error) {

        console.error(
            "Order Error:",
            error
        );


        res.status(500).json({
            message: "Failed to place order"
        });

    }

});



/* =========================================
   GET CUSTOMER ORDERS
========================================= */

router.get("/", async (req, res) => {

    try {

        const email = req.query.email;


        /* =========================
           VALIDATE EMAIL
        ========================= */

        if (!email) {

            return res.status(400).json({
                message: "Customer email is required"
            });

        }


        /* =========================
           FIND CUSTOMER ORDERS
        ========================= */

        const orders = await Order
            .find({
                "customer.email":
                    email.trim().toLowerCase()
            })
            .sort({
                createdAt: -1
            });


        /* =========================
           RESPONSE
        ========================= */

        res.json(orders);


    } catch (error) {

        console.error(
            "Order Fetch Error:",
            error
        );


        res.status(500).json({
            message: "Failed to fetch orders"
        });

    }

});


module.exports = router;
```
