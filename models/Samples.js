const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const samplesSchema = new Schema({
    fileLink: {
      type: String,
      required: true,
    },
    extName: {
      type: String,
      required: true,
    },
    sampleTitle:{
      type: String,
      required:true,
    },
    sampleCourse:{
      type: String,
      required:true,
  },
    numberofPages:{
      type: Number,
      required: true,
    },
  },
  { timestamps: true },

);

const Samples = mongoose.model("Sample", samplesSchema);

module.exports = Samples;
