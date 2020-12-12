let socket = io();
let userId = document.querySelector('.userId');

socket.emit('joinChatSpace', userId.value, function (error = null, data) {
    let onlinePeople = data.peopleOnline;
    console.log(onlinePeople);
    let onlineStatus = document.querySelectorAll('.online-status');
    onlineStatus.forEach(onlineStat => {
        if (!onlinePeople.find(elem => elem.member === onlineStat.dataset.id)) {
            onlineStat.classList.add('offline');
            onlineStat.innerText = 'offline';
        } else {
            onlineStat.classList.add('online');
            onlineStat.innerText = 'online';
        }
    })
})

// checkoffline
socket.on("checkOffline", (bool) => {
    console.log(bool);
    socket.emit('confirmOnline', { userId: userId.value })
})