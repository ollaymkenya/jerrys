const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const samplesSchema = new Schema(
  {
    fileLink: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

const Samples = mongoose.model("Samples", samplesSchema);

module.exports = Samples;
