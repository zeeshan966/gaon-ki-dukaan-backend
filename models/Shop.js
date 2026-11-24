const mongoose = require('mongoose');

// --- 🌾 Updated Inventory Item Schema ---
// Each inventory item includes a price and an accurate measurement unit.
const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true, // New items are available by default.
    },
    category: {
        type: String, // e.g., 'Dairy', 'Snacks', 'Ration'
        default: 'General'
    },
    // --- 💰 PRICE UPDATED TO NUMBER ---
    // Store price as a number for calculations and arithmetic.
    price: {
        type: Number,
        required: true,
        default: 0
    },
    // --- 📏 NEW MEASUREMENT UNIT FIELD ---
    // The frontend sends the appropriate unit based on the shop category (for example: kg, piece, packet, or strip).
    unit: {
        type: String,
        required: true,
        default: 'piece',
        trim: true,
        lowercase: true // Normalize values such as KG or Kg to lowercase.
    }
});

// --- Main Shop Schema ---
const shopSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The shopkeeper's user ID.
        required: true,
    },
    category: {
        type: String,
        required: true, // e.g., Kirana, Medical, Barber, Garments
    },
    isOpen: {
        type: Boolean,
        default: false, 
    },
    address: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
    },
    // --- 📸 Shop Image Field ---
    shopImage: {
        type: String,
        default: "" 
    },
    
    // --- 🔥 OFFERS/DISCOUNT MANAGEMENT FIELD ---
    offers: {
        discountText: {
            type: String,
            default: "" 
        },
        description: {
            type: String,
            default: "" 
        },
        isActive: {
            type: Boolean,
            default: false 
        }
    },

    // --- Inventory Field ---
    inventory: [itemSchema] // Stores the dynamic list of shop items.
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);