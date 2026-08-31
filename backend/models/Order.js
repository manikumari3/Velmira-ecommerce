
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
           NORMALIZE CUSTOMER EMAIL
        ========================= */

        customer.email =
            customer.email
                .trim()
                .toLowerCase();


        /* =========================
           CREATE ORDER
        ========================= */

        const order = new Order({

            customer,

            products,

            totalAmount:
                Number(totalAmount)

        });


        /* =========================
           SAVE TO MONGODB
        ========================= */

        const savedOrder =
            await order.save();


        console.log(
            "ORDER SAVED:",
            savedOrder._id.toString(),
            savedOrder.customer.email
        );


        /* =========================
           RESPONSE
        ========================= */

        return res.status(201).json({

            message:
                "Order placed successfully",

            order:
                savedOrder

        });


    } catch (error) {

        console.error(
            "ORDER CREATE ERROR:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to place order",

            error:
                error.message

        });

    }

});



/* =========================================
   GET CUSTOMER ORDER HISTORY
========================================= */

router.get("/", async (req, res) => {

    try {

        /* =========================
           GET EMAIL FROM URL
        ========================= */

        const email =
            req.query.email;


        /* =========================
           CHECK EMAIL
        ========================= */

        if (!email) {

            return res.status(400).json({

                message:
                    "Customer email is required"

            });

        }


        /* =========================
           NORMALIZE EMAIL
        ========================= */

        const normalizedEmail =
            email
                .trim()
                .toLowerCase();


        /* =========================
           FIND CUSTOMER ORDERS
        ========================= */

        const orders =
            await Order
                .find({
                    "customer.email":
                        normalizedEmail
                })
                .sort({
                    createdAt: -1
                });


        /* =========================
           LOG
        ========================= */

        console.log(
            `ORDER HISTORY: ${normalizedEmail} → ${orders.length} orders`
        );


        /* =========================
           RESPONSE
        ========================= */

        return res.json(
            orders
        );


    } catch (error) {

        console.error(
            "ORDER FETCH ERROR:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to fetch orders",

            error:
                error.message

        });

    }

});


module.exports = router;

