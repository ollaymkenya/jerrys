let form = document.querySelector('.input-message');
let message = document.querySelector("#message");
let fakeMessage = document.querySelector('.editableDiv');
let messageList = document.querySelector('.messages-list');
let userId = document.querySelector('input[name="user"]');
let otherUserId = document.querySelector('input[name="otherUser"]');
let username = document.querySelector('input[name="username"]');
let otherUserName = document.querySelector('input[name="otherUserName"]');
let chatRoomId = document.querySelector('input[name="chatRoomId"]');
let emojiBtn = document.querySelector('.emoji-btn');
let messageItems = document.querySelectorAll(".message");
let readRecipts = document.querySelectorAll('.read-receipt');
let chatMessageHeader = document.querySelector('.chat-messages__header');
let otherIsOnline = chatMessageHeader.querySelector('.online-status');
let attachment;
const readReceipts = {
    sent: '<ion-icon style="font-size: 1rem; --ionicon-stroke-width: 40px; margin-bottom: -2px;" name="checkmark-outline" role="img" class="md hydrated" aria-label="checkmark outline"></ion-icon>',
    received: '<ion-icon style="font-size: 1rem; --ionicon-stroke-width: 40px; margin-bottom: -2px;" name="checkmark-done-outline" role="img" class="md hydrated" aria-label="checkmark done outline"></ion-icon>',
    read: '<ion-icon style="font-size: 1rem; --ionicon-stroke-width: 40px; color: #0095F6; margin-bottom: -2px;" name="checkmark-done-outline" role="img" class="md hydrated" aria-label="checkmark done outline"></ion-icon>'
}

// *****************************************************************************************************************************************************************************************************************//
// chatting
dayjs.extend(window.dayjs_plugin_localizedFormat);
// scroll chats
document.querySelectorAll('.time-chat').forEach(timeChat => {
    timeChat.innerText = dayjs(timeChat.innerText).format('ddd DD, MMM');
})

// concerting read receipts to actual HTML
if (readRecipts) {
    readRecipts.forEach(readRecipt => {
        readRecipt.innerHTML = readRecipt.innerText;
    })
}

messageList.scrollTop = messageList.scrollHeight;

// *****************************************************************************************************************************************************************************************************************//
// SOCKET.IO
// emitting to the server that the user is online
const socket = io();
// if this is the beginning fo the conversation ask the bot to send a message indicating that

socket.emit('announceOnline', { userId: userId.value, userTime: Date.now() });

socket.on('addOnline', (onlines) => {
    // getting all values that hold the online/offline value
    let onlineStatus = document.querySelectorAll('.online-status');
    onlineStatus.forEach(onlineStat => {
        // if the current online/offline value has the same id as the id passed it should be online
        if (onlines.chatspace.findIndex(online => JSON.stringify(online.member) === JSON.stringify(onlineStat.dataset.id)) > -1) {
            onlineStat.classList.remove('offline');
            onlineStat.classList.add('online');
            onlineStat.innerHTML = 'online';
        } else {
            onlineStat.classList.remove('online');
            onlineStat.classList.add('offline');
            onlineStat.innerHTML = 'offline';
        }
    })

    // changing message to received in message receipt
    if (onlines.chatspace.findIndex(online => JSON.stringify(online.member) === JSON.stringify(otherUserId.value)) > -1) {
        readRecipts.forEach(readReceipt => {
            if (readReceipt.classList.contains('message-home')) {
                let span = readReceipt.getElementsByTagName('span')[0];
                span.innerHTML = (span.innerHTML.trim() === readReceipts.sent.trim()) ? readReceipts.received : span.innerHTML;
            }
        })
    }
})

// changing message to read in message receipt
socket.on('read-receipt', (userId) => {
    if (JSON.stringify(userId) === JSON.stringify(otherUserId.value)) {
        readRecipts.forEach(readReceipt => {
            if (readReceipt.classList.contains('message-home')) {
                let span = readReceipt.getElementsByTagName('span')[0];
                span.innerHTML = (span.innerHTML !== readReceipts.read) ? readReceipts.read : span.innerHTML;
            }
        })
    }
})

