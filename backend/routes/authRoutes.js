const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


// =====================================================
// CHECK JWT SECRET
// =====================================================

function checkJWTSecret(res) {

    if (!process.env.JWT_SECRET) {

        console.error("JWT_SECRET is missing in .env");

        res.status(500).json({
            message: "Server configuration error"
        });

        return false;
    }

    return true;
}


// =====================================================
// REGISTER
// =====================================================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // REQUIRED FIELDS

        if (!name || !email || !password) {

            return res.status(400).json({
                message:
                    "Please provide name, email and password"
            });

        }


        // PASSWORD LENGTH

        if (password.length < 6) {

            return res.status(400).json({
                message:
                    "Password must be at least 6 characters"
            });

        }


        // JWT SECRET

        if (!checkJWTSecret(res)) {
            return;
        }


        // NORMALIZE EMAIL

        const normalizedEmail =
            email.trim().toLowerCase();


        // CHECK EXISTING USER

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });


        if (existingUser) {

            return res.status(400).json({
                message:
                    "An account with this email already exists"
            });

        }


        // HASH PASSWORD

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // CREATE USER

        const user =
            await User.create({

                name: name.trim(),

                email: normalizedEmail,

                password: hashedPassword

            });


        // CREATE JWT

        const token =
            jwt.sign(
                {
                    id: user._id.toString(),
                    email: user.email
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }
            );


        // RESPONSE

        return res.status(201).json({

            message:
                "Registration successful",

            token,

            user: {

                id: user._id.toString(),

                name: user.name,

                email: user.email

            }

        });


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        return res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

});


// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // REQUIRED FIELDS

        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Email and password are required"
            });

        }


        // JWT SECRET

        if (!checkJWTSecret(res)) {
            return;
        }


        // NORMALIZE EMAIL

        const normalizedEmail =
            email.trim().toLowerCase();


        // FIND USER IN MONGODB

        const user =
            await User.findOne({
                email: normalizedEmail
            });


        if (!user) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        // CHECK PASSWORD

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        // CREATE JWT

        const token =
            jwt.sign(
                {
                    id: user._id.toString(),
                    email: user.email
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }
            );


        // SEND USER DATA

        return res.json({

            message:
                "Login successful",

            token,

            user: {

                id:
                    user._id.toString(),

                name:
                    user.name,

                email:
                    user.email

            }

        });


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        return res.status(500).json({

            message:
                "Server error",

            error:
                error.message

        });

    }

});


module.exports = router;