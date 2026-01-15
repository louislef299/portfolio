---
title: "Stripe Payment Intentions"
date: 2026-01-16T07:50:43-06:00
draft: false
tags:
- webdev
- ecommerce
---

It's been a while since I last posted, I've been busy creating an e-commerce
website with my Mom so that she can sell granola. It will replace the existing
static [littlebitta.com](https://littlebitta.com/) that I built out when that
was my web vibe. The new stack is built on [Svelte][] and I'm building out my
[payment gateway][] leveraging [Stripe][].

Stripe offers many online financial solutions, but I will mostly be using their
[Payments][] solution(Radar and Billing also caught my eye). I've built out a
working implementation with AI a couple times now, but I didn't feel like I had
quite grasped all the concepts, so I've been taking the [Stripe Developer
training course][] to really understand how to properly use their APIs.

![Payment Object Overview](/image/stripe-payment-objects.png)

As an exercise, I'm going to design a payment flow using the [Payment Intent][]
API that sits one level below the Checkout Sessions API, making it a good
learning exercise. We'll just create a [Buy Me a Coffee][] button using my
Stripe Sandbox.

## Payment Intention Workflow

This post references the [Stripe API][] pretty heavily. From a high level, a
`PaymentIntent` with authorize a `PaymentMethod` and incur a `Charge`. The
`PaymentIntent` is just a state machine that keeps track of where in the payment
workflow the process currently is. I'll let you read about `PaymentMethod` and
`Charge` yourself as they should be relatively intuiative.

The above represents the pre-payment workflow and there is a whole post-payment
workflow you can follow if there is a `Dispute` or the customer requests a
`Refund`. We won't go over that here, but it's good to be aware of. `Charge`,
`Dispute` and `Refund` all modify the `BalanceTransactions` object. If a charge
fails, there are a range of standard [decline codes][] that you can return.

## Let's Get Coding

The code sample can be found at [github.com/louislef299/stripe-payment-intent][]
and will serve a static HTML page from a bun web server. The frontend will be
responsible for gathering the `PaymentMethod` information using [Elements][] and
the actual `PaymentIntent` API calls will live on the backend bun server. Be
sure to add:

```html
<script src="https://js.stripe.com/clover/stripe.js"></script>
```

to your html `<head>` and install the stripe dependency with `bun install
stripe`.

### Create the Payment Intent

Next, we need to [create the PaymentIntent][]. It is recommended to create the
`PaymentIntent` once the user loads the page that would initiate the intent. For
our purposes, this is just the main static page, but for a typical e-commerce
site, that would likely be the checkout page.

For our purposes, we are going to start the `PaymentIntent` at $1 once the user
loads the page. This way, we can track how frequently customers complete their
payments and ensure that changes to our website don't impact payment
completions. Let's start by writing the backend API that initiates an intent:

```javascript
// Add a new Bun route
"/api/intent": async (req) => {
    const url = new URL(req.url);
    const amountParam = url.searchParams.get('amount');
    const amount = parseInt(amountParam || '100');
    
    // create the payment intent and return required information to the client
    try {
        console.log(`creating payment intent of ${amount}`)
        const p = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
        });

        return new Response(
            JSON.stringify({ 
                client_secret: p.client_secret,
                intent_id: p.id,
            }), 
            { headers: { 'Content-Type': 'application/json' }}
        );
    } catch (error) {
        // handle error
    }
}
```

Then on the client side, call the payment intent API from the `window.onload()`
function and store the payment intent ID for a future capture call:

```javascript
const response = await fetch(`/api/intent?amount=${defaultAmount}`);
const data = await response.json();
// handle error

paymentIntentID = data.intent_id;
```

I won't be going over the logic required to recapture the payment intent in this
post, but you can look through `script.js` to figure out how I solved that
problem.

The default amount in this case is $1(100 cents) and is sent to the Stripe
backend as the initial default intent. This action happens on initial load time
and the client just sees the default page with an option to buy me a coffee:

<style>
    #amount-selection {
        background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        max-width: 800px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .amount-options {
        display: flex;
        gap: 20px;
        justify-content: center;
        flex-wrap: wrap;
    }

    .amount-card {
        background: white;
        border: 3px solid #e0e0e0;
        border-radius: 12px;
        padding: 30px 40px;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 180px;
        font-family: inherit;
    }

    .amount-card:hover {
        transform: translateY(-5px);
        border-color: #667eea;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .amount-price {
        font-size: 2.5em;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 10px;
    }

    .amount-description {
        font-size: 1em;
        color: #666;
        margin-bottom: 15px;
    }

    .amount-emoji {
        font-size: 1.5em;
    }
