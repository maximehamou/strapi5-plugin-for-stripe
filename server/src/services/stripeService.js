import Stripe from "stripe";

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
});

export default stripeService;
