const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messagesSchema = new Schema(
  {
    toId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fromId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    chatRoom: {
      type: Schema.Types.ObjectId,
      ref: "Chatroom",
      required: true,
    },
    type: {
      type: Schema.Types.ObjectId,
      ref: "MessageTypes",
      required: true
    }
  },
  { timestamps: true }
);

const Messages = mongoose.model("Messages", messagesSchema);

module.exports = Messages;
