const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const onlineSchema = new Schema({
    member: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Online = mongoose.model("Online", onlineSchema);

module.exports = Online;
