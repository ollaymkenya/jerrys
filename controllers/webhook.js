const whHandlers = require('../utils/WHHandlers');

exports.postWebhooks = (req, res) => {
    switch (req.params.companyName) {
        case 'stripe':
            whHandlers.stripeWH(req, res);
            break;
        default:
            return false;
    }
  };