const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Register - Handles both Single and Multiple users
exports.register = async (req, res) => {
    try {
        // CASE 1: Handle multiple users submitted as an array.
        if (Array.isArray(req.body)) {
            const usersArray = req.body;
            const validUsers = [];

            // Validate each user and hash the password.
            for (let userData of usersArray) {
                const { name, email, password, role } = userData;

                // Check whether the user already exists.
                const existingUser = await User.findOne({ email });
                if (!existingUser) {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    
                    validUsers.push({
                        name,
                        email,
                        password: hashedPassword,
                        role: role || 'shopkeeper' // Use shopkeeper as the default role.
                    });
                }
            }

            if (validUsers.length === 0) {
                return res.status(400).json({ message: "All users in the list already exist" });
            }

            // Insert all validated users in a single operation.
            const createdUsers = await User.insertMany(validUsers);
            return res.status(201).json({ 
                message: "Bulk registration successful!", 
                count: createdUsers.length 
            });
        }

        // CASE 2: Handle a single user object.
        const { name, email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword, role });
        await user.save();
        
        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};