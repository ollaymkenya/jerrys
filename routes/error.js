const express = require('express');
const router = express.Router();

router.use(get404 = (req, res, next) => {
    res.status(404).render('404.ejs');
})

module.exports = router