const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // ✅ Required for path navigation
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
// Iske bina frontend par image upload hone ke baad bhi crash/error 404 dikhayega
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Use
app.use('/api/auth', authRoutes); 
app.use('/api/shops', shopRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Gaon Shop Status API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT} 🚀`));