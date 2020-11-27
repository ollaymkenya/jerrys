const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const parameterSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "ParameterCategory",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const Parameter = mongoose.model("Parameter", parameterSchema);

module.exports = Parameter;
