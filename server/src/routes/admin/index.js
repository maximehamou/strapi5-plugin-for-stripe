export default () => ({
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/settings",
      handler: "stripeController.getSettings",
      config: {
        auth: {
          admin: true,
        },
      },
    },
    {
      method: "PUT",
      path: "/settings",
      handler: "stripeController.updateSettings",
      config: {
        auth: {
          admin: true,
        },
      },
    },
    {
      method: "POST",
      path: "/products",
      handler: "stripeController.createProduct",
      config: {
        auth: {
          admin: true,
        },
      },
    },
    {
      method: "GET",
      path: "/products",
      handler: "stripeController.listProducts",
      config: {
        auth: {
          admin: true,
        },
      },
    },
    {
      method: "PUT",
      path: "/products/:id",
      handler: "stripeController.updateProduct",
      config: {
        auth: {
          admin: true,
        },
      },
    },
    {
      method: "DELETE",
      path: "/products/:productId&:priceId",
      handler: "stripeController.deleteProduct",
      config: {
        auth: {
          admin: true,
        },
      },
    },
    {
      method: "DELETE",
      path: "/prices/:productId&:priceId&:newPriceId",
      handler: "stripeController.deletePrice",
      config: {
        auth: {
          admin: true,
        },
      },
    },
  ],
});
