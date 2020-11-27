const express = require('express');
const router = express.Router();

const siteControllers = require('../controllers/site');

router.get('/', siteControllers.getIndex);

router.get('/about', siteControllers.getAbout);

router.get('/contacts', siteControllers.getContacts);

<<<<<<< HEAD
router.post('/contacts', siteControllers.postContacts);
=======
router.post("/contacts",siteControllers.postContacts);
>>>>>>> master

router.get('/samples', siteControllers.getSamples);

router.get('/faq/:searchQuery', siteControllers.getFAQ);

router.get('/sales', siteControllers.getSales);

router.get('/paper', siteControllers.getPaper);

router.post('/new-paper', siteControllers.postNewPaper);

router.get('/books', siteControllers.getBooks);

router.get('/terms', siteControllers.getTerms);

router.get('/policy', siteControllers.getPolicy);

router.get('/guarantee', siteControllers.getGuarantee);

module.exports = router;