let socket = io();
let userId = document.querySelector('.userId');

socket.emit('joinChatSpace', userId.value, function(error = null, data) {
    console.log(error);
    console.log(data);
})