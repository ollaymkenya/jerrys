const data = document.getElementById('customer-paper').dataset.customerPaper;
const files = document.getElementById('customer-files').dataset.customerFiles;
const body = JSON.stringify({data, files});
const csrfToken = document.getElementById('csrf').value
// A reference to Stripe.js initialized with your real test publishable API key.
var stripe = Stripe("pk_test_51HgzMMJPyNo4yUQMCvdabJmpexVXrxhQjPL1c87cZFIHmkfjK2BjlDDeQDGYIUXxE516MBSglgSjUFtgbU3rLFIT00GRAdeWyI");
// the customer secret
const clientSecret = document.getElementById('customer-id').dataset.customerSecret;

// Disable the button until we have Stripe set up on the page
document.querySelector("button").disabled = true;

var elements = stripe.elements();
var style = {
  base: {
    color: "#32325d",
    fontFamily: 'Roboto, sans-serif',
    fontSmoothing: "antialiased",
    fontSize: "16px",
    "::placeholder": {
      color: "#32325d"
    }
  },
  invalid: {
    fontFamily: 'Roboto, sans-serif',
    color: "#fa755a",
    iconColor: "#fa755a"
  }
};

var card = elements.create("card", { style: style });

// Stripe injects an iframe into the DOM
card.mount("#card-element");
card.on("change", function (event) {
  // Disable the Pay button if there are no card details in the Element
  document.querySelector("button").disabled = event.empty;
  document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
});

var form = document.getElementById("payment-form");
form.addEventListener("submit", function (event) {
  event.preventDefault();
  // Complete payment when the submit button is clicked
  payWithCard(stripe, card, clientSecret);
});
// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
var payWithCard = function (stripe, card, clientSecret) {
  loading(true);
  stripe
    .confirmCardPayment(clientSecret, {
      receipt_email: document.getElementById('email').value,
      payment_method: {
        card: card,
        billing_details: {
          email: document.getElementById('email').value,
          name: document.getElementById('name').value
        },
      }
    })
    .then(function (result) {
      if (result.error) {
        // Show error to your customer
        showError(result.error.message);
      } else {
        // The payment succeeded!
        orderComplete(result.paymentIntent.status);
      }
    });
};

/* ------- UI helpers ------- */
// Shows a success message when the payment is complete
var orderComplete = function (paymentIntentStatus) {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': csrfToken
  });

  const options = {
    method: 'POST',
    body: body,
    headers,
    redirect: 'follow'
  }
  fetch('/createPaper', options)
    .then(res => {
      if (res.redirected) {
        window.location.href = res.url;
      }
      loading(false);
      document.querySelector(".result-message").classList.remove("hidden");
      document.querySelector("button").disabled = true;
    });
};
// Show the customer the error from Stripe if their card fails to charge
var showError = function (errorMsgText) {
  loading(false);
  var errorMsg = document.querySelector("#card-error");
  errorMsg.textContent = errorMsgText;
  setTimeout(function () {
    errorMsg.textContent = "";
  }, 4000);
};
// Show a spinner on payment submission
var loading = function (isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
};