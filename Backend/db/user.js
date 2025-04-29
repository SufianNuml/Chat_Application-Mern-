const mongoose = require("mongoose");

// User Schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Improved email validation regex
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordToken: { 
        type: String 
    },
    resetPasswordExpires: { 
        type: Date 
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId, // Stores references to other User documents
        ref: 'User'
    }]
});

module.exports = mongoose.model('User', UserSchema);
