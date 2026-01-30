import Stripe from "stripe";
import axios from "axios";

const stripeService = ({ strapi }) => ({
  /* ============================
   * STRIPE CLIENT
   * ============================ */

  stripeClient(env) {
    const key =
      env === "live"
        ? process.env.STRAPI_ADMIN_LIVE_STRIPE_SECRET_KEY
        : process.env.STRAPI_ADMIN_TEST_STRIPE_SECRET_KEY;

    if (!key) {
      throw new Error(`Missing Stripe secret key (${env})`);
    }

    return new Stripe(key);
  },

  getWebhookSecret(env) {
    return env === "live"
      ? process.env.STRAPI_ADMIN_LIVE_STRIPE_WEBHOOK_SECRET
      : process.env.STRAPI_ADMIN_TEST_STRIPE_WEBHOOK_SECRET;
  },

  /* ============================
   * WEBHOOK SECURITY
   * ============================ */

  verifyWebhook({ ctx, env }) {
    const signature = ctx.request.headers["stripe-signature"];
    if (!signature) {
      throw new Error("Missing Stripe signature");
    }

    const stripe = this.stripeClient(env);
    const secret = this.getWebhookSecret(env);

    return stripe.webhooks.constructEvent(ctx.request.body, signature, secret);
  },

  /* ============================
   * WEBHOOK EVENTS
   * ============================ */

  async isDuplicateEvent(eventId) {
    return Boolean(
      await strapi.db
        .query("plugin::stripe.webhook-event")
        .findOne({ where: { stripeId: eventId } }),
    );
  },

  async storeEvent(event) {
    await strapi.db.query("plugin::stripe.webhook-event").create({
      data: {
        stripeId: event.id,
        type: event.type,
        livemode: event.livemode,
      },
    });
  },

  /* ============================
   * FORWARDING
   * ============================ */

  async forwardEvent({ url, rawBody, signature }) {
    try {
      const res = await axios.post(url, rawBody, {
        headers: {
          "content-type": "application/json",
          "stripe-signature": signature,
        },
        timeout: 5000,
      });

      if (res.status < 200 || res.status >= 300) {
        throw new Error(`Forwarding webhook failed (${res.status})`);
      }
    } catch (err) {
      strapi.log.error("Stripe webhook forwarding failed:", err);
      throw err;
    }
  },
});

export default stripeService;
