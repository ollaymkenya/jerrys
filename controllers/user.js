const User = require('../models/User');

const crypto = require('crypto');

exports.getDashboard = (req, res, next) => {
    const user = req.user;
    console.log(user);
    res.render('user/dashboard', {
        title: 'My dashboard',
        path: '/dashboard',
        user: user
    });
}

exports.getDashboardChat = (req, res, next) => {
    const user = req.user;
    const userRooms = user.chatRooms.rooms;
    res.render('user/chat', {
        title: 'Chat',
        path: '/dash/chat',
        user: user
    });
}

exports.getDashboardChatRoom = async (req, res, next) => {
    const user = req.user;
    const userRoom = req.params.chatRoom;
    const room = await user.chatRooms.rooms.find(room => room.name === userRoom);
    // const iv = crypto.createHash('sha256').update(`${room.users[0]}${room.users[1]}`).digest('hex');
    // const secret_room = userRoom;
    // const key = 'jerrythewritermadememakehissite!!';
    // const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    // const cipheredRoom = cipher.update(secret_room, 'utf8', 'hex');
    // cipheredRoom += cipher.final('hex');
    res.render('user/chat', {
        title: 'Chat',
        path: '/dash/chatRoom',
        user,
        userRoom,
        room
    });
}

exports.getDashboardNewProjects = (req, res, next) => {
    const user = req.user;
    res.render('user/new-project', {
        title: 'Projects',
        path: '/projects-newProject',
        user: user
    });
}

exports.getProjects = (req, res, next) => {
    const user = req.user;
    res.render('user/projects', {
        title: 'Projects',
        path: '/projects',
        user: user
    });
}

exports.getProject = (req, res, next) => {
    const user = req.user;
    res.render('user/project', {
        title: 'Projects',
        path: '/projects',
        user: user
    });
}

exports.getDashboardTestimonials = (req, res, next) => {
    const user = req.user;
    res.render('user/content-testimonials', {
        title: 'Content',
        path: '/dash/content-testimonials',
        user: user
    });
}