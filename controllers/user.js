const Project = require("../models/Project");
const Messages = require("../models/Messages");
const Testimonial = require("../models/Testimonial");
const Chatroom = require("../models/Chatroom");
const User = require("../models/User");
const Online = require("../models/Online");

const dayjs = require('dayjs');
const LocalizedFormat = require("../node_modules/dayjs/plugin/localizedFormat");
dayjs.extend(LocalizedFormat);

exports.getDashboard = (req, res, next) => {
    const user = req.user;
    let projects;
    console.log(user);
    Project
        .find({
            ownerId: user.id
        })
        .then((project) => {
            return project;
        })
        .then((result) => {
            projects = result;
            let review = 0;
            for (let i = 0; i < projects.length; i++) {
                review += projects[i].Review;
            }
            review = review / projects.length;
            if (isNaN(review)) {
                review = 0
            }
            res.render("user/dashboard", {
                title: "My dashboard",
                path: "/dashboard",
                user: user,
                projects: projects.length,
                review: review
            });
        })
};

exports.getDashboardChat = (req, res, next) => {
    const user = req.user;
    let contacts = [];
    let contactsid;
    Chatroom
        .find()
        .then(async (chatrooms) => {
            for (let i = 0; i < chatrooms.length; i++) {
                if (`${req.user.id}` !== `${chatrooms[i].userId}`) {
                    contactsid = chatrooms[i].userId;
                } else {
                    contactsid = chatrooms[i].user2Id;
                }
                const user = await User.findById(contactsid);
                contacts.push(user);
            }
            res.render("user/chat", {
                title: "Chat",
                path: "/dash/chat",
                user: user,
                chatrooms,
                contacts
            });
        })
};

exports.getDashboardChatRoom = async (req, res, next) => {
    let attachment = req.session.ProjectAttachment || null;
    req.session.ProjectAttachment = null;
    let online = await Online.find();
    const user = req.user;
    let chatRoomId = req.params.chatRoom;
    let contacts = [];
    let contactsid;
    const userRoomId = req.params.chatRoom;
    const userRoom = await Chatroom.findById(userRoomId);
    let messages = await Messages.find({ chatRoom: chatRoomId });
    messages = await Promise.all(messages.map(async (message) => {
        message = await message.toObject();
        message.sentTimeDate = message.sentTime;
        message.receivedTimeDate = message.receivedTime;
        message.sentTime = dayjs(message.sentTime).format('LT');
        message.receivedTime = dayjs(message.receivedTime).format('LT');
        return message;
    }))
    let otherUser;
    Chatroom
        .find()
        .then(async (chatrooms) => {
            for (let i = 0; i < chatrooms.length; i++) {
                if (`${req.user.id}` !== `${chatrooms[i].userId}`) {
                    contactsid = chatrooms[i].userId;
                } else {
                    contactsid = chatrooms[i].user2Id;
                }
                const user = await User.findById(contactsid);
                contacts.push(user);
            }
            if (`${req.user.id}` === `${userRoom.userId}`) {
                otherUser = await User.findById(userRoom.user2Id);
            } else {
                otherUser = await User.findById(userRoom.userId);
            }

            res.render("user/chatuser", {
                title: "Chat",
                path: "/dash/chatRoom",
                user: user,
                chatrooms,
                contacts,
                userRoom,
                otherUser,
                userRoomId,
                chatRoomId,
                messages,
                online,
                attachment
            });
        })
};

exports.postMessage = (req, res, next) => {
    let chatRoom = req.params.chatRoom;
    res.redirect(`/chat/${chatRoom}`);
}

exports.getDashboardNewProjects = (req, res, next) => {
    const user = req.user;
    res.render("user/new-project", {
        title: "Projects",
        path: "/projects-newProject",
        user: user,
    });
};

exports.getProjects = async (req, res, next) => {
    const user = req.user;
    const projects = await Project
        .find()
        .populate('ownerId')
    for (let i = 0; i < projects.length; i++) {
        projects[i] = projects[i].toObject();
    }
    res.render("user/projects", {
        title: "Projects",
        path: "/projects",
        user: user,
        projects: projects
    });
    //console.log(user.username);
};

exports.getProject = (req, res, next) => {
    const user = req.user;
    res.render("user/project", {
        title: "Projects",
        path: "/projects",
        user: user,
    });
};

exports.getDashboardTestimonials = async (req, res, next) => {
    const user = req.user;
    let testimonialz;
    if (user.accountType == '5f971a68421e6d53753718c5') {
        testimonialz = await Testimonial.find().populate('owner')
    } else {
        testimonialz = await Testimonial.find({
            owner: user.id
        }).populate('owner')
    }
    res.render("user/content-testimonials", {
        title: "Content",
        path: "/content-testimonials",
        user: user,
        testimonials: testimonialz
    });
};

exports.postAddTestimonail = (req, res, next) => {
    const user = req.user;
    const testimonial = req.body.testimonial;
    const newTestimonial = new Testimonial({
        text: testimonial,
        owner: user.id,
    })
    newTestimonial
        .save()
        .then((result) => {
            res.redirect('/content-testimonials')
        });
};

exports.postPublishTestimonial = async (req, res, next) => {
    let publishedTestimonials = await Testimonial.find({
        published: true
    })
    let testimony = await Testimonial.findOne({
        _id: req.body.testimonialId
    })
    if (testimony.published === true) {
        testimony.published = false;
    } else {
        testimony.published = true;
    }
    await testimony.save();
    res.redirect('/content-testimonials');
};

exports.postDeleteTestimonial = (req, res, next) => {
    Testimonial
        .findByIdAndDelete(req.body.testimonialId)
        .then((result) => {
            res.redirect('/content-testimonials')
        })
};

exports.postProjectAttachment = async (req, res, next) => {
    try {
        req.session.ProjectAttachment = req.body;
        let user = await User.findById(req.body.loggedUserId).populate('accountType');
        let chatroom;
        if (user.accountType.name === "Editor" || user.accountType.name === "Client") {
            chatroom = await Chatroom.findOne({ $or: [{ userId: user.id }, { user2Id: user.id }] })
        } else {
            chatroom = await Chatroom.findOne({
                $and: [
                    { $or: [{ userId: user.id }, { user2Id: user.id }] },
                    { $or: [{ userId: req.body.loggedUserId }, { user2Id: req.body.loggedUserId }] }
                ]
            })
        }
        res.redirect(`/chat/${chatroom.id}`);
    } catch (error) {
        console.log(error);
    }
}