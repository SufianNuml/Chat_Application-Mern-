const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
    username: { type: String, required: true }, 
    image: { type: String, required: true }
});

module.exports = mongoose.model('ProfileImage', ImageSchema);