// joining a user to a chatroom and sending message from bot to say it's a new message
socket.emit('joinRoom', {
    chatRoom: chatRoomId.value,
    user: userId.value,
    otherUserName: otherUserName.value
})

// sending message from form to server
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (message.value.trim() !== '') {
        sendMessage();
    }
});

function sendMessage() {
    if (document.querySelector('.new-attachment')) {
        attachment = {
            type: document.querySelector('.attachment').dataset.type,
            title: document.querySelector('.attachment-title').innerText,
            username: document.querySelector('.attachment-name').innerText === 'You' ? username.value : document.querySelector('.attachment-name').innerText,
            attchmentLink: document.querySelector('.attachment').dataset.attachmentLink
        }
    }

    let receipt = 'sent';
    if (otherIsOnline.innerText.trim() === 'online') {
        receipt = 'received';
    }

    let msg = {
        toId: otherUserId.value,
        fromId: userId.value,
        message: message.value.trim(),
        chatRoom: chatRoomId.value,
        messageType: "5fc7fdc98142f5b0883eba55",
        sentTime: new Date(),
        attachment: attachment,
        receipt: receipt
    }
    socket.emit('new message', msg);
    if (document.querySelector('.close-attachment')) {
        disableAttachment();
    }
    message.value = '';
    fakeMessage.innerText = '';
    return false;
}

// upon receiving a message
socket.on("message", (messageInfo) => {
    let isCurrent = JSON.stringify(messageInfo.fromId) === JSON.stringify(userId.value) ? true : false;
    let isOther = JSON.stringify(messageInfo.fromId) === JSON.stringify(otherUserId.value) ? true : false;
    let isChatBot = JSON.stringify(messageInfo.fromId) === JSON.stringify('5fd38c93e2ea8eafb0f382ea') && JSON.stringify(messageInfo.toId) === JSON.stringify(userId.value);
    let div;
    if (messageInfo.attachment) {
        div = document.createElement('div');
        div.className = 'attachment';
        div.setAttribute('contenteditable', 'false');
        let div1 = document.createElement('div');
        div1.className = 'attachment-container';
        let small = document.createElement('small');
        small.className = 'attachment-name';
        small.innerText = `${messageInfo.attachment.username === username.value ? 'You' : messageInfo.attachment.username}`;
        let small1 = document.createElement('small');
        small1.className = 'attachment-title';
        small1.innerHTML = `<ion-icon name="reader"></ion-icon> ${messageInfo.attachment.title}`;
        div.appendChild(div1);
        div1.appendChild(small);
        div1.appendChild(small1);
        messageList.append(small);
    }
    if (isChatBot) {
        let p = document.createElement('p');
        p.className = 'center bot-chat message';
        p.innerHTML = messageInfo.message;
        messageList.appendChild(p);
    } else if (isCurrent) {
        let li = document.createElement('li');
        let p = document.createElement('p');
        let small = document.createElement('small');
        p.innerText = messageInfo.message;
        small.innerHTML = `${dayjs(new Date(messageInfo.sentTime)).format('LT')} ${readReceipts[messageInfo.receipt]}`;
        small.className = 'read-receipt message-home'
        if (messageInfo.attachment) {
            li.className = 'message-item message-home message has-attachment'
            li.appendChild(div);
        } else {
            li.className = 'message-item message-home message'
        }
        li.appendChild(p);
        messageList.appendChild(li);
        messageList.append(small);
        small.setAttribute('data-messageid', `${messageInfo._id}`);
    } else if (isOther) {
        socket.emit('read-receipt', {
            chatRoom: chatRoomId.value,
            messageId: messageInfo._id,
            userId: otherUserId.value
        })
        let li = document.createElement('li');
        let p = document.createElement('p');
        let small = document.createElement('small');
        p.innerText = messageInfo.message;
        small.innerText = dayjs(new Date(messageInfo.receivedTime)).format('LT');
        small.className = 'read-receipt message-away';
        if (messageInfo.attachment) {
            li.className = 'message-item message-away message has-attachment'
            li.appendChild(div);
        } else {
            li.className = 'message-item message-away message'
        }
        li.appendChild(p);
        messageList.appendChild(li);
        messageList.append(small);
        small.setAttribute('data-messageid', `${messageInfo._id}`);
    }
    messageList.scrollTop = messageList.scrollHeight;
    attachment = null;
})

