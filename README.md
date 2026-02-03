<div align="center">
  <img width="200" height="200" alt="logo_strapi5-plugin-stripe-small" src="https://github.com/user-attachments/assets/3e2503d7-235c-4944-b592-bd742d235447" />
</div>

<h1 align="center">💳 Strapi 5 Plugin for Stripe</h1>

A Strapi 5 plugin to manage **Stripe products and subscriptions** directly from the admin panel, and provide a **simple front-end checkout integration** via a ready-to-use JavaScript snippet.

## 📚 Table of Contents

- [🚀 Installation](#-installation)
- [💡 Environment Variables (.env)](#-environment-variables-env)
- [🪝 Webhooks (Signature Verification)](#-webhooks-signature-verification)
  - [🧱 1) Enable raw body support in Strapi](#-1-enable-raw-body-support-in-strapi)
  - [🔗 2) Stripe Webhook Endpoint URL](#-2-stripe-webhook-endpoint-url)
  - [🔐 3) Create a Webhook endpoint in Stripe (to get the webhook secret)](#-3-create-a-webhook-endpoint-in-stripe-to-get-the-webhook-secret)
  - [🧪 4) Local development (no public URL)](#-4-local-development-no-public-url)
- [⚙️ Configuration](#️-configuration)
- [📦 Managing Products](#-managing-products)
- [🧑‍💻 Embed Payment Button Code](#-embed-payment-button-code)
- [📝 License](#-license)

## 🚀 Installation

1. Copy the plugin into your Strapi project:

```bash
npm i strapi5-plugin-stripe
```

or

```bash
yarn add strapi5-plugin-stripe
```

2. Restart Strapi:

```bash
yarn develop
```

## 💡 Environment Variables (.env)

To use the Strapi Stripe plugin, you need to configure some environment variables in your Strapi project `.env` file. These variables allow the plugin to connect to your Stripe account securely.

### Required Variables

| Variable                                 | Description                                                                               |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| `STRAPI_ADMIN_TEST_STRIPE_SECRET_KEY`    | Your Stripe **Test Secret Key**. Used when the plugin is in test mode.                    |
| `STRAPI_ADMIN_LIVE_STRIPE_SECRET_KEY`    | Your Stripe **Live Secret Key**. Used when the plugin is in live mode.                    |
| `STRAPI_ADMIN_STRIPE_WEBHOOK_SECRET_KEY` | Your Stripe **Webhook Secret**. Needed if you are using Stripe webhooks to handle events. |

### Example `.env` file

```env
STRAPI_ADMIN_TEST_STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXX
STRAPI_ADMIN_LIVE_STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXXXXXX
STRAPI_ADMIN_STRIPE_WEBHOOK_SECRET_KEY=whsec_XXXXXXXXXXXXXXXXXXXXXXXX
```

## 🪝 Webhooks (Signature Verification)

This plugin can receive Stripe webhook events, **verify the Stripe signature**, and **forward the authenticated event payload** to your external API (your business logic stays outside the plugin).

> ✅ The plugin does **not** process Stripe events internally.  
> It only **authenticates** the event (signature check) and then forwards it.

### 🧱 1) Enable raw body support in Strapi

Stripe signature verification requires the **raw request body**.  
If Strapi parses the body first, verification will fail.

Edit your Strapi project middleware config:

**`config/middlewares.js`**

```js
{
  name: "strapi::body",
  config: {
    includeUnparsed: true,
  },
},
```

Then restart Strapi.

❌ Without this, Stripe verification will fail (invalid signature).

### 🔗 2) Stripe Webhook Endpoint URL

When you create the webhook in Stripe, Stripe needs an Endpoint URL (a public URL that Stripe can call).

In production, it should be your Strapi webhook route, for example: `https://your-backend.com/api/strapi5-plugin-stripe/webhook`

In local development, Stripe cannot call localhost directly. Use Stripe CLI instead (see below).

### 🔐 3) Create a Webhook endpoint in Stripe (to get the webhook secret)

1. Open the Stripe Dashboard (Test or Live mode depending on your environment)
2. Go to Developers → Webhooks
3. Click Add endpoint
4. Select the events you want to receive (minimum recommended):
   - checkout.session.completed

   Depending on your use-case (subscriptions), you may also want:
   - invoice.paid
   - customer.subscription.deleted
   - customer.subscription.created
   - customer.subscription.updated

5. Enter your Endpoint URL
6. Click Add endpoint
7. Open the created endpoint → find Signing secret
8. Click Reveal and copy the value (starting with `whsec_...`)

You can now paste this value to your `.env` file

### 🧪 4) Local development (no public URL)

Stripe can’t reach localhost from the internet. Use the Stripe CLI to forward events to your local Strapi server:

```bash
stripe login
stripe listen --forward-to localhost:1337/api/strapi5-plugin-stripe/webhook
```

The CLI will display a temporary signing secret: `Your webhook signing secret is whsec_...`

Use that value in your .env during local development: `STRAPI_ADMIN_STRIPE_WEBHOOK_SECRET_KEY=whsec_FROM_STRIPE_CLI`

> ⚠️ The Stripe CLI signing secret changes every time you restart stripe listen.

## ⚙️ Configuration

Go to **Admin Panel → Plugins → Stripe Settings** and configure:

- **Environment**: test or live
- **Currency**: EUR, USD, GBP or CAD
- **Webhook forward URL**: Securly forward webhook events to a given URL
- **Success URL**: Redirect after successful payment
- **Cancel URL**: Redirect if payment is canceled

Save the settings once configured.

If you want to configure the allowed **payment methods**, you can do it directly in the Stripe Dashboard, by going to **Settings → Payments → Payment methods**.

## 📦 Managing Products

The plugin allows you to manage Stripe products directly from the admin UI.

Supported product types

- ✅ One-time payments
- 🔁 Subscriptions

Available fields

- Name
- Price (entered in main currency unit)
- Payment Type
- Interval (subscriptions only)
- Trial period (subscriptions only / optional)

Important Stripe behavior

Stripe prices are immutable.
If you change the price or subscription interval, the plugin automatically:

- Creates a new price
- Deactivates the old one

This is handled transparently.

## 🧑‍💻 Embed Payment Button Code

After creating a product in the Stripe plugin, click on the **Embed Code** icon next to the product.

A modal will open with a ready-to-use integration snippet and clear instructions to help you add a payment button to your website.

To integrate the payment button:

- Copy the provided **JavaScript snippet** and paste it into your page.
- Add the **payment button HTML** to your product listing page.
- Configure the button using **data-\* attributes** (price ID, customer email, metadata, etc.).
- Customize the button label (for example: Buy Now, Pay Now) and **style it** using your own CSS.

The product listing page is the page where your products are displayed and where customers can start the checkout process by clicking the payment button.

## 📝 License

This plugin is licensed under the **GPLv3** license. See the [COPYING](./COPYING) file for details.

©2026 Maxime Hamou
