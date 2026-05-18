const Shop = require('../models/Shop');

// 1. Get all shops (Home Page)
exports.getShops = async (req, res) => {
    try {
        const shops = await Shop.find().populate('owner', 'name');
        res.json(shops);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. Create a shop (Admin Page with Image Support)
exports.createShop = async (req, res) => {
    try {
        const { shopName, owner, category, address, contact } = req.body;
        
        let shopImage = "";
        if (req.file) {
            shopImage = `/uploads/${req.file.filename}`;
        }

        const newShop = new Shop({ 
            shopName, 
            owner, 
            category, 
            address, 
            contact,
            shopImage 
        });

        await newShop.save();
        res.status(201).json(newShop);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 3. Get Shop by Owner ID (Protected for self or admin)
exports.getShopByOwner = async (req, res) => {
    try {
        if (req.params.ownerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access Restricted: Unauthorized resource target." });
        }

        const shop = await Shop.findOne({ owner: req.params.ownerId });
        if (!shop) return res.status(404).json({ message: "Shop not found" });
        res.json(shop);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. Update Shop Status (Open/Closed)
exports.updateStatus = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        shop.isOpen = !shop.isOpen; 
        await shop.save();
        res.json(shop);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 5. DELETE SHOP (🔒 Security Patched)
exports.deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: "Shop not found!" });

        const isOwner = shop.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ message: "Unauthorized operation target." });

        await shop.deleteOne();
        res.json({ message: "Shop successfully deleted! 🗑️" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 6. UPDATE SHOP DETAILS
exports.updateShop = async (req, res) => {
    try {
        const { shopName, category, address, contact, isOpen, discountText, offerDescription, isOfferActive } = req.body;
        let shop = await Shop.findById(req.params.id);
        if (!shop) return res.status(404).json({ message: "Dukan nahi mili!" });

        const isOwner = shop.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ message: "Access Denied: Cannot modify foreign shops." });

        shop.shopName = shopName || shop.shopName;
        shop.category = category || shop.category;
        shop.address = address || shop.address;
        shop.contact = contact || shop.contact;
        if (typeof isOpen !== 'undefined') shop.isOpen = isOpen;

        shop.offers = {
            discountText: discountText !== undefined ? discountText : shop.offers.discountText,
            description: offerDescription !== undefined ? offerDescription : shop.offers.description,
            isActive: isOfferActive !== undefined ? (isOfferActive === 'true' || isOfferActive === true) : shop.offers.isActive
        };

        if (req.file) {
            shop.shopImage = `/uploads/${req.file.filename}`;
        }

        await shop.save();

        const updatedShop = await Shop.findById(shop._id).populate('owner', 'name');
        res.json(updatedShop);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 7. GET SHOP BY ID
exports.getShopById = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id).populate('owner', 'name');
        if (!shop) return res.status(404).json({ message: "Dukan nahi mili!" });
        res.json(shop);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};


// ================= 🔥 INVENTORY OPERATIONS UPDATED =================

// 8. Add Item (Updated to capture dynamic measurement unit)
exports.addItemToInventory = async (req, res) => {
    try {
        // --- 📏 UNIT ADDEED TO REQ.BODY DESTRUCTURING ---
        const { itemName, price, category, isAvailable, unit } = req.body; 
        const shop = await Shop.findById(req.params.id);

        if (!shop) return res.status(404).json({ message: "Shop not found" });

        const isOwner = shop.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ message: "Unauthorized" });

        const newItem = { 
            itemName, 
            price, 
            category: category || "General",
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            unit: unit || "piece" // Frontend se aayi unit yahan map ho jayegi
        };

        shop.inventory.push(newItem);
        await shop.save();

        res.status(201).json(shop.inventory[shop.inventory.length - 1]);
    } catch (err) {
        res.status(500).json({ message: "Item add error", error: err.message });
    }
};

// 9. Delete Item
exports.deleteItemFromInventory = async (req, res) => {
    try {
        const { id, itemId } = req.params;
        const shop = await Shop.findById(id);

        if (!shop) return res.status(404).json({ message: "Shop not found" });

        const isOwner = shop.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ message: "Unauthorized" });

        shop.inventory.pull(itemId);
        await shop.save();
        res.json({ message: "Item removed successfully" });
    } catch (err) {
        res.status(500).json({ message: "Delete error", error: err.message });
    }
};

// 10. Update Item (Updated to sync dynamic measurement unit updates)
exports.updateItemInInventory = async (req, res) => {
    try {
        const { id, itemId } = req.params;
        // --- 📏 UNIT ADDED HERE FOR UPDATES ---
        const { itemName, price, isAvailable, category, unit } = req.body;

        const shop = await Shop.findById(id);
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        const isOwner = shop.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ message: "Unauthorized" });

        const item = shop.inventory.id(itemId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        if (itemName !== undefined) item.itemName = itemName;
        if (price !== undefined) item.price = price;
        if (category !== undefined) item.category = category;
        if (isAvailable !== undefined) item.isAvailable = isAvailable;
        if (unit !== undefined) item.unit = unit; // Item update ke time unit switch update sync ho jayegi

        await shop.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: "Update error", error: err.message });
    }
};