socket.on('make-read', (messageId, user) => {
    if (JSON.stringify(user) === JSON.stringify(userId.value)) {
        let smallReceipt = document.querySelector(`small[data-messageid="${messageId}"]`);
        smallReceipt.innerHTML = readReceipts.read;
    }
})

socket.on('announceOffline', (user) => {
    // getting all values that hold the online/offline value
    let onlineStatus = document.querySelectorAll('.online-status');
    onlineStatus.forEach(onlineStat => {
        // if the current online/offline value has the same id as the id passed it should be offline
        if (user && user.member === onlineStat.dataset.id) {
            onlineStat.classList.remove('online');
            onlineStat.classList.add('offline');
            onlineStat.innerHTML = 'offline';
        }
    })
})

// send message on pressing enter key
fakeMessage.addEventListener('keypress', (e) => {
    if (e.code === 'Enter' && message.value.trim() !== '') {
        e.preventDefault();
        sendMessage();
    } else if (e.code === 'Enter' && message.value.trim() === '') {
        e.preventDefault();
    }
});

// sending an event to notify the current user when the other user is typing
fakeMessage.addEventListener('keydown', (e) => {
    socket.emit('typing', userId.value, chatRoomId.value);
})

// sending an event to notify the current user that the other user is no longer typing
fakeMessage.addEventListener('keyup', (e) => {
    socket.emit('stop typing', userId.value, chatRoomId.value);
})

// event listener to start the typing
socket.on('typing', (userId) => {
    if (!document.querySelector('.typing')) {
        if (JSON.stringify(userId) === JSON.stringify(otherUserId.value)) {
            isTyping();
        }
    }
})

// event listener to stop the typing
let timeout;
socket.on('stop typing', (userId) => {
    if (document.querySelector('.typing')) {
        if (userId === otherUserId.value) {
            clearTimeout(timeout);
            timeout = setTimeout(() => stopTyping(), 500);
        }
    }
})

// function to create is typing div
function isTyping() {
    let li = document.createElement('li');
    li.className = 'typing';
    for (let i = 1; i < 4; i++) {
        let span = document.createElement('span');
        span.className = `typing${i}`;
        li.appendChild(span);
    }
    messageList.appendChild(li);
    messageList.scrollTop = messageList.scrollHeight;
}

// function to remove a typing div from the DOM
function stopTyping() {
    let typing = document.querySelector('.typing');
    typing.remove();
}

//Closing a project
if (document.querySelector('.close-attachment')) {
    document.querySelector('.close-attachment').addEventListener('click', () => {
        disableAttachment();
    })
}

function disableAttachment() {
    form.classList.remove("has-attachment");
    document.querySelector(".new-attachment").remove();
}

// ****************************************************************************************************************************************************************************************************************//
// Emoji Code

let emojiButton = document.querySelector('.emoji-btn');
let smileysBtn = document.querySelector('.smiley-btn');
let animalsBtn = document.querySelector('.animals-btn');
let foodsBtn = document.querySelector('.foods-btn');
let activitiesBtn = document.querySelector('.activities-btn');
let travelBtn = document.querySelector('.travel-btn');
let objectsBtn = document.querySelector('.objects-btn');
let symbolsBtn = document.querySelector('.symbols-btn');
let flagsBtn = document.querySelector('.flags-btn');
let emojiSearch = document.getElementById('emojiSearch');
let active;

// Function to fetch a category of emojis
function getOfCategory(category) {
    if (category === active) {
        return;
    }
    makeActive(category);
    return new Promise((resolve, reject) => {
        fetch(`https://emoji-api.com/categories/${category}?access_key=5e91924e9b59cf60571da4bb776bb17529053df5`)
            .then(response => response.json())
            .then(data => {
                resolve(data);
            });
    })
}

