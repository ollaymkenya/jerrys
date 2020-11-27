const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const parameterCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  }
});

const ParameterCategory = mongoose.model("ParameterCategory", parameterCategorySchema);

module.exports = ParameterCategory;
