const express = require('express');
const router = express.Router();

const adminControllers = require('../controllers/admin');

const Auth = require('../middleware/auth');

router.get('/projects-newParameter', Auth.isAuth, adminControllers.getAdminNewParameter);

router.get('/content-faq', Auth.isAuth, adminControllers.getAdminFaq);

router.post('/content-faq', Auth.isAuth, adminControllers.postAdminFaq);

router.get('/content-users', Auth.isAuth, adminControllers.getAdminUsers);

module.exports = router;
