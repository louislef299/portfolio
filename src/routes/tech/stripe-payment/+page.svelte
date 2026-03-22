<script>
	import Seo from '$lib/components/Seo.svelte';
	import { _metadata as metadata } from './+page.js';
</script>

<Seo title={metadata.title} keywords={metadata.tags} />

<h1>{metadata.title}</h1>
<p>
	It's been a while since I last posted, I've been busy creating an e-commerce
	website with my Mom so that she can sell granola. It will replace the existing
	static <a href="https://littlebitta.com/">littlebitta.com</a> that I built out when that
	was my web vibe. The new stack is built on <a href="https://svelte.dev/">Svelte</a> and I'm building out my
	<a href="https://www.investopedia.com/terms/p/payment-gateway.asp">payment gateway</a> leveraging <a href="https://stripe.com/">Stripe</a>.
</p>

<p>
	Stripe offers many online financial solutions, but I will mostly be using their
	<a href="https://stripe.com/payments">Payments</a> solution(Radar and Billing also caught my eye). I've built out a
	working implementation with AI a couple times now, but I didn't feel like I had
	quite grasped all the concepts, so I've been taking the <a href="https://www.stripe.training/">Stripe Developer
	training course</a> to really understand how to properly use their APIs.
</p>

<img src="/image/tech/stripe-payment/stripe-payment-objects.png" alt="Payment Object Overview" loading="lazy" />

<p>
	As an exercise, I'm going to design a payment flow using the <a href="https://docs.stripe.com/payments/payment-intents">Payment Intent</a>
	API that sits one level below the Checkout Sessions API, making it a good
	learning exercise. We'll just create a <a href="https://buymeacoffee.com/">Buy Me a Coffee</a> button using my
	Stripe Sandbox.
</p>

<h2>Payment Intention Workflow</h2>

<p>
	This post references the <a href="https://docs.stripe.com/payments-api/tour">Stripe API</a> pretty heavily. From a high level, a
	<code>PaymentIntent</code> with authorize a <code>PaymentMethod</code> and incur a <code>Charge</code>. The
	<code>PaymentIntent</code> is just a state machine that keeps track of where in the payment
	workflow the process currently is. I'll let you read about <code>PaymentMethod</code> and
	<code>Charge</code> yourself as they should be relatively intuiative.
</p>

<p>
	The above represents the pre-payment workflow and there is a whole post-payment
	workflow you can follow if there is a <code>Dispute</code> or the customer requests a
	<code>Refund</code>. We won't go over that here, but it's good to be aware of. <code>Charge</code>,
	<code>Dispute</code> and <code>Refund</code> all modify the <code>BalanceTransactions</code> object. If a charge
	fails, there are a range of standard <a href="https://docs.stripe.com/declines/codes">decline codes</a> that you can return.
</p>

<h2>Let's Get Coding</h2>

<p>
	The code sample can be found at <a href="https://github.com/louislef299/stripe-payment-intent">github.com/louislef299/stripe-payment-intent</a>
	and will serve a static HTML page from a bun web server. The frontend will be
	responsible for gathering the <code>PaymentMethod</code> information using <a href="https://stripe.com/payments/elements">Elements</a> and
	the actual <code>PaymentIntent</code> API calls will live on the backend bun server. Be
	sure to add:
</p>

<pre><code>&lt;script src="https://js.stripe.com/clover/stripe.js"&gt;&lt;/script&gt;</code></pre>

<p>
	to your html <code>&lt;head&gt;</code> and install the stripe dependency with <code>bun install
	stripe</code>.
</p>

<h3>Create the Payment Intent</h3>

<p>
	Next, we need to <a href="https://docs.stripe.com/api/payment_intents/create">create the PaymentIntent</a>. It is recommended to create the
	<code>PaymentIntent</code> once the user loads the page that would initiate the intent. For
	our purposes, this is just the main static page, but for a typical e-commerce
	site, that would likely be the checkout page.
</p>

<p>
	For our purposes, we are going to start the <code>PaymentIntent</code> at $1 once the user
	loads the page. This way, we can track how frequently customers complete their
	payments and ensure that changes to our website don't impact payment
	completions. Let's start by writing the backend API that initiates an intent:
</p>

<pre><code>// Add a new Bun route
"/api/intent": async (req) =&gt; {'{'}
    const url = new URL(req.url);
    const amountParam = url.searchParams.get('amount');
    const amount = parseInt(amountParam || '100');

    // create the payment intent and return required information to the client
    try {'{'}
        console.log(`creating payment intent of ${'{'}amount{'}'}`);
        const p = await stripe.paymentIntents.create({'{'}
            amount: amount,
            currency: 'usd',
            automatic_payment_methods: {'{'} enabled: true {'}'},
        {'}'});

        return new Response(
            JSON.stringify({'{'}
                client_secret: p.client_secret,
                intent_id: p.id,
            {'}'}),
            {'{'} headers: {'{'} 'Content-Type': 'application/json' {'}'} {'}'}
        );
    {'}'} catch (error) {'{'}
        // handle error
    {'}'}
{'}'}</code></pre>

