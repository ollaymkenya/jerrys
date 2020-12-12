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
    messageType: {
      type: Schema.Types.ObjectId,
      ref: "MessageTypes",
      required: true
    },
    sentTime: {
      type: Date,
      required: true
    },
    receivedTime: {
      type: Date,
      required: true
    },
    receipt: {
      type: String,
      default: 'sent'
    },
    attachment: {
      type: Object,
      default: null
    }
  }
);

const Messages = mongoose.model("Messages", messagesSchema);

module.exports = Messages;
