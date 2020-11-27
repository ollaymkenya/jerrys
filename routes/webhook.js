const express = require('express');
const router = express.Router();

const webhookControllers = require('../controllers/webhook');

// Use body-parser to retrieve the raw body as a buffer
const bodyParser = require('body-parser');
 
router.post('/webhooks/:companyName', bodyParser.raw({type: 'application/json'}), webhookControllers.postWebhooks);

module.exports = router;
