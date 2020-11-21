const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const multer = require('multer');
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const { formatMessage, saveMsg } = require("./utils/messages");

const MONGODB_URI = "mongodb+srv://muriithi:olimkenya@cluster0.uhrmt.mongodb.net/jtw";
// const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'paperDetails')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.parse(new Date())}-${file.originalname}`);
  }
})

const fileFilter = (req, file, callb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/vnd.ms-powerpoint' || file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    callb(null, true)
  } else {
    callb(null, false)
  }
}

app.set("views", "./views");
app.set("view engine", "ejs");

const siteRoutes = require("./routes/site");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const webhookRoutes = require("./routes/webhook");
const errorRoutes = require("./routes/error");
const User = require("./models/User");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage:storage, fileFilter: fileFilter }).array('selectfile', 12));
const csrfProtection = csrf();

app.use(express.static(path.join(__dirname, "views")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "paperDetails")));

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
  }
  else {
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
    console.log();
    next();
  }
  else {
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
  const { items } = req.body;
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
    http.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
  });
