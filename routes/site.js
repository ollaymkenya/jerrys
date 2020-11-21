const express = require('express');
const router = express.Router();

const User = require('../models/User');

const siteControllers = require('../controllers/site');
const { body, check } = require('express-validator');

router.get('/', siteControllers.getIndex);

router.get('/about', siteControllers.getAbout);

router.get('/contacts', siteControllers.getContacts);

router.post("/contacts",siteControllers.postContacts);

router.get('/samples', siteControllers.getSamples);

router.get('/faq', siteControllers.getFAQ);

router.get('/sales', siteControllers.getSales);

router.get('/paper', siteControllers.getPaper);

router.post('/new-paper', siteControllers.postNewPaper);

router.get('/books', siteControllers.getBooks);

router.get('/terms', siteControllers.getTerms);

router.get('/policy', siteControllers.getPolicy);

router.get('/guarantee', siteControllers.getGuarantee);

router.get('/connect', siteControllers.getConnect);

module.exports = router;