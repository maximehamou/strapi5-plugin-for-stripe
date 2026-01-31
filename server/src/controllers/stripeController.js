const stripeController = ({ strapi }) => ({
  async stripeService() {
    return strapi.plugin("strapi5-plugin-stripe").service("stripeService");
  },

  /* ============================
   * SETTINGS
   * ============================ */

  async getSettingsInternal() {
    return await strapi
      .store({ type: "plugin", name: "strapi5-plugin-stripe" })
      .get({ key: "settings" });
  },

  async getSettings(ctx) {
    const settings = await this.getSettingsInternal();
    ctx.body = settings || {};
  },

  async updateSettings(ctx) {
    const data = ctx.request.body;

    if (data.checkout?.successUrl) {
      const u = new URL(data.checkout.successUrl);
      if (data.environment === "live" && u.protocol !== "https:") {
        throw new Error("successUrl must be HTTPS in live mode");
      }
    }

    if (data.checkout?.cancelUrl) {
      const u = new URL(data.checkout.cancelUrl);
      if (data.environment === "live" && u.protocol !== "https:") {
        throw new Error("cancelUrl must be HTTPS in live mode");
      }
    }

    await strapi
      .store({ type: "plugin", name: "strapi5-plugin-stripe" })
      .set({ key: "settings", value: data });

    ctx.body = { ok: true };
  },

  /* ============================
   * PRODUCTS
   * ============================ */

  async createProduct(ctx) {
    const settings = await this.getSettingsInternal();
    const service = await this.stripeService();
    const stripe = service.stripeClient(settings.environment || "test");

    ctx.body = await stripe.prices.create(ctx.request.body);
  },

  async listProducts(ctx) {
    const settings = await this.getSettingsInternal();
    const service = await this.stripeService();
    const stripe = service.stripeClient(settings.environment || "test");

    ctx.body = {
      prices: (
        await stripe.prices.list({
          limit: ctx.query.limit || 20,
          active: ctx.query.active || true,
        })
      ).data,
      products: (
        await stripe.products.list({
          limit: ctx.query.limit || 20,
          active: ctx.query.active || true,
        })
      ).data,
    };
  },

  async updateProduct(ctx) {
    const settings = await this.getSettingsInternal();
    const service = await this.stripeService();
    const stripe = service.stripeClient(settings.environment || "test");

    ctx.body = await stripe.products.update(ctx.params.id, ctx.request.body);
  },

  async deleteProduct(ctx) {
    const settings = await this.getSettingsInternal();
    const service = await this.stripeService();
    const stripe = service.stripeClient(settings.environment || "test");

    ctx.body = {
      productRes: await stripe.products.update(ctx.params.productId, {
        active: false,
      }),
      priceRes: await stripe.prices.update(ctx.params.priceId, {
        active: false,
      }),
    };
  },

  async deletePrice(ctx) {
    const settings = await this.getSettingsInternal();
    const service = await this.stripeService();
    const stripe = service.stripeClient(settings.environment || "test");

    ctx.body = {
      productRes: await stripe.products.update(ctx.params.productId, {
        default_price: ctx.params.newPriceId,
      }),
      priceRes: await stripe.prices.update(ctx.params.priceId, {
        active: false,
      }),
    };
  },

  /* ============================
   * CHECKOUT
   * ============================ */

  async checkout(ctx) {
    const settings = await this.getSettingsInternal();
    const service = await this.stripeService();
    const stripe = service.stripeClient(settings.environment || "test");

    const {
      priceId,
      customer_email,
      productId,
      productName,
      metadata = {},
    } = ctx.request.body;

    if (!priceId || !customer_email) {
      ctx.throw(400, "Missing priceId or customer_email");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      customer_email,

      success_url:
        settings.checkout.successUrl + "?sessionId={CHECKOUT_SESSION_ID}",
      cancel_url: settings.checkout.cancelUrl,

      metadata: {
        productId,
        productName,
        ...metadata,
      },
    });

    ctx.body = {
      url: session.url,
    };
  },

  /* ============================
   * WEBHOOK
   * ============================ */

  async webhook(ctx) {
    const settings = await this.getSettingsInternal();
    const service = await this.stripeService();

    const env = settings.environment || "test";
    const forwardUrl = settings.webhook?.forwardUrl;

    if (!forwardUrl) {
      throw new Error("No webhook forward URL configured");
    }

    // HTTPS only in live
    const parsed = new URL(forwardUrl);
    if (env === "live" && parsed.protocol !== "https:") {
      throw new Error("Webhook forward URL must be HTTPS in live mode");
    }

    // 1. Verify Stripe signature
    const event = service.verifyWebhook({ ctx, env });

    // 2. WEBHOOK EVENTS (avoid duplicate)
    if (await service.isDuplicateEvent(event.id)) {
      ctx.body = { received: true };
      return;
    }

    await service.storeEvent(event);

    // 3. Forward raw event + original signature
    await service.forwardEvent({
      url: forwardUrl,
      rawBody: ctx.request.body,
      signature: ctx.request.headers["stripe-signature"],
    });

    ctx.body = { received: true };
  },
});

export default stripeController;
