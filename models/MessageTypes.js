const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageTypesSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

const MessageTypes = mongoose.model("MessageTypes", messageTypesSchema);

module.exports = MessageTypes;
