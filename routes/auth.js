const express = require('express');
const router = express.Router();

const authControllers = require('../controllers/auth')
const User = require('../models/User');

const Auth = require('../middleware/auth');

const { body, check } = require('express-validator');

router.get('/login', Auth.alredayAuth, authControllers.getLogin);

router.post('/signup', [
    body('username', 'Your username should contain  not less than 3 letters and digits')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    check('email')
        .isEmail()
        .withMessage("Please enter a valid email.")
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then((userDoc) => {
                    if (userDoc) {
                        return Promise.reject('User email exists already exists. Please pick a different one.')
                    }
                })
        }),
    body('password', 'Your password should not be less than 3 characters')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
], Auth.alredayAuth, authControllers.postSignUp);

router.post('/login', [
    check('email')
        .isEmail()
        .withMessage("Please enter a valid email.")
        .normalizeEmail(),
    body('password', 'Your password should not be less than 3 characters')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
], Auth.alredayAuth, authControllers.postLogin);

router.post('/logout', Auth.isAuth, authControllers.postLogout);

router.get('/reset', Auth.alredayAuth, authControllers.getReset);

router.post('/reset', [
    check('email')
        .isEmail()
        .withMessage("Please enter a valid email.")
        .normalizeEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then((userDoc) => {
                    if (userDoc) {
                        return Promise.reject('User email exists already exists. Please pick a different one.')
                    }
                })
        })], Auth.alredayAuth, authControllers.postReset);

router.get('/reset/:token', Auth.alredayAuth, authControllers.getNewPassword);

router.post("/new-password", [
    body('password', 'Your password should not be less than 3 characters')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
], Auth.alredayAuth, authControllers.postNewPassword);

module.exports = router;
