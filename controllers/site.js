const Parameter = require("../models/Parameter");
const User = require("../models/User");
const Chatroom = require("../models/Chatroom");
const Faq = require("../models/Faq");
const Sample = require("../models/Samples");
const { validateUser, signUser } = require("../utils/auth");
const sendinBlue = require("nodemailer-sendinblue-transport");
const nodemailer = require('nodemailer');

const { validationResult } = require('express-validator');
const { getMaxListeners } = require("../models/Faq");
const stripe = require("stripe")("sk_test_51HgzMMJPyNo4yUQMT58hHpGHUVN8XPFYzZLsIXKYZpBzhmy1c8unL9a9JHMNy7tUOaNkmlAkHsgy6MsDA81cXIZE00S3ddcyAm");

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

exports.postContacts =(req,res,next) =>{
    transporter
    .sendMail({
      to: "jerrymuthomi@gmail.com",
      from: req.body.email,
      subject: req.body.question,
      html: req.body.questionContent,
      
    })
res.redirect("/contacts")

console.log(req.body);
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
    const resources = req.files;
    console.log(resources);
    console.log('hello');
    let user;
    const checkedSwitcher = req.body.checkedSwitcher;
    const errors = validationResult(req);
    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;
    const signemail = req.body.signemail;
    const signpassword = req.body.signpassword;
    const confirmPassword = req.body.confirmPassword;
    let parameters = await Parameter.find().populate('category');
    let mode;
    let paper = req.body;

    if (checkedSwitcher === 'on') {
        mode = 'login';
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
        let result = await validateUser(mode, email, password)
        if (!result.validated) {
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: result.message,
                validationErrors: [],
                oldLoginInput: {
                    email: email,
                    password: password
                },
                parameters,
                user
            });
        }
        req.user = result.user;
        req.session.isLoggedIn = true;
        req.session.user = result.user;
        req.session.paper = paper;
        return res.redirect('/checkout');
    } else if (!checkedSwitcher || checkedSwitcher === '') {
        mode = 'signup';
        let accountType = 'client';
        let redirectPage = '/checkout';
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
        let result = await validateUser(mode, signemail, signpassword, confirmPassword)
        if (!result.validated) {
            return res.status(422).render("site/paper", {
                title: "Paper",
                path: "/paper",
                errorMessage: result.message,
                oldSignupInput: {
                    username: username,
                    email: signemail,
                    password: signpassword,
                },
                validationErrors: errors.array,
                parameters,
                user
            })
        }
        signUser(username, signemail, signpassword, accountType, redirectPage, req, res);
        req.session.paper = paper;
    } else {
        try {
            req.session.paper = paper;
            res.redirect("/checkout");
        } catch (error) {
            // console.log(error);
        }
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
exports.getConnect = (req, res, next) => {
    res.render('site/connect', {
        title: 'connect',
        path: '/connect'
    });
}