// fetching emojis on search
emojiSearch.addEventListener('input', (e) => {
    searching();
    fetch(`https://emoji-api.com/emojis?search=${e.target.value}&access_key=5e91924e9b59cf60571da4bb776bb17529053df5`)
        .then(response => response.json())
        .then(emojis => {
            if (!emojis) {
                return noEmojis();
            }
            displayEmojis(emojis);
        })
})

// onInput in the div.editableDiv
fakeMessage.addEventListener('input', () => {
    trueMessage();
});

// Function to put the message in the input hidden
function trueMessage() {
    document.getElementById('message').value = fakeMessage.innerText;
}

// upon clicking a btn display the necessary emojis
let categoryButtons = [emojiButton, smileysBtn, animalsBtn, foodsBtn, activitiesBtn, travelBtn, objectsBtn, symbolsBtn, flagsBtn];

for (let i = 0; i < categoryButtons.length; i++) {
    categoryButtons[i].addEventListener('click', async (e) => {
        searching();
        getOfCategory(e.target.dataset.category)
            .then(emojis => {
                if (!emojis) {
                    return noEmojis();
                }
                displayEmojis(emojis)
            })
            .then((result) => {
                for (let i = 0; i < document.querySelectorAll('.emoji').length; i++) {
                    let emoji = document.querySelectorAll('.emoji')[i];
                    emoji.addEventListener('click', (e) => {
                        fakeMessage.innerText += e.target.innerText;
                        trueMessage();
                    })
                }
            })
    })
}

// Function to display emojis
function displayEmojis(allEmojis) {
    let emojis = '';
    for (let i = 0; i < allEmojis.length; i++) {
        let emoji = allEmojis[i] && allEmojis[i].character ? allEmojis[i].character : null;
        let emojiCode = allEmojis[i] && allEmojis[i].codePoint ? allEmojis[i].codePoint : null;
        if (!JSON.stringify(emojiCode).includes('200D') && emoji !== '🥲') {
            emojis += `<span class='emoji'>${emoji}</span>`;
        }
    }
    notSearching(emojis);
    return;
}

// perfom the following while searching
function searching() {
    document.querySelector('.emoji-loading') ? document.querySelector('.emoji-loading').remove() : true;
    document.querySelector('.emoji-container__box') ? document.querySelector('.emoji-container__box').remove() : true;
    document.querySelector('.no-emoji') ? document.querySelector('.no-emoji').remove() : true;
    let emojiLoading = document.createElement('div');
    emojiLoading.className = 'emoji-loading';
    emojiLoading.innerHTML = `<span class='loading-emoji'>⌛</span><br><span>Loading ...</span>`;
    document.querySelector('.emoji-container').appendChild(emojiLoading);
}

function notSearching(emojis) {
    document.querySelector('.emoji-loading').remove();
    document.querySelector('.emoji-container__box') ? document.querySelector('.emoji-container__box').remove() : true;
    document.querySelector('.no-emoji') ? document.querySelector('.no-emoji').remove() : true;
    let emojiContainerBox = document.createElement('div');
    emojiContainerBox.className = 'emoji-container__box';
    emojiContainerBox.innerHTML = emojis;
    document.querySelector('.emoji-container').appendChild(emojiContainerBox);
}

// show the following if there are no emojis
function noEmojis() {
    document.querySelector('.emoji-loading') ? document.querySelector('.emoji-loading').remove() : true;
    document.querySelector('.no-emoji') ? document.querySelector('.no-emoji').remove() : true;
    document.querySelector('.emoji-container__box') ? document.querySelector('.emoji-container__box').remove() : true;
    let noResults = document.createElement('div');
    noResults.className = 'no-emoji';
    noResults.innerHTML = `<span class='no-emoji__results'>🤷</span><br><span>No results</span>`;
    document.querySelector('.emoji-container').appendChild(noResults);
}

function makeActive(category) {
    active = category;
    for (let i = 0; i < categoryButtons.length; i++) {
        categoryButtons[i].style.color = '#9c9c9c';
    }
    document.querySelector(`#${category}`).style.color = '#000000';
}
