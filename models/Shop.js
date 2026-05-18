const mongoose = require('mongoose');

// --- 🌾 Updated Inventory Item Schema ---
// Isse har item ko price aur accurate measurement unit milegi
const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true, // Naya item by default available rahega
    },
    category: {
        type: String, // e.g., 'Dairy', 'Snacks', 'Ration'
        default: 'General'
    },
    // --- 💰 PRICE UPDATED TO NUMBER ---
    // Mathematically calculation aur multiplication easy karne ke liye
    price: {
        type: Number,
        required: true,
        default: 0
    },
    // --- 📏 NEW MEASUREMENT UNIT FIELD ---
    // Shopkeeper ki dukan ki category ke hisab se frontend automatic isme value bhejega (e.g., kg, piece, packet, strip)
    unit: {
        type: String,
        required: true,
        default: 'piece',
        trim: true,
        lowercase: true // Taaki 'KG', 'Kg' ya 'kg' ka panga na ho, hamesha lowercase save ho
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
        ref: 'User', // Shopkeeper ki User ID
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

    // --- Naya Inventory Field ---
    inventory: [itemSchema] // Dynamic Items ki list yahan store hogi
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);