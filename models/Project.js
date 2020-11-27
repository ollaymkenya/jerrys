const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    typeOfPaper: {
      type: Schema.Types.ObjectId,
      ref: "Parameter",
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Parameter",
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    orderInstructions: {
      type: String,
      required: true,
    },
    style: {
      type: String,
      required: true,
    },
    urgency: {
      type: Schema.Types.ObjectId,
      ref: "Parameter",
      required: true,
    },
    numberOfSources: {
      type: Number,
      required: true,
    },
    academicLevel: {
      type: Schema.Types.ObjectId,
      ref: "Parameter",
      required: true,
    },
    numberOfPages: {
      type: Number,
      required: true,
    },
    Review: {
      type: String,
    },
    completed: {
      type: Boolean,
      date: {
        type: Date,
        default: null,
      },
      default: null,
    },
    assignmentWork: {
      type: String,
      default: null,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
