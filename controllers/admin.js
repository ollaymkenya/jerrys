// From node
const fs = require('fs');
const path = require('path');
const express = require("express");

// models
const Faq = require("../models/Faq");
const Sample = require("../models/Samples");
const User = require("../models/User");
const ParameterCategory = require("../models/ParameterCategory");
const Parameter = require("../models/Parameter");
const AccountType = require("../models/AccountType");
const Chatroom = require("../models/Chatroom");
const Project = require("../models/Project");
const stripe = require("stripe")("sk_test_51HgzMMJPyNo4yUQMT58hHpGHUVN8XPFYzZLsIXKYZpBzhmy1c8unL9a9JHMNy7tUOaNkmlAkHsgy6MsDA81cXIZE00S3ddcyAm");

// from 3rd party
const crypto = require("crypto");
const sendinBlue = require("nodemailer-sendinblue-transport");
const nodemailer = require('nodemailer');

var fonts = {
  Roboto: {
    normal: path.join(__dirname, '..', 'pdfmake', 'fonts', 'Roboto', 'Roboto-Regular.ttf'),
    bold: path.join(__dirname, '..', 'pdfmake', 'fonts', 'Roboto', 'Roboto-Medium.ttf'),
    italics: path.join(__dirname, '..', 'pdfmake', 'fonts', 'Roboto', 'Roboto-Italic.ttf'),
    boldItalics: path.join(__dirname, '..', 'pdfmake', 'fonts', 'Roboto', 'Roboto-MediumItalic.ttf')
  }
}
const pdfPrinter = require('pdfmake');
var printer = new pdfPrinter(fonts);

