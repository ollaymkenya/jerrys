const Message = require('../models/Messages');
const ChatRoom = require('../models/Chatroom');
const Online = require("../models/Online");
const User = require("../models/User");

// save message
exports.saveMessage = async (message) => {
    let receivedTime = await getReceivedTime(message.toId);
    let msg = new Message({
        toId: message.toId,
        fromId: message.fromId,
        message: message.message,
        chatRoom: message.chatRoom,
        messageType: message.messageType,
        sentTime: message.sentTime,
        receivedTime: receivedTime,
        attachment: message.attachment
    })
    return await msg.save();
}

async function getReceivedTime (receiverUserId) {
    console.log('receiving user: ', receiverUserId);
    let user = await User.findById(receiverUserId);
    let timeDifference = user.userTimeDifference;
    let currentDate = new Date().getTime();
    return new Date(currentDate - timeDifference);
}

// adding a user to online database from app.js
exports.addToChatSpace = async (id, socketId) => {
    let memberIsPresent = await Online.findOne({ member: id.trim() });
    if (!memberIsPresent) {
        let member = new Online({
            member: id.trim(),
            socketId: socketId
        })
        await member.save();
    } else {
        memberIsPresent.socketId = socketId;
        await memberIsPresent.save();
    }
    let members = await Online.find();
    return members;
}

// removing a user from online
exports.RemoveFromChatSpace = async (socId) => {
    let offlineMember = await Online.findOne({ socketId: socId });
    console.log('offline member: ' + offlineMember);
    await Online.findOneAndDelete({socketId: socId});
    if (offlineMember) {
        console.log(offlineMember);
        return offlineMember;
    }
}

//get unread messages
exports.getUnredMessages = async (id) => {
    let unreadMessages = await Message.find({ toId: id.trim(), receipt: 'unread' }) || false;
    for (let i = 0; i < unreadMessages.length; i++) {
        unreadMessages[i].receipt = 'delivered';
        await unreadMessages[i].save()
    }
    return unreadMessages;
}

// get time difference
exports.upDateTimeDifference = async (serverTime, clientTime, userId) => {
    var diff = (clientTime.getTime() - serverTime.getTime()) / 1000;
    diff /= 60;
    console.log(diff);
    let timeDifferece = Math.abs(Math.round(diff));
    let user = await User.findById(userId);
    user.userTimeDifference = timeDifferece;
    return user.save();
}