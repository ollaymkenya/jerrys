const express = require('express');
const router = express.Router();

const userControllers = require('../controllers/user');

const Auth = require('../middleware/auth');

router.get('/dashboard', Auth.isAuth, userControllers.getDashboard);

router.get('/chat', Auth.isAuth, userControllers.getDashboardChat);

router.get('/chat/:chatRoom', Auth.isAuth, userControllers.getDashboardChatRoom);

router.get('/projects-newProject', Auth.isAuth, userControllers.getDashboardNewProjects);

router.get('/projects', Auth.isAuth, userControllers.getProjects);

router.get('/content-testimonials', Auth.isAuth, Auth.isClientAdmin, userControllers.getDashboardTestimonials);

router.post('/add-testimonial', Auth.isAuth, Auth.isClientAdmin, userControllers.postAddTestimonail);

router.post('/publish-testimonial', Auth.isAuth,Auth.isAdmin, userControllers.postPublishTestimonial);

router.post('/delete-testimonial', Auth.isAuth,Auth.isAdmin, userControllers.postDeleteTestimonial);

router.post('/project-attachment', Auth.isAuth, userControllers.postProjectAttachment);

module.exports = router;