const transporter = nodemailer.createTransport({
  service: 'SendinBlue',
  auth: {
    user: 'jerrythewriterworks@gmail.com',
    pass: 'DzOHaZ6Ag3y7GtQn'
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
    .findOne({
      _id: paramid
    })
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
    .findOneAndDelete({
      _id: param
    })
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

exports.postDeletefaq = async (req, res, next) => {
  let faq = req.body.faqId;
  await Faq.findOneAndDelete({
    _id: faq
  })
  res.redirect('/content-faq')
};

exports.getAdminUsers = async (req, res, next) => {
  let users = await User.find().populate('accountType');
  let accounttypes = await AccountType.find();
  res.render("admin/content-users", {
    title: "Users",
    path: "/content-users",
    user: req.user,
    users,
    users,
    accounttypes
  });
};

exports.getAdminSample = async (req, res, next) => {
  Sample.find()
    .then((sampleList) => {
      //console.log(sampleList);
      res.render("admin/content-sample", {
        samples: sampleList,
        title: "sample",
        path: "/content-sample",
      });
    })
    .catch((err) => {
      console.log(err)
    });
};

exports.postAdminSample = (req, res, next) => {
  const resource = req.files[0];
  const sampleTitle = req.body.sampleTitle;
  const sampleCourse = req.body.sampleCourse;
  const numberofPages = req.body.samplepages;
  const fileLink = resource.filename;
  const extName = resource.originalname.split('.')[1];
  const sample = new Sample({
    fileLink,
    extName,
    sampleTitle,
    sampleCourse,
    numberofPages,
  });
  sample
    .save()
    .then((result) => {
      res.redirect("/content-sample");
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/content-sample");
    });
}

exports.postDeleteSample = async (req, res, next) => {
  try {
    let sample = req.body.sampleID;
    let file = req.body.fileLink;
    let pathOfSample = path.join(__dirname, '..', "paperDetails", file);
    fs.unlink(pathOfSample, err => console.log(err));
    await Sample.findOneAndDelete({
      _id: sample
    })
    res.redirect('/content-sample')
  } catch (error) {
    console.log(error);
  }
};

exports.postDeleteUser = (req, res, next) => {
  let userId = req.body.userId;
  User.findOneAndDelete({
    _id: userId
  })
    .then((user) => {
      Chatroom.findOneAndDelete({
        user2Id: req.body.userId
      })
        .then((result) => {
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
    User.findOne({
      email: user.email
    })
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
            from: "jerrythewriterworks@gmail.com",
            subject: "Create Account",
            html: `
                <h1>Click the link to create an account</h1>
                <p>You have been granted access to be an editor</p>
                <p>Click this <a href='https://www.jerrythewriter.com/signup/${token}'>link</a> to set a new password</p>
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
  const files = req.session.files;
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
    amount: ~~(totalPrice * 100),
    currency: "usd",
    receipt_email: req.user.email,
    metadata: {
      integration_check: 'accept_a_payment'
    }
  });

  res.render("auth/checkout", {
    title: "Checkout",
    path: "/checkout",
    paperIntel: paperIntel,
    paperDetails: paperDetails,
    paperDetailsPopulated: paperDetailsPopulated,
    totalPrice: totalPrice * 100,
    paper: JSON.stringify(paper),
    files: JSON.stringify(files),
    clientSecret: paymentIntent.client_secret,
    paymentIntent: paymentIntent
  });
}

exports.postCreatePaper = async (req, res) => {
  let orderNumber = await crypto.randomBytes(12);
  orderNumber = orderNumber.toString('hex');
  const paper = JSON.parse(req.body.data);
  const files = JSON.parse(req.body.files);
  let attachments;
  let date = `${new Date().getDate()}/ ${new Date().getMonth()} + 1/ ${new Date().getFullYear()}`
  // creating a new paper
  const project = new Project({
    typeOfPaper: paper.typeOfPaper,
    subject: paper.subject,
    topic: paper.topic,
    orderInstructions: paper.orderInstructions,
    style: paper.service,
    urgency: paper.urgency,
    numberOfSources: paper.nofSources,
    academicLevel: paper.academicLevel,
    numberOfPages: parseInt(paper.noOfPages),
    ownerId: req.user._id,
    orderNumber: orderNumber
  })

  // saving paper to db
  let projectResult = await project.save();

  res.redirect('/redirectToPaper');
  // creating the content of pdf document
  let projo = await Project.findById(projectResult.id).populate('typeOfPaper').populate('subject').populate('urgency').populate('academicLevel').populate('ownerId').exec();

  const documentDefination = {
    content: [{
      alignment: 'justify',
      columns: [{
        text: `${projo.topic}`
      },
      {
        text: `${date}`,
        style: 'noma'
      }
      ],
      style: 'header'
    },
    `Order Number: ${orderNumber}\n\n`,
    {
      style: 'tableExample',
      table: {
        alignment: 'justify',
        headerRows: 1,
        widths: [200, 200],
        body: [
          [{
            text: 'Paper Details',
            style: 'tableHeader',
            fillColor: '#eeffee'
          },
          {
            text: 'Values',
            style: 'tableHeader',
            fillColor: '#eeffee'
          }
          ],
          [{
            border: [false, false, false, true],
            text: 'Topic'
          },
          {
            border: [false, false, false, true],
            text: `${projo.topic}`
          }
          ],
          [{
            border: [false, false, false, true],
            text: 'Type Of Paper',
            fillColor: '#eeffee'
          },
          {
            border: [false, false, false, true],
            text: `${projo.typeOfPaper.name}`,
            fillColor: '#eeffee'
          }
          ],
          [{
            border: [false, false, false, true],
            text: 'Subject'
          },
          {
            border: [false, false, false, true],
            text: `${projo.subject.name}`
          }
          ],
          [{
            border: [false, false, false, true],
            text: 'Order Instructions',
            fillColor: '#eeffee'
          },
          {
            border: [false, false, false, true],
            text: `${projo.orderInstructions}`,
            fillColor: '#eeffee'
          }
          ],
          [{
            border: [false, false, false, true],
            text: 'Style'
          },
          {
            border: [false, false, false, true],
            text: `${projo.style}`
          }
          ],
          [{
            border: [false, false, false, true],
            text: 'Urgency',
            fillColor: '#eeffee'
          },
          {
            border: [false, false, false, true],
            text: `${projo.urgency.name}`,
            fillColor: '#eeffee'
          }
          ],
          [{
            border: [false, false, false, true],
            text: 'Number of sources'
          },
          {
            border: [false, false, false, true],
            text: `${projo.numberOfSources}`
          }
          ],
          [{
            border: [false, false, false, true],
            text: 'Academic Level',
            fillColor: '#eeffee'
          },
          {
            border: [false, false, false, true],
            text: `${projo.academicLevel.name}`,
            fillColor: '#eeffee'
          }
          ],
        ]
      },
      layout: 'lightHorizontalLines'
    }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      noma: {
        alignment: 'right'
      },
      tableExample: {
        margin: [0, 5, 0, 15]
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black'
      }
    }
  };

  const pdfDoc = await printer.createPdfKitDocument(documentDefination);
  pdfDoc.pipe(fs.createWriteStream(`${projo.id}.pdf`));
  pdfDoc.end();
  attachments = [
    {
      filename: 'document.pdf',
      path: path.join(__dirname, '..', `${projo.id}.pdf`)
    }
  ]
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    attachments.push(
      {
        filename: `${file.filename}`,
        path: `${file.path}`
      })
  }

  await transporter
    .sendMail({
      to: "smartwriterskenya@gmail.com",
      from: "jerrythewriterworks@gmail.com",
      attachments: attachments,
      subject: "New job!!!",
      html: `
              <h1>A new project from ${projo.ownerId.username}</h1>
              <p>Attached is a file containing the details of the project attached by ${projo.ownerId.username}</p>
              `
    })
  await transporter
    .sendMail({
      to: projo.ownerId.email,
      from: "jerrythewriterworks@gmail.com",
      subject: `Hi ${projo.ownerId.username}`,
      html: `
              <h1>RE:JTW paper order submission</h1>
              <p>We've received your paper order and we're workin on it</p> 
              <p>Thankyou for choosing JTW</p> 
          `
    })
  console.log(`your email is:${projo.ownerId.email}`);
  for (let i = 0; i < attachments.length; i++) {
    fs.unlink(attachments[i].path, (err) => {
      console.log(err);
    })
  }
}

exports.getRedirectToPaper = async (req, res, next) => {
  let user = req.user;
  res.render("admin/redirectToPaper", {
    title: "redirect",
    path: "/redirect",
    user
  })
}

exports.postSubmitWork = async (req, res, next) => {
  // declare variables
  let projectId = req.body.projectId;
  let workLink = req.body.work;
  let projectTopic;
  let userId;
  let toEmail;
  // edit the project in the database

  // If project link is blank
  if (!workLink || workLink === '') {
    return res.redirect('/projects');
  }

  let project = await Project.findById(projectId);
  projectTopic = project.topic;
  userId = project.ownerId;
  let completed = {
    value: true,
    date: JSON.stringify(new Date())
  }
  project.completed = completed;
  project.assignmentWork = workLink;
  await project.save();
  // send the user an email that their projo is complete
  let user = await User.findById(userId);
  toEmail = user.email;
  transporter
    .sendMail({
      to: toEmail,
      from: "jerrythewriterworks@gmail.com",
      subject: "Your job is complete!!!",
      html: `
              <h1>Your project titled '${projectTopic}' is complete</h1>
              <p>Click this <a href="${workLink}">link</a> to access It</p>
              `
    })
  //redirect the editor successfully
  console.log(req.body);
  res.redirect('/projects');
}

exports.postEditWork = async (req, res, next) => {
  // declare variables
  let projectId = req.params.projectId;
  let workLink = req.body.work;
  let projectTopic;
  let userId;
  let toEmail;
  let completed;

  // edit the project in the database
  let project = await Project.findById(projectId);

  // If project link is blank
  if (!workLink || workLink === '') {
    completed = {
      value: null,
      date: null
    }
    project.completed = completed;
    project.assignmentWork = null;
    await project.save();
    return res.redirect('/projects');
  }
  // If project link contains some changes
  else if (wordLink && wordLink !== project.assignmentWork) {
    projectTopic = project.topic;
    userId = project.ownerId;
    completed = {
      value: true,
      date: JSON.stringify(new Date())
    }
    project.completed = completed;
    project.assignmentWork = workLink;
    await project.save();
    // send the user an email that their projo is completed once more
    let user = await User.findById(userId);
    toEmail = user.email;
    transporter
      .sendMail({
        to: toEmail,
        from: "jerrythewriterworks@gmail.com",
        subject: "Some changes to your job submission",
        html: `
              <h1>Your project titled '${projectTopic}' has been changed</h1>
              <p>Click this <a href="${workLink}">link</a> to access It</p>
              `
      })
    //redirect the editor successfully
    console.log(req.body);
    return res.redirect('/projects');
  }
  else {
    return res.redirect('/projects');
  }
}