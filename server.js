const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // ✅ Required for path navigation
const mongoose = require('mongoose'); // ✅ Added for cleanup script connection reference
const connectDB = require('./config/db');

// Routes Import
const authRoutes = require('./routes/authRoutes'); 
const shopRoutes = require('./routes/shopRoutes'); 

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ✅ 📸 STATIC FOLDER EXPRESS CONFIGURATION
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Use
app.use('/api/auth', authRoutes); 
app.use('/api/shops', shopRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Gaon Shop Status API is running...');
});

// ⚠️ 🔥 ONCE-TIME MASTER CLEANUP SCRIPT FOR IMAGES
// Yeh database se 'http://localhost:5000' ko ek baar mein uda degi
mongoose.connection.once('open', async () => {
  try {
    console.log("🛠️ Starting Database Image URL Cleanup...");
    
    const shopCollection = mongoose.connection.db.collection('shops');
    
    const result = await shopCollection.updateMany(
      { shopImage: { $regex: "http://localhost:5000" } },
      [{ $set: { shopImage: { $replaceOne: { input: "$shopImage", find: "http://localhost:5000", replacement: "" } } } }]
    );
    
    console.log(`✅ Database Cleaned! Modified ${result.modifiedCount} shops.`);
  } catch (error) {
    console.error("❌ Cleanup Error:", error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT} 🚀`));