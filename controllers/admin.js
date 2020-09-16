const Faq = require('../models/faq');

exports.getAdminNewParameter = (req, res, next) => {
    res.render('admin/new-parameter', {
        title: 'Projects',
        path: '/projects-newParameter',
        user: req.user
    });
}

exports.getAdminFaq = (req, res, next) => {
    Faq.find()
        .then((faqList) => {
            res.render('admin/content-faq', {
                faqs: faqList,
                title: 'Content Faq',
                path: '/dash/content-faq',
                user: req.user
            });
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.postAdminFaq = (req, res, next) => {
    const question = req.body.question;
    const answer = req.body.answer;
    const faqCategory = req.body.faqCategory;
    const faq = new Faq({
        question: question,
        answer: answer,
        category: faqCategory,
    });
    faq
        .save()
        .then((result) => {
            // console.log('FAQ created');
            // console.log(result);
            res.redirect('/content-faq');
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/content-faq');
        })
}