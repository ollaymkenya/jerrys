const stripe = require('stripe')('sk_test_51HgzMMJPyNo4yUQMT58hHpGHUVN8XPFYzZLsIXKYZpBzhmy1c8unL9a9JHMNy7tUOaNkmlAkHsgy6MsDA81cXIZE00S3ddcyAm');
const endpointSecret = 'whsec_l2BwN68nGYXKe3FdwvLUUkx6fQtpqM8m';

const User = require("../models/User");

const sendinBlue = require("nodemailer-sendinblue-transport");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'SendinBlue',
  auth: {
    user: 'olivermuriithi11@gmail.com',
    pass: '7qMB5hsJLbcXdYEK'
  }
});

exports.stripeWH = (req, res) => {
  let event;
  const sig = req.headers['stripe-signature'];
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      break;
    case 'payment_intent.payment_failed':
      const paymentMethod = event.data.object;
      console.log('Payemnt Intent failed');
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
}