const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contestSchema = new Schema({
    editor: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate1: {
        type: String,
        required: true
    },
    startDate2: {
        type: String,
        required: true
    },
    endDate1: {
        type: String,
        required: true
    },
    endDate2: {
        type: String,
        required: true
    },
    kilonovaProblemsIDs: [String],
    participants: [String]
}, {timeStamps: true});

const Contest = mongoose.model('Contest', contestSchema);
module.exports = Contest;