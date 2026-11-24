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
        cb(null, 'uploads/'); // Directory where uploaded images are stored.
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

// 1. HOME PAGE: Return all shops for the card view.
router.get('/', getShops);

// 2. ADMIN PAGE: Register a new shop. Admin access is required.
router.post('/', protect, authorize('admin'), upload.single('shopImage'), createShop);

// 3. DASHBOARD: Fetch the logged-in shopkeeper's shop. Shopkeeper and admin access are allowed.
router.get('/owner/:ownerId', protect, getShopByOwner);

// 4. STATUS TOGGLE: Allow a shopkeeper to open or close the shop.
router.put('/:id/status', protect, updateStatus);

// 5. DELETE SHOP: Only an admin can delete a shop.
router.delete('/:id', protect, authorize('admin'), deleteShop);

// 6. EDIT SHOP AND OFFERS:
// Shopkeepers can edit their own shop and update offers.
// Ownership and admin authorization are enforced inside the controller.
router.put('/:id', protect, upload.single('shopImage'), updateShop);

// 7. SINGLE SHOP: Return shop details and inventory for every visitor.
router.get('/:id', getShopById);


// ================= INVENTORY ROUTES (CRUD) =================

// 8. ADD ITEM: Add a new item to the shop inventory.
router.post('/:id/items', protect, addItemToInventory);

// 9. DELETE ITEM: Remove an item from inventory.
router.delete('/:id/items/:itemId', protect, deleteItemFromInventory);

// 10. UPDATE ITEM: Edit an inventory item or update its stock status.
router.put('/:id/items/:itemId', protect, updateItemInInventory);

module.exports = router;