const User = require("../models/User");

const moment = require("moment");

function formatMessage(userId, message) {
    return {
        ownerId: userId,
        message,
        time: moment().format("h:mm a"),
    };
}

async function saveMsg(userId, message, chatRoom) {
    try {
        const from = userId;
        const users = chatRoom.split("and");
        const userTo = await User.findOne({ username: { $in: [users[0], users[1]] }, _id: { $ne: from } });
        const userFrom = await User.findOne({ _id: from });
        const sentMessage = {
            from: userFrom._id,
            to: userTo._id,
            time: moment().format("h:mm a"),
            message,
        }
        userTo.addMessage(sentMessage, chatRoom);
        userFrom.addMessage(sentMessage, chatRoom);
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = {
    formatMessage,
    saveMsg,
};
