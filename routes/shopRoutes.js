const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { 
    getShops, 
    createShop, 
    updateStatus, 
    getShopByOwner,
    deleteShop,
    updateShop,    
    getShopById,
    addItemToInventory,
    deleteItemFromInventory,
    updateItemInInventory
} = require('../controllers/shopController');

// Middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// ================= 📸 MULTER STORAGE CONFIGURATION =================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Physical path jahan images save hongi
    },
    filename: function (req, file, cb) {
        // Unique filename generation using timestamp + random number
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filtering option to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed! 🚨'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit Max
});

// ================= SHOP ROUTES =================

// 1. HOME PAGE: Sabke liye saari dukanein dikhao (Cards View)
router.get('/', getShops);

// 2. ADMIN PAGE: Nayi dukan register karne ke liye (Sirf Admin)
router.post('/', protect, authorize('admin'), upload.single('shopImage'), createShop);

// 3. DASHBOARD: Logged-in shopkeeper ki dukan fetch karne ke liye (Shopkeeper & Admin Allowed)
router.get('/owner/:ownerId', protect, getShopByOwner);

// 4. STATUS TOGGLE: Shopkeeper apni dukan Open/Close karega
router.put('/:id/status', protect, updateStatus);

// 5. DELETE SHOP: Sirf Admin hi poori dukan uda sakega 🔥
router.delete('/:id', protect, authorize('admin'), deleteShop);

// 6. EDIT SHOP & OFFERS: 🛠️ FIXED GAME! 'authorize('admin')' hata diya hai 
// Taaki Shopkeeper bhi apni dukan edit kar sake aur Offers live/update kar sake.
// Security controller ke andar (isOwner || isAdmin) handle ho rahi hai!
router.put('/:id', protect, upload.single('shopImage'), updateShop);

// 7. SINGLE SHOP: Dukan ki details aur inventory dekhne ke liye (Sabke liye)
router.get('/:id', getShopById);


// ================= INVENTORY ROUTES (CRUD) =================

// 8. ADD ITEM: Dukan mein naya item jodne ke liye
router.post('/:id/items', protect, addItemToInventory);

// 9. DELETE ITEM: Inventory se item hatane ke liye
router.delete('/:id/items/:itemId', protect, deleteItemFromInventory);

// 10. UPDATE ITEM: Inventory item ko edit ya stock status badalne ke liye
router.put('/:id/items/:itemId', protect, updateItemInInventory);

module.exports = router;