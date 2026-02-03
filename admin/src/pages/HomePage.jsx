import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Typography,
  Button,
  TextInput,
  NumberInput,
  SingleSelect,
  SingleSelectOption,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  IconButtonGroup,
  Alert,
} from "@strapi/design-system";
import { Trash, Pencil, CodeBlock } from "@strapi/icons";
import { useFetchClient } from "@strapi/strapi/admin";

const HomePage = () => {
  const { get, post, del, put } = useFetchClient();

  const [productsAndPrices, setProductsAndPrices] = useState({
    prices: [],
    products: [],
  });
  const [settings, setSettings] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [hasChanges, setHasChanges] = useState(false);

  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [editingIndex, setEditingIndex] = useState(null);

  const [paymentType, setPaymentType] = useState("oneTime");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [paymentInterval, setPaymentInterval] = useState("");
  const [trialPeriodDays, setTrialPeriodDays] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isSubscription = paymentType === "subscription";

  const resetForm = () => {
    setPaymentType("oneTime");
    setName("");
    setPrice();
    setPaymentInterval("");
    setTrialPeriodDays(0);
    setHasChanges(false);
  };

  const loadProducts = async () => {
    const res = await get("/strapi5-plugin-stripe/products");

    setProductsAndPrices(res.data);
  };

  const getSettings = async () => {
    const res = await get("/strapi5-plugin-stripe/settings");
    setSettings(res.data || {});
  };

  useEffect(() => {
    loadProducts();
    getSettings();
  }, []);

  const openCreateModal = () => {
    setMode("create");

    resetForm();

    setIsModalOpen(true);
  };

  const openEditModal = (product, price, index) => {
    setMode("edit");

    setHasChanges(false);

    setEditingIndex(index);

    setName(product.name);
    setPrice(price.unit_amount / 100);

    if (price.recurring) {
      setPaymentType("subscription");
      setPaymentInterval(
        price.recurring.interval_count
          ? `${price.recurring.interval_count}${price.recurring.interval}s`
          : price.recurring.interval,
      );
      setTrialPeriodDays(price.recurring.trial_period_days || 0);
    } else {
      setPaymentType("oneTime");
      setPaymentInterval("");
      setTrialPeriodDays(0);
    }

    setIsModalOpen(true);
  };

  const createProduct = async () => {
    setError("");
    setSuccess("");

    try {
      await post("/strapi5-plugin-stripe/products", {
        currency: settings.currency,
        unit_amount: price * 100,
        product_data: {
          name: name,
        },
        ...(isSubscription && {
          recurring: {
            interval:
              paymentInterval.includes("2") || paymentInterval.includes("6")
                ? paymentInterval.slice(1, paymentInterval.length - 1)
                : paymentInterval,
            interval_count: paymentInterval.includes("2")
              ? "2"
              : paymentInterval.includes("6")
                ? "6"
                : null,
            trial_period_days: isSubscription ? trialPeriodDays : null,
          },
        }),
      });

      setSuccess("Product created successfully.");
      setIsModalOpen(false);
      resetForm();
      loadProducts();
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "An unexpected error occurred.",
      );
    }
  };

  const deleteProduct = async (productId, priceId) => {
    setError("");
    setSuccess("");

    try {
      await del(`/strapi5-plugin-stripe/products/${productId}&${priceId}`);
      setSuccess("Product deleted successfully.");
      loadProducts();
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "An unexpected error occurred.",
      );
    }
  };

  const updateProduct = async (productArr, priceArr) => {
    setError("");
    setSuccess("");

    try {
      let productUpdate = {};
      let mustCreateNewPrice = false;

      if (name !== productArr.name) {
        productUpdate.name = name;
      }

      if (Object.keys(productUpdate).length > 0) {
        await put(
          `/strapi5-plugin-stripe/products/${productArr.id}`,
          productUpdate,
        );
      }

      if (priceArr.unit_amount !== price * 100) {
        mustCreateNewPrice = true;
      }

      if (priceArr.recurring) {
        const currentInterval = priceArr.recurring.interval_count
          ? `${priceArr.recurring.interval_count}${priceArr.recurring.interval}s`
          : priceArr.recurring.interval;

        if (currentInterval !== paymentInterval) {
          mustCreateNewPrice = true;
        }

        if (priceArr.recurring.trial_period_days !== trialPeriodDays) {
          mustCreateNewPrice = true;
        }
      }

      if (mustCreateNewPrice) {
        const newPrice = await post("/strapi5-plugin-stripe/products", {
          currency: priceArr.currency,
          unit_amount: price * 100,
          product: productArr.id,
          ...(isSubscription && {
            recurring: {
              interval:
                paymentInterval.includes("2") || paymentInterval.includes("6")
                  ? paymentInterval.slice(1, paymentInterval.length - 1)
                  : paymentInterval,
              interval_count: paymentInterval.includes("2")
                ? 2
                : paymentInterval.includes("6")
                  ? 6
                  : undefined,
              trial_period_days: trialPeriodDays || undefined,
            },
          }),
        });

        await del(
          `/strapi5-plugin-stripe/prices/${productArr.id}&${priceArr.id}&${newPrice.data.id}`,
        );
      }

      setSuccess("Product updated successfully.");

      setIsModalOpen(false);
      resetForm();
      loadProducts();
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "An unexpected error occurred.",
      );
    }
  };

  const currencySymbol = (price) => {
    if (price.currency === "eur") return "€";
    if (price.currency === "usd") return "$";
    if (price.currency === "gbp") return "£";
    if (price.currency === "cad") return "CA$";
  };

  return (
    <Box padding={8}>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        paddingBottom={6}
      >
        <Typography variant="beta" fontWeight="bold">
          Stripe Products
        </Typography>

        <Button onClick={openCreateModal}>Create product</Button>
      </Flex>

      <Table colCount={5} rowCount={productsAndPrices.length}>
        <Thead>
          <Tr>
            <Th>
              <Typography variant="sigma">Name</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Price</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Type</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Interval</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">IDs</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Actions</Typography>
            </Th>
          </Tr>
        </Thead>

        <Tbody>
          {productsAndPrices.prices.map((elm, index) => {
            return (
              <Tr key={elm.id}>
                <Td>
                  <Typography>
                    {productsAndPrices.products[index].name}
                  </Typography>
                </Td>
                <Td>
                  <Typography>
                    {elm.unit_amount / 100} {currencySymbol(elm)}
                  </Typography>
                </Td>
                <Td>
                  <Typography>
                    {elm.type.split("_").map((word) => {
                      return word.charAt(0).toUpperCase() + word.slice(1) + " ";
                    })}
                  </Typography>
                </Td>
                <Td>
                  <Typography>
                    {elm.recurring
                      ? elm.recurring.interval_count
                        ? elm.recurring.interval_count +
                          " " +
                          elm.recurring.interval +
                          "s"
                        : elm.recurring.interval
                      : "-"}
                  </Typography>
                </Td>
                <Td>
                  <Typography
                    background="rgba(173, 216, 230, 0.3)"
                    padding="5px"
                    borderRadius="8px"
                  >
                    {productsAndPrices.products[index].id}
                  </Typography>
                  <Typography>, </Typography>
                  <Typography
                    background="rgba(173, 216, 230, 0.3)"
                    padding="5px"
                    borderRadius="8px"
                  >
                    {elm.id}
                  </Typography>
                </Td>
                <Td>
                  <IconButtonGroup>
                    <IconButton
                      onClick={() => {
                        setSelectedProduct({
                          product: productsAndPrices.products[index],
                          price: elm,
                        });
                        setIsEmbedModalOpen(true);
                      }}
                    >
                      <CodeBlock />
                    </IconButton>
                    <IconButton
                      variant="secondary"
                      onClick={() => {
                        openEditModal(
                          productsAndPrices.products[index],
                          elm,
                          index,
                        );
                      }}
                    >
                      <Pencil />
                    </IconButton>
                    <IconButton
                      variant="danger"
                      onClick={() =>
                        deleteProduct(
                          productsAndPrices.products[index].id,
                          elm.id,
                        )
                      }
                    >
                      <Trash />
                    </IconButton>
                  </IconButtonGroup>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <Box paddingTop={6}>
        {success && (
          <Box paddingBottom={4}>
            <Alert variant="success" title="Success">
              {success}
            </Alert>
          </Box>
        )}
      </Box>

      {isModalOpen && (
        <>
          <Box
            position="fixed"
            top={0}
            left={0}
            width="100vw"
            height="100vh"
            background="rgba(0,0,0,0.5)"
            pointerEvents="none"
            onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}
          ></Box>
          <Box
            display="flex"
            style={{
              flexDirection: "column",
              justifyContent: "center",
              position: "fixed",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
            }}
          >
            <Box
              background="neutral0"
              width="900px"
              maxWidth="90%"
              margin="auto"
              borderRadius="8px"
              zIndex={1000}
            >
              <Box padding={6}>
                <Typography variant="beta" fontWeight="bold">
                  Create Product / Subscription
                </Typography>
              </Box>

              <Box padding={6}>
                <Flex wrap="wrap" gap={4}>
                  <Box width="50%">
                    <Typography variant="pi" fontWeight="bold">
                      Payment Type
                    </Typography>
                    <SingleSelect
                      value={paymentType}
                      onChange={(value) => {
                        setPaymentType(value);
                        setHasChanges(true);
                      }}
                    >
                      <SingleSelectOption value="oneTime">
                        One-Time
                      </SingleSelectOption>
                      <SingleSelectOption value="subscription">
                        Subscription
                      </SingleSelectOption>
                    </SingleSelect>
                  </Box>

                  <Box width="50%">
                    <Typography variant="pi" fontWeight="bold">
                      Price
                    </Typography>
                    <NumberInput
                      value={price}
                      onValueChange={(value) => {
                        setPrice(value);
                        setHasChanges(true);
                      }}
                      required
                    />
                  </Box>

                  <Box width="50%">
                    <Typography variant="pi" fontWeight="bold">
                      Name
                    </Typography>
                    <TextInput
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setHasChanges(true);
                      }}
                      required
                    />
                  </Box>

                  <Box width="50%">
                    <Typography variant="pi" fontWeight="bold">
                      Payment Interval
                    </Typography>
                    <SingleSelect
                      value={paymentInterval}
                      onChange={(value) => {
                        setPaymentInterval(value);
                        setHasChanges(true);
                      }}
                      disabled={paymentType !== "subscription"}
                    >
                      <SingleSelectOption value="week">
                        Every week
                      </SingleSelectOption>
                      <SingleSelectOption value="2weeks">
                        Every 2 weeks
                      </SingleSelectOption>
                      <SingleSelectOption value="month">
                        Every month
                      </SingleSelectOption>
                      <SingleSelectOption value="6months">
                        Every 6 months
                      </SingleSelectOption>
                      <SingleSelectOption value="year">
                        Every year
                      </SingleSelectOption>
                    </SingleSelect>
                  </Box>

                  <Box width="50%">
                    <Typography variant="pi" fontWeight="bold">
                      Trial Period Days
                    </Typography>
                    <NumberInput
                      value={trialPeriodDays}
                      onValueChange={(value) => {
                        setTrialPeriodDays(value);
                        setHasChanges(true);
                      }}
                      disabled={paymentType !== "subscription"}
                    />
                  </Box>
                </Flex>
              </Box>

              <Box padding={6}>
                {error && (
                  <Box paddingBottom={4}>
                    <Alert variant="danger" title="Action failed">
                      {error}
                    </Alert>
                  </Box>
                )}
              </Box>

              <Box padding={6} background="neutral100">
                <Flex justifyContent="space-between">
                  <Button
                    variant="tertiary"
                    onClick={() => {
                      setIsModalOpen(false);
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={() =>
                      mode === "create"
                        ? createProduct()
                        : updateProduct(
                            productsAndPrices.products[editingIndex],
                            productsAndPrices.prices[editingIndex],
                          )
                    }
                    disabled={!hasChanges}
                  >
                    {mode === "create" ? "Create" : "Update"}
                  </Button>
                </Flex>
              </Box>
            </Box>
          </Box>
        </>
      )}

      {isEmbedModalOpen && selectedProduct && (
        <>
          <Box
            position="fixed"
            top={0}
            left={0}
            width="100vw"
            height="100vh"
            background="rgba(0,0,0,0.5)"
            onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}
            zIndex={90}
          ></Box>
          <Box
            display="flex"
            style={{
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
              top: "-100px",
              width: "100%",
              height: "100%",
            }}
          >
            <Box
              background="neutral0"
              width="900px"
              maxWidth="90%"
              margin="auto"
              borderRadius="8px"
              zIndex={100}
            >
              <Box padding={6}>
                <Typography variant="beta" fontWeight="bold">
                  Payment button integration
                </Typography>
              </Box>

              <Box padding={6}>
                <Typography variant="pi" fontWeight="bold">
                  1. Import the script
                </Typography>

                <Box
                  background="neutral100"
                  padding={4}
                  borderRadius="4px"
                  marginTop={2}
                >
                  <pre>
                    {`<script>
  window.addEventListener('load', () => {
    document.querySelectorAll('[data-stripe-checkout]').forEach((btn) => {
      btn.addEventListener('click', () => checkout(btn));
    });

    const sessionId = new URLSearchParams(location.search).get('session_id');
    if (sessionId) retrieve(sessionId);
  });

  function checkout(btn) {
    const apiUrl = btn.dataset.apiUrl;
    const priceId = btn.dataset.priceId;

    if (!apiUrl || !priceId) return;

    const metadata = {};
    Object.keys(btn.dataset).forEach((k) => {
      if (k.startsWith('metadata')) {
        metadata[k.replace('metadata', '').toLowerCase()] = btn.dataset[k];
      }
    });

    fetch(apiUrl + "/api/strapi5-plugin-stripe/checkout", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId,
        customer_email: btn.dataset.email,
        metadata,
      }),
    })
      .then((r) => r.json())
      .then((r) => r.url && (location.href = r.url));
  }
</script>`}
                  </pre>
                </Box>

                <Box paddingTop={4}>
                  <Typography variant="pi" fontWeight="bold">
                    2. Add the payment button
                  </Typography>

                  <Box
                    background="neutral100"
                    padding={4}
                    borderRadius="4px"
                    marginTop={2}
                  >
                    <pre>
                      {`<button
  data-stripe-checkout
  data-api-url="${window.location.origin}"
  data-price-id="${selectedProduct.price.id}"
  data-email="customer@email.com"
  data-metadata-order-id="ORDER_123"
>
  Pay now
</button>`}
                    </pre>
                  </Box>
                </Box>

                <Box paddingTop={4}>
                  <Typography variant="pi" fontWeight="bold">
                    3. Notes
                  </Typography>

                  <Typography variant="pi">
                    <br />• <b>priceId</b> identifies the product price
                    <br />• Metadata is optional and available in webhooks
                    <br />• Redirect is handled automatically by Stripe, with
                    the session ID as a query parameter
                  </Typography>
                </Box>
              </Box>

              <Box padding={6} background="neutral100">
                <Flex justifyContent="flex-end">
                  <Button onClick={() => setIsEmbedModalOpen(false)}>
                    Close
                  </Button>
                </Flex>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export { HomePage };
