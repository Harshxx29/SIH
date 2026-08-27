const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOTP } = require('../services/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        const userExists = await User.findOne({ $or: [{ email }, { phone }] });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // STRICT SECURITY: Public registration is strictly restricted to Customer and Worker.
        // SuperAdmin privileges cannot be registered publicly and are directly stored in the database.
        const safeRole = (role === 'Worker') ? 'Worker' : 'Customer';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ 
            name, 
            email, 
            phone, 
            password: hashedPassword, 
            role: safeRole 
        });
        
        res.status(201).json({ _id: user._id, name: user.name, role: user.role, token: generateToken(user._id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ _id: user._id, name: user.name, role: user.role, token: generateToken(user._id) });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const requestOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save();
        
        await sendOTP(user.email, otp);
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || user.otp !== otp || user.otpExpiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
        
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        user.isVerified = true;
        await user.save();
        
        res.json({ success: true, _id: user._id, name: user.name, role: user.role, token: generateToken(user._id) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const logoutUser = (req, res) => {
    // Client clears the token in local storage. 
    // For extra security, we could implement a token blacklist here in the future.
    res.json({ success: true, message: 'User logged out successfully' });
};

const refreshToken = (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123', { ignoreExpiration: true });
        const newToken = generateToken(decoded.id);
        
        res.json({ success: true, token: newToken });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = { registerUser, loginUser, logoutUser, requestOTP, verifyOTP, refreshToken };
