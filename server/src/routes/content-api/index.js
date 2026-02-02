export default () => ({
  type: "content-api",
  routes: [
    {
      method: "POST",
      path: "/checkout",
      handler: "stripeController.checkout",
    },
    {
      method: "POST",
      path: "/webhook",
      handler: "stripeController.webhook",
      config: {
        auth: false,
      },
    },
  ],
});
