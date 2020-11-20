const Faq = require("../models/Faq");
const Sample = require("../models/Samples");
const User = require("../models/User");
const ParameterCategory = require("../models/ParameterCategory");
const Parameter = require("../models/Parameter");
const AccountType = require("../models/AccountType");
const Chatroom = require("../models/Chatroom");
const Project = require("../models/Project");
const stripe = require("stripe")("sk_test_51HgzMMJPyNo4yUQMT58hHpGHUVN8XPFYzZLsIXKYZpBzhmy1c8unL9a9JHMNy7tUOaNkmlAkHsgy6MsDA81cXIZE00S3ddcyAm");

const crypto = require("crypto");
const sendinBlue = require("nodemailer-sendinblue-transport");
const nodemailer = require('nodemailer');
const pdfMake = require('../pdfmake/pdfmake');
const vsFonts = require('../pdfmake/vfs_fonts');
pdfMake.vfs = vsFonts.pdfMake.vfs;


const transporter = nodemailer.createTransport({
  service: 'SendinBlue',
  auth: {
    user: 'olivermuriithi11@gmail.com',
    pass: '7qMB5hsJLbcXdYEK'
  }
});

exports.getAdminNewParameter = (req, res, next) => {
  let paramCategories;
  ParameterCategory
    .find()
    .then((paramCats) => {
      paramCategories = paramCats
    })
    .then((result) => {
      Parameter
        .find()
        .then((params) => {
          res.render("admin/new-parameter", {
            title: "Projects",
            path: "/projects-newParameter",
            user: req.user,
            paramCategories,
            params
          })
        })
    })
};

exports.postAdminNewParameter = (req, res, next) => {
  const newParam = new Parameter({
    name: req.body.parameterName,
    category: req.body.parameterCategory,
    price: req.body.parameterPrice
  })
  newParam.save();
  res.redirect('/projects-newParameter');
};

exports.postEditParam = async (req, res, next) => {
  let paramid = req.body.paramId;
  let param;
  let name = req.body.paramName;
  let price = req.body.paramPrice;
  Parameter
    .findOne({ _id: paramid })
    .then((parameter) => {
      param = parameter;
      param.name = name;
      param.price = price;
      param.save();
      res.redirect('/projects-newParameter');
    })
};

exports.postDeleteParam = async (req, res, next) => {
  let param = req.body.paramId;
  await Parameter
    .findOneAndDelete({ _id: param })
  res.redirect('/projects-newParameter');
};