<p>
	Then on the client side, call the payment intent API from the <code>window.onload()</code>
	function and store the payment intent ID for a future capture call:
</p>

<pre><code>const response = await fetch(`/api/intent?amount=${'{'}defaultAmount{'}'}`);
const data = await response.json();
// handle error

paymentIntentID = data.intent_id;</code></pre>

<p>
	I won't be going over the logic required to recapture the payment intent in this
	post, but you can look through <code>script.js</code> to figure out how I solved that
	problem.
</p>

<p>
	The default amount in this case is $1(100 cents) and is sent to the Stripe
	backend as the initial default intent. This action happens on initial load time
	and the client just sees the default page with an option to buy me a coffee:
</p>

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
			<div class="amount-emoji">&#9749;</div>
		</button>
		<button class="amount-card" data-amount="300" data-label="$3">
			<div class="amount-price">$3</div>
			<div class="amount-description">Medium Coffee</div>
			<div class="amount-emoji">&#9749;&#9749;&#9749;</div>
		</button>
		<button class="amount-card" data-amount="1000" data-label="$10">
			<div class="amount-price">$10</div>
			<div class="amount-description">Large Coffee + Tip</div>
			<div class="amount-emoji">&#9749;&#9749;&#9749;&#9749;&#9749;</div>
		</button>
	</div>
</div>

<h3>Collect the Payment Method</h3>

<p>
	The default page just has three options of $1, $3 and $10 to send as a little
	tip for all the hard work I've done. To add the Payment Element to the page, we
	just have to create an empty DOM node with a unique form id. In this case, I
	also default the <code>payment-section</code> to be hidden. This allows me to add a click
	event listener to the buttons that makes the transition smooth from my main trio
	of buttons to the Payment form:
</p>

<pre><code>&lt;!-- Payment Form Section (initially hidden) --&gt;
&lt;div id="payment-section" class="hidden"&gt;
    &lt;div id="payment-header"&gt;
        &lt;h2&gt;Complete Your Purchase&lt;/h2&gt;
        &lt;p&gt;Amount: &lt;strong id="selected-amount"&gt;&lt;/strong&gt;&lt;/p&gt;
        &lt;button id="back-button" type="button"&gt;&amp;larr; Change Amount&lt;/button&gt;
    &lt;/div&gt;

    &lt;form id="payment-form"&gt;
        &lt;div id="payment-element"&gt;
            &lt;!--Stripe.js injects the Payment Element--&gt;
        &lt;/div&gt;
        &lt;button id="submit" type="submit"&gt;
            &lt;span id="button-text"&gt;Purchase&lt;/span&gt;
        &lt;/button&gt;
        &lt;div id="payment-message" class="hidden"&gt;&lt;/div&gt;
    &lt;/form&gt;
&lt;/div&gt;</code></pre>

<p>
	Now when we show the payment form, we have to create and mount the Payment
	Element:
</p>

<pre><code>// Initialize Element with the client secret
const appearance = {'{'} theme: 'flat' {'}'};
elements = stripe.elements({'{'}
    // data references the response from our /api/intent call
    clientSecret: data.client_secret,
    appearance
{'}'});

const paymentElement = elements.create("payment", {'{'} layout: "tabs" {'}'});
paymentElement.mount("#payment-element");</code></pre>

<h3>Capture the Payment Intent</h3>

<p>
	Finally, to capture the payment intent, you just essentially need to call
	<code>stripe.confirmPayment()</code> to confirm the <code>PaymentIntent</code> with the payment
	information collected from the Payment Element. In this case, we also choose not
	to redirect the <code>return_url</code> and simply change the button message:
</p>

<pre><code>// Handle payment form submission
const paymentForm = document.getElementById('payment-form');
const submitButton = document.getElementById('submit');
const buttonText = document.getElementById('button-text');

paymentForm.addEventListener('submit', async (e) =&gt; {'{'}
    e.preventDefault();

    try {'{'}
        const {'{'} error {'}'} = await stripe.confirmPayment({'{'}
            elements,
            redirect: 'if_required', // Don't redirect, handle success here
        {'}'});

        if (error) {'{'}
            // Show error message
            paymentMessage.textContent = error.message;
            paymentMessage.classList.remove('hidden');

            // Re-enable button
            submitButton.disabled = false;
            buttonText.textContent = 'Purchase';
        {'}'} else {'{'}
            // Payment succeeded - update button text
            buttonText.textContent = 'Thanks for your payment!';
            submitButton.disabled = true;
        {'}'}
    {'}'} catch (error) {'{'}
        console.error('Payment error:', error);
    {'}'}
{'}'}</code></pre>

<p>
	You can now go to your Stripe dashboard and see the final payment under the
	transactions tab!
</p>

<h2>Conclusion</h2>

<p>
	This was just a quick run-through of the Stripe Payment Intent API. I chose the
	Payment Intent API to get a lower-level understanding of the payment process
	workflow, but I'd recommend reading through the <a href="https://docs.stripe.com/payments/checkout-sessions-and-payment-intents-comparison">Checkout Session vs Payment
	Intent</a> resource Stripe provides to decide which solution is best for you.
</p>