</style>

<div id="amount-selection">
    <div class="amount-options">
        <button class="amount-card" data-amount="100" data-label="$1">
            <div class="amount-price">$1</div>
            <div class="amount-description">Small Coffee</div>
            <div class="amount-emoji">☕</div>
        </button>
        <button class="amount-card" data-amount="300" data-label="$3">
            <div class="amount-price">$3</div>
            <div class="amount-description">Medium Coffee</div>
            <div class="amount-emoji">☕☕☕</div>
        </button>
        <button class="amount-card" data-amount="1000" data-label="$10">
            <div class="amount-price">$10</div>
            <div class="amount-description">Large Coffee + Tip</div>
            <div class="amount-emoji">☕☕☕☕☕</div>
        </button>
    </div>
</div>

### Collect the Payment Method

The default page just has three options of $1, $3 and $10 to send as a little
tip for all the hard work I've done. To add the Payment Element to the page, we
just have to create an empty DOM node with a unique form id. In this case, I
also default the `payment-section` to be hidden. This allows me to add a click
event listener to the buttons that makes the transition smooth from my main trio
of buttons to the Payment form:

```html
<!-- Payment Form Section (initially hidden) -->
<div id="payment-section" class="hidden">
    <div id="payment-header">
        <h2>Complete Your Purchase</h2>
        <p>Amount: <strong id="selected-amount"></strong></p>
        <button id="back-button" type="button">← Change Amount</button>
    </div>
    
    <form id="payment-form">
        <div id="payment-element">
            <!--Stripe.js injects the Payment Element-->
        </div>
        <button id="submit" type="submit">
            <span id="button-text">Purchase</span>
        </button>
        <div id="payment-message" class="hidden"></div>
    </form>
</div>
```

Now when we show the payment form, we have to create and mount the Payment
Element:

```javascript
// Initialize Element with the client secret
const appearance = { theme: 'flat' };
elements = stripe.elements({ 
    // data references the response from our /api/intent call
    clientSecret: data.client_secret,
    appearance 
});

const paymentElement = elements.create("payment", { layout: "tabs" });
paymentElement.mount("#payment-element");
```

### Capture the Payment Intent

Finally, to capture the payment intent, you just essentially need to call
`stripe.confirmPayment()` to confirm the `PaymentIntent` with the payment
information collected from the Payment Element. In this case, we also choose not
to redirect the `return_url` and simply change the button message:

```javascript
// Handle payment form submission
const paymentForm = document.getElementById('payment-form');
const submitButton = document.getElementById('submit');
const buttonText = document.getElementById('button-text');

paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const { error } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required', // Don't redirect, handle success here
        });
        
        if (error) {
            // Show error message
            paymentMessage.textContent = error.message;
            paymentMessage.classList.remove('hidden');
            
            // Re-enable button
            submitButton.disabled = false;
            buttonText.textContent = 'Purchase';
        } else {
            // Payment succeeded - update button text
            buttonText.textContent = 'Thanks for your payment!';
            submitButton.disabled = true;
        }
    } catch (error) {
        console.error('Payment error:', error);
    }
}
```

You can now go to your Stripe dashboard and see the final payment under the
transactions tab!

## Conclusion

This was just a quick run-through of the Stripe Payment Intent API. I chose the
Payment Intent API to get a lower-level understanding of the payment process
workflow, but I'd recommend reading through the [Checkout Session vs Payment
Intent][] resource Stripe provides to decide which solution is best for you.

💸💸💸

[Buy Me a Coffee]: https://buymeacoffee.com/
[Checkout Session vs Payment Intent]: https://docs.stripe.com/payments/checkout-sessions-and-payment-intents-comparison
[create the PaymentIntent]: https://docs.stripe.com/api/payment_intents/create
[decline codes]: https://docs.stripe.com/declines/codes
[Elements]: https://stripe.com/payments/elements
[github.com/louislef299/stripe-payment-intent]: https://github.com/louislef299/stripe-payment-intent
[Payments]: https://stripe.com/payments
[payment gateway]: https://www.investopedia.com/terms/p/payment-gateway.asp
[Payment Intent]: https://docs.stripe.com/payments/payment-intents
[Stripe]: https://stripe.com/
[Stripe API]: https://docs.stripe.com/payments-api/tour
[Stripe Developer training course]: https://www.stripe.training/
[Svelte]: https://svelte.dev/
