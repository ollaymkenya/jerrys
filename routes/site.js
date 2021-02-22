const express = require('express');
const router = express.Router();

const siteControllers = require('../controllers/site');

const { body, check } = require('express-validator');

router.get('/', siteControllers.getIndex);

router.get('/about', siteControllers.getAbout);

router.get('/contacts', siteControllers.getContacts);

router.post('/contacts', siteControllers.postContacts);

router.get('/samples', siteControllers.getSamples);

router.get('/faq/:searchQuery', siteControllers.getFAQ);

router.get('/sales', siteControllers.getSales);

router.get('/paper', siteControllers.getPaper);

router.post('/new-paper',[
    check('email')
        .isEmail()
        .withMessage("Please enter a valid email.")
        .normalizeEmail(),
    body('password', 'Your password should not be less than 3 characters')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(), 
]
, siteControllers.postNewPaper);

router.get('/books', siteControllers.getBooks);

router.get('/terms', siteControllers.getTerms);

router.get('/policy', siteControllers.getPolicy);

router.get('/guarantee', siteControllers.getGuarantee);

router.get('/attribution',siteControllers.getAttributions)

module.exports = router;