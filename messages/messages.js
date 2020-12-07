const Message = require('../models/Messages');
const ChatRoom = require('../models/Chatroom');
const Online = require("../models/Online");

// save message
exports.saveMessage = (message) => {
    let msg = new Message({
        toId: message.to,
        fromId: message.from,
        message: message.message,
        chatRoom: message.chatRoom,
        messageType: message.messageType,
        sentTime: message.sentTime,
        receivedTime: message.receivedTime
    })
    msg.save();
}

exports.timeDifference = (dt1, dt2) => {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
}

exports.getReceivedTime = async (message) => {
    let toId = message.to;
    let chatRoom = await ChatRoom.findById(message.chatRoom);
    let recever = JSON.stringify(toId) === JSON.stringify(chatRoom.userId) ? 'userId' : JSON.stringify(toId) === JSON.stringify(chatRoom.user2Id) ? 'user2Id' : 'null';
    let receivertd;
    switch (recever) {
        case 'userId':
            receivertd = chatRoom.userTimeDifference;
            break;
        case 'user2Id':
            receivertd = chatRoom.user2TimeDifference;
            break;
        default:
            receivertd = 'error'
            break;
    }
    if (receivertd === 'error') {
        throw (new Error('no such time difference'));
    }
    let currentDate = new Date();
    return new Date(currentDate - receivertd || 0);
}

exports.addtoChatRoom = async (chatRoom, id) => {
    let chatroom = await chatRoom.findById(chatRoom);
    if (!chatroom.online.contains(id)) {
        chatroom.online.push(id);
        chatroom.save();
    }
    return chatroom.length;
}

exports.addToChatSpace = async (id) => {
    console.log(id);
    let memberIsPresent = await Online.findOne({member: id.trim()});
    if (!memberIsPresent) {
        let member = new Online({
            member: id.trim()
        })
        return await member.save();
    }
    return false;
}

exports.getUnredMessages = async (id) => {
    let unreadMessages = await Message.find({ toId: id.trim(), receipt: 'unread' }) || false;
    for (let i = 0; i < unreadMessages.length; i++) {
        unreadMessages[i].receipt = 'delivered';
        await unreadMessages[i].save()
    }
    return unreadMessages;
}