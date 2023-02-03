const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    handle: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    kilonovaSubmissions: [String]
}, {timestamps: true});

const User = mongoose.model('User', userSchema);
module.exports = User;