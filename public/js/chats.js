// const message = document.getElementById('message'),
//     output = document.getElementById('output'),
//     userId = document.getElementById('userId'),
//     sendMessage = document.getElementById('sendMessage'),
//     userRoom = document.getElementById('userRoom');

// output.scrollTop = output.scrollHeight;

// const socket = io();

// //Join Chatroom
// socket.emit('joinRoom', {
//     userRoom: userRoom.value
// })

// sendMessage.addEventListener('click', (e) => {
//     e.preventDefault();

//     socket.emit('userMessage', {
//         ownerId: userId.value,
//         message: message.value
//     });

//     // Clear input
//     message.value = '';
//     message.focus();
// })

// socket.on('userMessage', (data) => {
//     const div = document.createElement('div');
//     if (userId.value !== data.ownerId) {
//         div.className = 'message-chat chat-away'
//     } else {
//         div.className = 'message-chat chat-home'
//     }
//     div.innerHTML = `
//     <p>${data.message}</p>
//     <small>${data.time}</small>
//     `;
//     output.appendChild(div);
//     output.scrollTop = output.scrollHeight;
// })