const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    chatRooms: {
        rooms: [
            {
                name: { type: String, required: true },
                users: [
                    {
                        type: String,
                        required: true
                    }
                ],
                messages: [
                    {
                        type: Object,
                        from: {
                            type: Schema.Types.ObjectId,
                            ref: "User",
                            required: true
                        },
                        to: {
                            type: Schema.Types.ObjectId,
                            ref: "User",
                            required: true
                        },
                        time: {
                            type: String,
                            required: true
                        },
                        message: {
                            type: String,
                            required: true
                        }
                    }
                ]
            }
        ]
    },
    password: {
        type: String,
        required: true,
    },
    resetToken: String,
    resetTokenExpiration: Date,
    isAdmin: {
        type: Boolean,
        default: false,
    },
},
    { timestamps: true });

userSchema.methods.addToChatRooms = function (messageRoom) {
    const updatedMessageRooms = [...this.chatRooms.rooms];
    updatedMessageRooms.push({
        name: messageRoom.name,
        users: messageRoom.users,
        messages: messageRoom.messages
    })

    const updatedRooms = { rooms: updatedMessageRooms };
    this.chatRooms = updatedRooms;
    return this.save();
}

userSchema.methods.addMessage = function (message, chatRoom) {
    //getting all rooms
    const rooms = [...this.chatRooms.rooms];
    //getting current Room
    const currentRoom = rooms.find((room) => room.name === chatRoom);
    //getting all messages from that Room
    currentRoomMessages = [...currentRoom.messages];
    //adding a message to that room
    currentRoomMessages.push(message);
    //saving the message to that room
    this.chatRooms.rooms.find((room) => room.name === chatRoom).messages = currentRoomMessages;
    //returning the room
    return this.save();
}

const User = mongoose.model('User', userSchema);
module.exports = User;