const crypto = require("crypto");

const User = require("../models/User");

const bcrypt = require("bcryptjs");
const sendinBlue = require("nodemailer-sendinblue-transport");
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport({
    service: 'SendinBlue',
    auth: {
        user: 'olivermuriithi11@gmail.com',
        pass: '7qMB5hsJLbcXdYEK'
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
        }
    });

};

exports.postSignUp = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
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
    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
                username: username,
                email: email,
                chatRooms: {
                    rooms: [
                        {
                            name: `AdminOliverand${username}`,
                            users: ['olivermuriithi11@gmail.com', `${email}`],
                            messages: []
                        }
                    ]
                },
                password: hashedPassword,
            });
            return user.save()
                .then((result) => {
                    const messageRoom = result.chatRooms.rooms[0];
                    User
                        .findOne({ email: 'olivermuriithi11@gmail.com' })
                        .then((user) => {
                            return user.addToChatRooms(messageRoom)
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                })
        })
        .then((result) => {
            res.redirect("/login");
            return transporter
                .sendMail({
                    to: email,
                    from: "olivermuriithi11@gmail.com",
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
                        from: "olivermuriithi11@gmail.com",
                        subject: "Password reset",
                        html: `
                    <h1>Reset your Password</h1>
                    <p>You requested a password reset</p>
                    <p>Click this <a href='http://localhost:3000/reset/${token}'>link</a> to set a new password</p>
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

// bc55b71ec5a86f5239609b85d4406b64241bdbd630f1c74d0d6b881ced574423