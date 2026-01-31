export default () => ({
  type: "content-api",
  routes: [
    {
      method: "POST",
      path: "/checkout",
      handler: "stripeController.checkout",
    },
  ],
});
