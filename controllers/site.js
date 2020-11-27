const Parameter = require("../models/Parameter");
const Faq = require("../models/Faq");
const Sample = require("../models/Samples");
const testimonialUtils = require('../utils/testmonials');
const { validateUser, signUser } = require("../utils/auth");

const Testimonial = require("../models/Testimonial");

const {
    validationResult
} = require('express-validator');
const stripe = require("stripe")("sk_test_51HgzMMJPyNo4yUQMT58hHpGHUVN8XPFYzZLsIXKYZpBzhmy1c8unL9a9JHMNy7tUOaNkmlAkHsgy6MsDA81cXIZE00S3ddcyAm");

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

exports.getAbout = async (req, res, next) => {
    testimonialUtils.publishTestimonial();
    let testimonials = await Testimonial.find({
        published: true
    }).populate('owner');
    res.render('site/about', {
        title: 'About Me',
        path: '/about',
        testimonials: testimonials
    });
}

exports.getContacts = (req, res, next) => {
    res.render('site/contacts', {
        title: 'Contact Me',
        path: '/contacts',
        errorMessage: ''
    });
}

exports.postContacts = (req, res, next) => {
    console.log(req.body);
    let email = req.body.email;
    let question = req.body.question;
    let questionContent = req.body.questionContent;
    if (!email || !question || !questionContent) {
        return res.status(422).render('site/contacts', {
            title: 'Contact Me',
            path: '/contacts',
            errorMessage: "Please fill all the fields"
        });
    }
    transporter
        .sendMail({
            to: 'ireneruos@gmail.com',
            from: "olivermuriithi11@gmail.com",
            subject: `An email from ${req.body.email}`,
            html: `
                    <h1>Question: ${req.body.question}</h1>
                    <p>Question content: ${req.body.questionContent}</p>
                    <br>
                    <br>
                    <small><i>This is an email sent from JTW's contacts page</i></small>
                `
        })
    res.redirect('/contacts');
}

exports.getSamples = async (req, res, next) => {
    let testimonials = await Testimonial.find({
        published: true
    }).populate('owner');
    console.log(testimonials);
    Sample.find()
        .then((sampleList) => {
            res.render("site/samples", {
                samples: sampleList,
                title: "Samples",
                path: "/samples",
                testimonials: testimonials
            });
        })
        .catch((err) => {
            console.log(err)
        });
}


exports.getFAQ = (req, res, next) => {
    let searchQuery = req.params.searchQuery === 'null' ? '' : req.params.searchQuery;
    console.log(searchQuery);
    Faq.find()
        .then((faqList) => {
            //console.log(faqList);
            res.render('site/faq', {
                faqs: faqList,
                title: 'F.A.Q',
                path: '/faq',
                searchQuery: searchQuery
            });

        })
        .catch((err) => {
            console.log(err);
        });

};

exports.getSales = async (req, res, next) => {
    let testimonials = await Testimonial.find({
        published: true
    }).populate('owner');
    res.render('site/sales', {
        title: 'Write My Paper',
        path: '/sales',
        testimonials: testimonials
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
                errorMessage: '',
            });
        })
}

exports.postNewPaper = async (req, res, next) => {
    const resources = req.files;
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
        req.session.files = resources;
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
        req.session.files = resources;
    } else {
        try {
            req.session.paper = paper;
            req.session.files = resources;
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
