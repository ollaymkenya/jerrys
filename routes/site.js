const express = require('express');
const router = express.Router();

const siteControllers = require('../controllers/site');

router.get('/', siteControllers.getIndex);

router.get('/about', siteControllers.getAbout);

router.get('/contacts', siteControllers.getContacts);

router.get('/samples', siteControllers.getSamples);

router.get('/faq', siteControllers.getFAQ);

router.get('/sales', siteControllers.getSales);

module.exports = router;