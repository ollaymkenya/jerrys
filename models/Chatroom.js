const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const chatroomSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user2Id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    online: {
      type: Array,
      default : []
    },
    userTimeDifference: {
      type: Number,
      default: null
    },
    user2TimeDifference: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
);

const Chatroom = mongoose.model("Chatroom", chatroomSchema);

module.exports = Chatroom;
