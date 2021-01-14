const express = require('express');
const router = express.Router();

router.use(express.json())
const adminControllers = require('../controllers/admin');

const Auth = require('../middleware/auth');
const {
    isAdmin,
    isClient,
    isEditor
} = require("../middleware/auth")

router.get('/projects-newParameter', Auth.isAuth, isAdmin, adminControllers.getAdminNewParameter);

router.post('/projects-newParameter', Auth.isAuth, isAdmin, adminControllers.postAdminNewParameter);

router.post('/edit-param', Auth.isAuth, isAdmin, adminControllers.postEditParam);

router.post('/delete-param', Auth.isAuth, isAdmin, adminControllers.postDeleteParam);

router.get('/content-faq', Auth.isAuth,Auth.isClientAdmin, adminControllers.getAdminFaq);

router.post('/content-faq', Auth.isAuth, Auth.isClientAdmin, adminControllers.postAdminFaq);

router.post('/delete_faq', Auth.isAuth, isAdmin, adminControllers.postDeletefaq);

router.get('/content-sample', Auth.isAuth, isAdmin, adminControllers.getAdminSample);

router.post('/content-sample', Auth.isAuth, isAdmin, adminControllers.postAdminSample);

router.post('/delete-sample', Auth.isAuth, isAdmin, adminControllers.postDeleteSample);

router.get('/content-users', Auth.isAuth, isAdmin, adminControllers.getAdminUsers);

router.post('/delete-user', Auth.isAuth, isAdmin, adminControllers.postDeleteUser);

router.post('/add-editor', Auth.isAuth, isAdmin, adminControllers.postAddEditor);

router.get('/checkout', Auth.isAuth, adminControllers.getCheckout);

router.post('/createPaper', Auth.isAuth, adminControllers.postCreatePaper);

router.get('/redirectToPaper', Auth.isAuth, adminControllers.getRedirectToPaper);

router.post('/submit-work', Auth.isAuth, adminControllers.postSubmitWork);

router.post('/edit-work/:projectId', Auth.isAuth, adminControllers.postEditWork);

module.exports = router;