const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const multer = require('multer');
const dotenv=require('dotenv')
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
dotenv.config();
const {
  accountType
} = require("./utils/auth");
const {
  formatMessage,
  saveMsg
} = require("./utils/messages");



const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const hostname = 'localhost';

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
const User = require("./models/User");

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(multer({
  storage: storage,
  fileFilter: fileFilter
}).array('selectfile', 12));
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

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  let accType = `${req.session.user.accountType}`
  res.locals.accountType = accountType(accType) || 'Site';
  next();
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
  console.log('a user connected');

  socket.on('new message', (message) => {
    io.emit('message back', message);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

mongoose
.connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then((result) => {
    http.listen(PORT, hostname);
  })
  .catch((err) => {
    console.log(err);
  });