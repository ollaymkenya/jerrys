const express = require('express');
const router = express.Router();

router.use(express.json())
const adminControllers = require('../controllers/admin');

const Auth = require('../middleware/auth');

router.get('/projects-newParameter', Auth.isAuth, adminControllers.getAdminNewParameter);

router.post('/projects-newParameter', Auth.isAuth, adminControllers.postAdminNewParameter);

router.post('/edit-param', Auth.isAuth, adminControllers.postEditParam);

router.post('/delete-param', Auth.isAuth, adminControllers.postDeleteParam);

router.get('/content-faq', Auth.isAuth, adminControllers.getAdminFaq);

router.post('/content-faq', Auth.isAuth, adminControllers.postAdminFaq);

router.get('/content-users', Auth.isAuth, adminControllers.getAdminUsers);

router.post('/delete-user', Auth.isAuth, adminControllers.postDeleteUser);

router.post('/add-editor', Auth.isAuth, adminControllers.postAddEditor);

router.get('/checkout', Auth.isAuth, adminControllers.getCheckout);

router.post('/createPaper', Auth.isAuth, adminControllers.postCreatePaper);

module.exports = router;
