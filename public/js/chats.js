let form = document.querySelector('.input-message');
let message = document.querySelector("#message");
let fakeMessage = document.querySelector('.editableDiv');
const messageList = document.querySelector('.messages-list');
let username = document.querySelector('input[name="username"]');
let otherUser = document.querySelector('input[name="otherUserName"]');

let socket = io();

form.addEventListener('submit', (e) => {
    e.preventDefault();
    socket.emit('new message', message.value);
    message.value = '';
    fakeMessage.innerText = '';
    return false;
});

socket.on("message back", (msg) => {
    let li = document.createElement('li');
    li.className = 'message-item message-home';
    let p = document.createElement('p');
    p.innerText = msg;
    let span = document.createElement('span');
    span.innerText = '7:00 pm';
    li.appendChild(p);
    li.appendChild(span);
    messageList.appendChild(li);
    console.log(msg);
    chatLengthMode();
})