const Parameter = require("../models/Parameter");
const User = require("../models/User");
const Chatroom = require("../models/Chatroom");
const Faq = require("../models/Faq");
const Sample = require("../models/Samples");


const bcrypt = require("bcryptjs");
const { validationResult } = require('express-validator');

const sendinBlue = require("nodemailer-sendinblue-transport");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'SendinBlue',
    auth: {
        user: 'olivermuriithi11@gmail.com',
        pass: '7qMB5hsJLbcXdYEK'
    }
});

exports.getIndex = (req, res, next) => {
    res.render('site/index', {
        title: 'JTT',
        path: '/'
    });
}

exports.getAbout = (req, res, next) => {
    res.render('site/about', {
        title: 'About Me',
        path: '/about'
    });
}

exports.getContacts = (req, res, next) => {
    res.render('site/contacts', {
        title: 'Contact Me',
        path: '/contacts'
    });
}

exports.getSamples = (req, res, next) => {
        Sample.find()
        .then((sampleList)=>{
         res.render("site/samples",{
           samples:sampleList,
           title:"Samples",
           path:"/samples",
         });
        })
        .catch((err)=>{
           console.log(err) 
        });
    }


exports.getFAQ = (req, res, next) => {
    Faq.find()
    .then((faqList) => {
console.log(faqList);
        res.render('site/faq', {
         
            faqs:faqList,
            title: 'F.A.Q',
            path: '/faq'
    });
  
})
    .catch((err) => {
        console.log(err);
    });
   
};



exports.getSales = (req, res, next) => {
    res.render('site/sales', {
        title: 'Write My Paper',
        path: '/sales'
    });
}

exports.getPaper = (req, res, next) => {
    const user = req.user;
    Parameter
        .find()
        .populate('category')
        .then((parameters) => {
            res.render('site/paper', {
                title: 'Write My Paper',
                path: '/paper',
                parameters: parameters,
                user: user,
                errorMessage: ''
            });
        })
}

exports.postNewPaper = async (req, res, next) => {
    const user = req.user;
    const checkedSwitcher = req.body.checkedSwitcher;
    let parameters = await Parameter.find().populate('category');
    if (checkedSwitcher === 'on') {
        const email = req.body.email;
        const password = req.body.password;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: errors.array()[0].msg,
                oldLoginInput: {
                    email: email,
                    password: password,
                },
                validationErrors: errors.array(),
                parameters,
                user
            })
        }
        User.findOne({ email: email })
            .then((user) => {
                if (!user) {
                    console.log("No user");
                    return res.status(422).render("site/paper", {
                        title: "Paper",
                        path: "/paper",
                        errorMessage: 'Invalid email or password',
                        validationErrors: [],
                        oldLoginInput: {
                            email: email,
                            password: password,
                            parameters,
                            user
                        }
                    });
                }
                bcrypt
                    .compare(password, user.password)
                    .then((doMatch) => {
                        if (doMatch) {
                            req.session.isLoggedIn = true;
                            req.session.user = user;
                            req.session.paper = req.body;
                            return res.redirect('/checkout')
                        }
                        console.log(`${password} is wrong`);
                        return res.status(422).render("auth/login", {
                            title: "Sign Up/Login",
                            path: "/login",
                            errorMessage: 'Invalid email or password',
                            validationErrors: [],
                            oldLoginInput: {
                                email: email,
                                password: password,
                                parameters,
                                user
                            }
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect("/");
                    });
            })
            .catch((err) => {
                res.redirect("/");
                console.log(err);
            });
    } else if (!checkedSwitcher && checkedSwitcher !== '') {
        const username = req.body.username;
        const email = req.body.signemail;
        const password = req.body.signpassword;
        const confirmPassword = req.body.confirmPassword;
        const errors = validationResult(req);
        // If any errors redirect back to paper page
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: errors.array()[0].msg,
                oldSignupInput: {
                    username: username,
                    email: email,
                    password: password,
                },
                validationErrors: errors.array(),
                parameters,
                user
            })
        }
        // If passwords dont match redirect back to paper page
        if (password !== confirmPassword) {
            console.log(errors.array());
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: "Passwords don't match",
                oldSignupInput: {
                    username: username,
                    email: email,
                    password: password,
                },
                validationErrors: errors.array,
                parameters,
                user
            })
        }
        // Encrypt password
        bcrypt
            .hash(password, 12)
            .then((hashedPassword) => {
                const user = new User({
                    username: username,
                    email: email,
                    password: hashedPassword,
                    accountType: '5f971ab4421e6d53753718c7'
                });
                return user.save()
            })
            // return saved user
            .then((uzer) => {
                // create chatroom
                User
                    .findOne({ accountType: '5f971a68421e6d53753718c5' })
                    .then((user) => {
                        const chatroom = new Chatroom({
                            userId: user.id,
                            user2Id: uzer._id
                        })
                        chatroom.save();
                        req.session.isLoggedIn = true;
                        req.session.user = uzer;
                        console.log(req.session.user);
                        req.session.paper = req.body;
                        return res.redirect("/checkout");
                    })
                    .catch((err) => {
                        console.log(err);
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
                    .catch((err) => {
                        res.redirect("/");
                        console.log(err);
                    })
            })
            .catch((err) => {
                res.redirect("/");
                console.log(err);
            });
    } else {
        req.session.paper = req.body;
        res.redirect("/checkout");
    }
}

exports.getBooks = (req, res, next) => {
    res.render('site/books', {
        title: 'Guide Books',
        path: '/books'
    });
}

exports.getTerms = (req, res, next) => {
    res.render('site/terms', {
        title: 'Terms and Conditions',
        path: '/terms'
    });
}

exports.getPolicy = (req, res, next) => {
    res.render('site/policy', {
        title: 'Privacy Policy',
        path: '/policy'
    });
}

exports.getGuarantee = (req, res, next) => {
    res.render('site/guarantee', {
        title: 'MoneyBack guarantee',
        path: '/guarantee'
    });
}