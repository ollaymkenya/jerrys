let form = document.querySelector('.input-message');
let message = document.querySelector("#message");
let fakeMessage = document.querySelector('.editableDiv');
const messageList = document.querySelector('.messages-list');
let userId = document.querySelector('input[name="user"]');
let otherUserId = document.querySelector('input[name="otherUser"]');
let username = document.querySelector('input[name="username"]');
let otherUserName = document.querySelector('input[name="otherUserName"]');
let chatRoomId = document.querySelector('input[name="chatRoomId"]');
let emojiBtn = document.querySelector('.emoji-btn');

let socket = io();
dayjs.extend(window.dayjs_plugin_localizedFormat)

socket.emit('joinRoom', {
    chatRoom: chatRoomId.value,
    user: userId.value
}, function(error = null, onlineStatus) {
    console.log(error);
    console.log(onlineStatus);
})

messageList.scrollTop = messageList.scrollHeight;

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let msg = {
        to: otherUserId.value,
        from: userId.value,
        message: message.value,
        chatRoom: chatRoomId.value,
        messageType: "5fc7fdc98142f5b0883eba55",
        sentTime: new Date()
    }
    socket.emit('new message', msg);
    message.value = '';
    fakeMessage.innerText = '';
    return false;
});

// adding a message to DOM
socket.on("message back", (msg) => {
    let isCurrent = isCurrentUser(msg.from);
    let li = document.createElement('li');
    let p = document.createElement('p');
    let span = document.createElement('span');
    p.innerText = msg.message;
    if (isCurrent) {
        li.className = 'message-item message-home';
        span.innerText = dayjs(new Date(msg.sentTime)).format('LT');
    } else {
        li.className = 'message-item message-away';
        span.innerText = dayjs(new Date(msg.receivedTime)).format('LT');
    }
    li.appendChild(p);
    li.appendChild(span);
    messageList.appendChild(li);
    messageList.scrollTop = messageList.scrollHeight;
    console.log(msg);
})

//get users who are online
socket.on("getOnline", (status) => {
    let span = document.createElement('span');
    span.className = `online-status ${status}`;
    span.innerHTML = status;
    document.querySelector('.user-messages__text').appendChild(span);
})

// making a user online
socket.on("online status", (status) => {
    let span = document.createElement('span');
    span.className = `online-status ${status}`;
    span.innerHTML = status;
    document.querySelector('.user-messages__text').appendChild(span);
})

function isCurrentUser(fromId) {
    console.log(fromId, userId);
    return JSON.stringify(fromId) === JSON.stringify(userId.value);
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
            if(!emojis) {
                return noEmojis();
            }
            displayEmojis(emojis);
        })
})

// onInput in the div.editableDiv
document.getElementById('editableDiv').addEventListener('input', () => {
    trueMessage();
});

// Function to put the message in the input hidden
function trueMessage() {
    document.getElementById('message').value = document.getElementById('editableDiv').innerText;
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
                        document.getElementById('editableDiv').innerText += e.target.innerText;
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
    console.log(`.${category}`);
    for (let i = 0; i < categoryButtons.length; i++) {
        categoryButtons[i].style.color = '#9c9c9c';
    }
    document.querySelector(`#${category}`).style.color = '#000000';
}