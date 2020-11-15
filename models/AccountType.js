const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const accounttypeSchema = new Schema({
    name: {
        type: String,
        required: true,
    }
})

const AccountType = mongoose.model('AccountType', accounttypeSchema);
module.exports = AccountType;