exports.getAdminFaq = (req, res, next) => {
  Faq.find()
    .then((faqList) => {
      res.render("admin/content-faq", {
        faqs: faqList,
        title: "Content Faq",
        path: "/content-faq",
        user: req.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAdminFaq = (req, res, next) => {
  const question = req.body.faqQuestion;
  const answer = req.body.faqAnswer;
  const faqCategory = req.body.faqCategory;
  const faq = new Faq({
    question: question,
    answer: answer,
    category: faqCategory,
  });
  faq
    .save()
    .then((result) => {
      res.redirect("/content-faq");
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/content-faq");
    });
};

exports.postDeletefaq = async (req,res,next) => {
 let faq = req.body.faqId;  
 await Faq.findOneAndDelete({_id: faq})
 res.redirect('/content-faq')
};

exports.getAdminUsers = async (req, res, next) => {
  let users = await User.find().populate('accountType');
  let accounttypes = await AccountType.find();
  res.render("admin/content-users", {
    title: "Users",
    path: "/content-users",
    user: req.user,
    users, users,
    accounttypes
  });
};

exports.getAdminSample=(req,res,next) => {
  Sample.find()
     .then((sampleList)=>{
      res.render("admin/content-sample",{
        samples:sampleList,
        title:"sample",
        path:"/content-sample",
      });
     })
     .catch((err)=>{
        console.log(err) 
     });
};

exports.postAdminSample=(req,res,next) =>{
  const sampleTitle = req.body.sampleTitle;
  const sampleCourse = req.body.sampleCourse;
  const numberofPages = req.body.samplepages;
  const sample = new Sample({
  sampleTitle,
  sampleCourse,
  numberofPages,
  });
 sample
    .save()
    .then((result) => {
      res.redirect("/content-sample");
      console.log(sample);
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/content-sample");
    });
}

exports.postDeleteSample = async (req,res,next) => {
  let   sample = req.body.sampleID;  
  await Sample.findOneAndDelete({_id: sample})
  res.redirect('/content-sample')
 };

exports.postDeleteUser = (req, res, next) => {
  let userId = req.body.userId;
  User.findOneAndDelete({ _id: userId })
    .then((user) => {
      Chatroom.findOneAndDelete({ user2Id: req.body.userId })
        .then((result) => {
          console.log(result);
          res.redirect('/content-users');
        })
    })
};

exports.postAddEditor = (req, res, next) => {
  const user = req.user;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      console.log('Some err');
      return res.redirect("/login");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: user.email })
      .then((uzer) => {
        if (!uzer) {
          req.flash("error", "No account with that email found.")
          return res.redirect("/login");
        }
        user.addedUserToken = token;
        user.addedUserTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/content-users");
        return transporter
          .sendMail({
            to: req.body.email,
            from: "olivermuriithi11@gmail.com",
            subject: "Create Account",
            html: `
                <h1>Click the link to create an account</h1>
                <p>You have been granted access to be an editor</p>
                <p>Click this <a href='http://localhost:3000/signup/${token}'>link</a> to set a new password</p>
            `
          })
          .catch((err) => {
            console.log(err);
          })
      })
      .catch((err) => {
        console.log(err);
        res.redirect('/content-users');
      });
  })
};

exports.getCheckout = async (req, res, next) => {
  // code for paper
  const paper = req.session.paper;
  console.log(paper);
  let parameters = await Parameter.find().populate('category');
  let paperInfo = [paper.typeOfPaper, paper.subject, paper.urgency, paper.academicLevel];
  for (let i = 0; i < paperInfo.length; i++) {
    paperInfo[i] = await Parameter.findById(paperInfo[i]).populate('category')
  }
  let paperDetails = [paper.nofSources, paper.noOfPages];
  let paperDetailsPopulated = [];
  for (let i = 0; i < parameters.length; i++) {
    if (parameters[i].category.name === 'static') {
      if (parameters[i].name === 'Number of pages') {
        parameters[i].price *= parseInt(paperDetails[1]);
      } else {
        parameters[i].price *= parseInt(paperDetails[0]);
      }
      paperDetailsPopulated.push(parameters[i]);
    }
  }
  // la formula
  let calculatedAdditions = paperInfo[1].price + paperInfo[2].price + paperInfo[3].price;
  let totalPrice = Math.round(paperInfo[0].price * paperDetailsPopulated[1].price * calculatedAdditions * 100) / 100 + parseFloat(paperDetailsPopulated[0].price);
  let paperIntel = paperInfo.concat(paperDetailsPopulated);

  // stripe
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalPrice * 100,
    currency: "usd",
    receipt_email: req.user.email,
    metadata: { integration_check: 'accept_a_payment' }
  });

  res.render("auth/checkout", {
    title: "Checkout",
    path: "/checkout",
    paperIntel: paperIntel,
    paperDetails: paperDetails,
    paperDetailsPopulated: paperDetailsPopulated,
    totalPrice: totalPrice * 100,
    paper: JSON.stringify(paper),
    clientSecret: paymentIntent.client_secret,
    paymentIntent: paymentIntent
  });
}

exports.postCreatePaper = (req, res) => {
  const paper = req.body;
  console.log(paper);
  const project = new Project({
    typeOfPaper: paper.typeOfPaper,
    subject: paper.subject,
    topic: paper.topic,
    orderInstructions: 'hello',
    style: paper.service,
    urgency: paper.urgency,
    numberOfSources: paper.nofSources,
    academicLevel: paper.academicLevel,
    numberOfPages: parseInt(paper.noOfPages),
    ownerId: req.user._id
  })
  project.save();

  res.redirect('/projects');
}