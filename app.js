const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const multer = require('multer');
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const MONGODB_URI = "mongodb+srv://muriithi:V88ezWCkLrypqmR@cluster0.uhrmt.mongodb.net/jtw?retryWrites=true&w=majority";
// const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
})

app.set("views", "./views");
app.set("view engine", "ejs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'paperDetails');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.parse(new Date())}-${file.originalname}`);
  }
})

const fileFilter = (req, file, callb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/vnd.ms-powerpoint' || file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    return callb(null, true)
  } else {
    callb(null, false);
  }
}

const siteRoutes = require("./routes/site");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const webhookRoutes = require("./routes/webhook");
const errorRoutes = require("./routes/error");
const messages = require("./messages/messages");
const User = require("./models/User");
const { table } = require("console");
const Chatroom = require("./models/Chatroom");
const Messages = require("./models/Messages");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: storage, fileFilter: fileFilter }).array('selectfile', 12));
const csrfProtection = csrf();

app.use(express.static(path.join(__dirname, "views")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "paperDetails")));
app.use(express.static(path.join(__dirname, "sampledetails")));

const PORT = process.env.PORT || 3000;

const {
  NODE_ENV = "development",
  SESS_SECRET = "jtwisawesome",
  SESS_LIFETIME = 1000 * 60 * 60 * 24 * 7,
} = process.env;

const IN_PROD = NODE_ENV === "production";

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
      maxAge: SESS_LIFETIME,
      sameSite: true, // 'strict']
      secure: false,
    },
    store: store,
  })
);

// siteRoutes.use(csrfProtection);
// authRoutes.use(csrfProtection);
// userRoutes.use(csrfProtection);
// adminRoutes.use(csrfProtection);
const csrfExclusion = ['/webhooks/stripe'];
app.use(function (req, res, next) {
  if (csrfExclusion.indexOf(req.path) !== -1) {
    next();
  } else {
    csrfProtection(req, res, next);
  }
});

app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  if (csrfExclusion.indexOf(req.path) !== -1) {
    next();
  } else {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    res.locals.paper = req.session.paper;
    next();
  }
});

app.use(siteRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use(webhookRoutes);

app.post("/create-payment-intent", async (req, res) => {
  const {
    items
  } = req.body;
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd"
  });
  res.send({
    clientSecret: paymentIntent.client_secret
  });
});

// catching 404 errors
app.use(errorRoutes);

io.on('connection', (socket) => {
  console.log('new user into room');
  socket.on('announceOnline', async (userDetails) => {
    //adding user to online model in database
    let chatspace = await messages.addToChatSpace(userDetails.userId, socket.id);
    // updating a user's location
    let newDate = new Date();
    // update the time difference of the user online with the server
    await messages.upDateTimeDifference(newDate, new Date(userDetails.userTime), userDetails.userId);
    // making messages read
    let newMessages = await Messages.find({ $and: [{ toId: userDetails.userId }, { receipt: 'sent' }] });
    messages.editMessage(newMessages, 'received');
    // emitting to everyone that a user has joined
    socket.broadcast.emit('addOnline', { chatspace });
  })

  socket.on('joinRoom', async (chatRoomInfo) => {
    console.log(chatRoomInfo);
    // join the user to the chatroom
    socket.join(chatRoomInfo.chatRoom);
    let oldChat = await Messages.findOne({ $and: [{ chatRoom: chatRoomInfo.chatRoom }, { toId: chatRoomInfo.user }] });
    console.log(chatRoomInfo);
    console.log(oldChat);
    // if it's a new chatroom send them a message from bot
    if (!oldChat) {
      let chatBotMessage = `This is the begining of your conversation with ${chatRoomInfo.otherUserName}. Chats are currently not end to end encrypted.`;
      //creating the message
      let message = {
        toId: chatRoomInfo.user,
        fromId: '5fd38c93e2ea8eafb0f382ea',
        message: chatBotMessage,
        chatRoom: chatRoomInfo.chatRoom,
        messageType: '5fd1ba13e2ea8eafb0f382e8',
        sentTime: new Date(),
      }
      // save message to the database
      let savedMessage = await new Promise((resolve, reject) => {
        resolve(messages.saveMessage(message));
      })
      // send message to the client side
      io.to(chatRoomInfo.chatRoom).emit("message", savedMessage);
    }
    let newMessages = await new Promise(async (resolve, reject) => {
      resolve(await Messages.find({ $and: [{ chatRoom: chatRoomInfo.chatRoom }, { fromId: chatRoomInfo.user }, { "receipt": { $in: ['sent', 'received'] } }] }));
    })
    console.log("newones", newMessages);
    messages.editMessage(newMessages, 'read');
    io.to(chatRoomInfo.chatRoom).emit('read-receipt', chatRoomInfo.user);
  })

  // typing functionality
  socket.on('typing', (userId, chatRoom) => {
    socket.to(chatRoom).emit('typing', userId);
  })

  socket.on('stop typing', (userId, chatRoom) => {
    socket.to(chatRoom).emit('stop typing', userId);
  })

  socket.on('new message', async (message) => {
    let savedMessage = await new Promise((resolve, reject) => {
      resolve(messages.saveMessage(message));
    })
    io.to(message.chatRoom).emit("message", savedMessage);
  })

  socket.on('read-receipt', async (readMessage) => {
    let message = await Messages.find({ _id: readMessage.messageId })
    messages.editMessage(message, 'read');
    io.to(readMessage.chatRoom).emit('make-read', readMessage.messageId, readMessage.userId);
  })

  socket.on('disconnect', async () => {
    console.log(socket.id);
    // remove the person from online model database
    let promise = await new Promise((resolve, reject) => {
      resolve(messages.RemoveFromChatSpace(socket.id));
    })
    // emit to everyone that a user has left
    io.emit('announceOffline', promise)
  })
});

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    http.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
  });