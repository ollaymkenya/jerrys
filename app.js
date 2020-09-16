const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const { formatMessage, saveMsg } = require("./utils/messages");

const MONGODB_URI =
  "mongodb+srv://muriithi:olimkenya@cluster0.uhrmt.mongodb.net/jtw";

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

app.set("views", "./views");
app.set("view engine", "ejs");

const siteRoutes = require("./routes/site");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const errorRoutes = require("./routes/error");
const User = require("./models/User");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "views")));
app.use(express.static(path.join(__dirname, "public")));

const {
  PORT = 3000,
  NODE_ENV = "development",
  SESS_SECRET = "jtwisawesome",
  SESS_LIFETIME = 1000 * 60 * 60 * 2,
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
      secure: IN_PROD,
    },
    store: store,
  })
);

app.use(csrfProtection);
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
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(siteRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(adminRoutes);

// catching 404 errors
app.use(errorRoutes);

io.on("connection", (socket) => {
  socket.on('joinRoom', ({ userRoom }) => {
    socket.join(userRoom);
    //Listen for chat messages
    socket.on("userMessage", (data) => {
      io.to(userRoom).emit("userMessage", formatMessage(data.ownerId, data.message));
      saveMsg(data.ownerId, data.message, userRoom);
    });
  });
});

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then((result) => {
    http.listen(PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
