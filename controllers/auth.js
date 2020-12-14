const crypto = require("crypto");

const User = require("../models/User");
const Chatroom = require("../models/Chatroom");

const bcrypt = require("bcryptjs");
const sendinBlue = require("nodemailer-sendinblue-transport");
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport({
    service: 'SendinBlue',
    auth: {
        user: 'jerrythewriterworks@gmail.com',
        pass: 'DzOHaZ6Ag3y7GtQn'
    }
});

exports.getLogin = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render("auth/login", {
        title: "Login",
        path: "/login",
        errorMessage: message,
        validationErrors: [],
        oldSignupInput: {
            username: '',
            email: '',
            password: '',
        },
        oldLoginInput: {
            email: '',
            password: '',
        }
    });

};

exports.getSignup = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    const token = req.params.token;
    res.render("auth/signup", {
        title: "Sign Up",
        path: "/sign up",
        errorMessage: message,
        validationErrors: [],
        oldSignupInput: {
            username: '',
            email: '',
            password: '',
        },
        oldLoginInput: {
            email: '',
            password: '',
        },
        token,
    });

};

exports.postSignUp = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const token = req.body.token;
    const errors = validationResult(req);
    let newUser;
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render("auth/signup", {
            title: "Sign Up/Login",
            path: "/login",
            errorMessage: errors.array()[0].msg,
            oldSignupInput: {
                username: username,
                email: email,
                password: password,
            },
            validationErrors: errors.array()
        })
    }
    User
        .find({ addedUserToken: token, addedUserTokenExpiration: { $gt: Date.now() } })
        .then(uzer => {
            if (!uzer) {
                return res.redirect('/home');
            }
            else {
                bcrypt
                    .hash(password, 12)
                    .then((hashedPassword) => {
                        const user = new User({
                            username: username,
                            email: email,
                            password: hashedPassword,
                            accountType: '5f971aa4421e6d53753718c6'
                        });
                        return user.save()
                    })
                    .then((uzer) => {
                        let resetUser;
                        newUser = uzer
                        User
                            .findOne({ accountType: '5f971a68421e6d53753718c5' })
                            .then((user) => {
                                resetUser = user;
                                resetUser.addedUserToken = undefined;
                                resetUser.addedUserTokenExpiration = undefined;
                                resetUser.save();
                            })
                        return newUser;
                    })
                    .then((uzer) => {
                        User
                            .findOne({ accountType: '5f971a68421e6d53753718c5'})
                            .then((user) => {
                                const chatroom = new Chatroom({
                                    userId: user.id,
                                    user2Id: uzer._id
                                })
                                console.log(chatroom);
                                chatroom.save();
                                return;
                            })
                            .catch((err) => {
                                console.log(err);
                            })
                    })
                    .then((result) => {
                        res.redirect("/login");
                        return transporter
                            .sendMail({
                                to: email,
                                from: "jerrythewriterworks@gmail.com",
                                subject: "Signup succeeded",
                                html: "<h1>Welcome on board</h1>"
                            })
                            .catch((err) => {
                                console.log(err);
                            })
                    })
                    .catch((err) => {
                        res.redirect("/");
                        console.log(err);
                    });
            }
        })
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render("auth/login", {
            title: "Sign Up/Login",
            path: "/login",
            errorMessage: errors.array()[0].msg,
            oldLoginInput: {
                email: email,
                password: password,
            },
            oldSignupInput: {
                username: '',
                email: '',
                password: '',
            },
            validationErrors: errors.array()
        })
    }
    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                console.log("No user");
                return res.status(422).render("auth/login", {
                    title: "Sign Up/Login",
                    path: "/login",
                    errorMessage:result.message,
                    validationErrors: [],
                    oldSignupInput: {
                        username: '',
                        email: '',
                        password: '',
                    },
                    oldLoginInput: {
                        email: email,
                        password: password,
                    }
                });
            }
            bcrypt
                .compare(password, user.password)
                .then((doMatch) => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return res.redirect("/dashboard");
                    }
                    console.log(`${password} is wrong`);
                    return res.status(422).render("auth/login", {
                        title: "Sign Up/Login",
                        path: "/login",
                        errorMessage: 'Invalid email or password',
                        validationErrors: [],
                        oldSignupInput: {
                            username: '',
                            email: '',
                            password: '',
                        },
                        oldLoginInput: {
                            email: email,
                            password: password,
                        }
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect("/login");
                });
        })
        .catch((err) => {
            res.redirect("/");
            console.log(err);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.redirect("/login");
        }
        return res.redirect("/login");
    });
};

exports.getReset = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/reset", {
        title: "Reset Password",
        path: "/reset",
        errorMessage: message
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            console.log('Some err');
            return res.redirect("/reset");
        }
        const token = buffer.toString("hex");
        User.findOne({ email: req.body.email })
            .then((user) => {
                if (!user) {
                    req.flash("error", "No account with that email found.")
                    return res.redirect("/reset");
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then((result) => {
                res.redirect("/login");
                return transporter
                    .sendMail({
                        to: req.body.email,
                        from: "jerrythewriterworks@gmail.com",
                        subject: "Password reset",
                        html: `
                    <h1>Reset your Password</h1>
                    <p>You requested a password reset</p>
                    <p>Click this <a href='https://www.jerrythewriter.com/reset/${token}'>link</a> to set a new password</p>
                `
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/reset');
            });
    })
};

exports.getNewPassword = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    const token = req.params.token;
    User
        .findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then((user) => {
            res.render("auth/new-password", {
                path: '/new-password',
                title: "New Password",
                userId: user._id.toString(),
                passwordToken: token,
                errorMessage: message
            });
        })
        .catch((err) => {
            console.log(err);
        })
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", "Password must have a minimum length of 3 characters!");
        return res.status(422).redirect(`reset/${passwordToken}`)
    }
    let resetUser;
    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: {
            $gt: Date.now(),
        },
        _id: userId,
    })
        .then((user) => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then((hashedPassword) => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then((result) => {
            res.redirect("/login")
        })
        .catch((err) => {
            console.log(err);
        })
}
