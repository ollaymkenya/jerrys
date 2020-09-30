const express = require('express');
const router = express.Router();

const userControllers = require('../controllers/user');

const Auth = require('../middleware/auth');

router.get('/dashboard', Auth.isAuth, userControllers.getDashboard);

router.get('/chat', Auth.isAuth, userControllers.getDashboardChat);

router.get('/chat/:chatRoom', Auth.isAuth, userControllers.getDashboardChatRoom);

router.get('/projects-newProject', Auth.isAuth, userControllers.getDashboardNewProjects);

router.get('/projects', Auth.isAuth, userControllers.getProjects);

router.get('/projects/:projectId', Auth.isAuth, userControllers.getProject);

router.get('/content-testimonials', Auth.isAuth, userControllers.getDashboardTestimonials);

module.exports = router;