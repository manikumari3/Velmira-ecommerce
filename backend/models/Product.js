const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true
        },

        oldPrice: {
            type: Number,
            default: 0
        },

        image: {
            type: String,
            required: true
        },

        description: {
            type: String,
            default: ""
        },

        rating: {
            type: Number,
            default: 0
        },

        badge: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Product", productSchema);