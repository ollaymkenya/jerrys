const User = require("../models/User");
const Chatroom = require("../models/Chatroom");
const bcrypt = require("bcryptjs");

const sendinBlue = require("nodemailer-sendinblue-transport");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'SendinBlue',
    auth: {
        user: 'olivermuriithi11@gmail.com',
        pass: '7qMB5hsJLbcXdYEK'
    }
});

async function validateUser(mode, email, password, confirmPassword = null) {
    let result;
    switch (mode) {
        case 'login':
            result = await validateLogin(email, password);
            break;
        case 'signup':
            result = await validateSignup(email, password, confirmPassword);
            console.log(result);
            break;
    }
    return new Promise((resolve, reject) => {
        resolve(result);
    });
}

function signUser(username, email, password, accountType, redirectPage, req, res) {
    let accType = accountTypeVerifier(accountType);
    new Promise(function (resolve, reject) {
        bcrypt
            .hash(password, 12)
            .then((hashedPassword) => {
                const user = new User({
                    username: username,
                    email: email,
                    password: hashedPassword,
                    accountType: accType
                });
                return user.save()
            })
            // return saved user
            .then((uzer) => {
                // create chatroom
                User
                    .findOne({ accountType: '5f971a68421e6d53753718c5'})
                    .then((user) => {
                        const chatroom = new Chatroom({
                            userId: user.id,
                            user2Id: uzer._id
                        })
                        chatroom.save();
                        req.session.isLoggedIn = true;
                        req.session.user = uzer;
                        console.log(req.session.user);
                        return res.redirect(redirectPage);
                    })
            })
            .then((result) => {
                return transporter
                    .sendMail({
                        to: email,
                        from: "olivermuriithi11@gmail.com",
                        subject: "Signup succeeded",
                        html: "<h1>Welcome on board</h1>"
                    })
            })
            .catch((err) => {
                console.log(err);
            });
    })
}

async function validateLogin(email, password) {
    let result;
    let user = await User.findOne({ email: email })
    if (!user) {
        result = {
            validated: false,
            message: 'Invalid email or password'
        }
        return result;
    }
    let doMatch = await bcrypt.compare(password, user.password)
    if (doMatch) {
        result = {
            validated: true,
            message: 'Validated!',
            user: user
        }
    } else {
        result = {
            validated: false,
            message: 'Invalid email or password'
        }
    }
    return result;
}

async function validateSignup(email, password, confirmPassword) {
    let result;
    if (password !== confirmPassword) {
        console.log(password, confirmPassword);
        result = {
            validated: false,
            message: 'Passwords do not match'
        }
        return result;
    }
    let user = await User.findOne({ email: email })
    if (user) {
        result = {
            validated: false,
            message: 'Email alredy exists'
        }
    } else {
        result = {
            validated: true,
            message: 'Sign up successful'
        }
    }
    return result;
}

function accountTypeVerifier(accountType) {
    let accountId;
    switch (accountType) {
        case 'client':
            accountId = '5f971ab4421e6d53753718c7';
            break;
        default:
            accountId = 'undefined';
            break;
    }
    return accountId;
}

// Authenticating admin

function accountType(id){
    let accountType;
  switch (id) {
      case "5f971a68421e6d53753718c5":
          accountType="Admin"
          break;
          case "5f971aa4421e6d53753718c6":
          accountType="Editor"
          break;
          case "5f971ab4421e6d53753718c7":
          accountType="Client"
          break;
      default:"null"
          break;
  }
  return accountType;
};

module.exports = {
    validateUser,
    signUser,
    accountType
}