# 💳 Strapi 5 Stripe Plugin

A Strapi 5 plugin to manage **Stripe products and subscriptions** directly from the admin panel, and provide a **simple front-end checkout integration** via a ready-to-use JavaScript snippet.

## 📚 Table of Contents

- [🚀 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [📦 Managing Products](#-managing-products)
- [🧩 Front-end Checkout Integration](#-front-end-checkout-integration)
- [🧪 HTML Example](#-html-example)
- [✨ Features](#-features)

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

## ⚙️ Configuration

Go to **Admin Panel → Plugins → Stripe Settings** and configure:

- **Environment**: test or live
- **Currency**: EUR, USD, GBP, etc.
- **Success URL**: Redirect after successful payment
- **Cancel URL**: Redirect if payment is canceled

Save the settings once configured.

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
