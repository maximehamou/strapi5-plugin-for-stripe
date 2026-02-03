import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextInput,
  Switch,
  Typography,
  Flex,
  SingleSelect,
  SingleSelectOption,
  Alert,
} from "@strapi/design-system";
import { useFetchClient } from "@strapi/strapi/admin";

const SettingsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { get, put } = useFetchClient();

  useEffect(() => {
    const load = async () => {
      const res = await get("/strapi5-plugin-for-stripe/settings");

      setData({
        environment: res.data?.environment ?? "test",
        currency: res.data?.currency ?? "eur",
        checkout: res.data?.checkout ?? {},
        webhook: res.data?.webhook ?? {},
      });
    };

    load();
  }, []);

  const save = async () => {
    setError("");
    setSuccess("");

    if (!data.checkout?.successUrl || !data.checkout?.cancelUrl) {
      setError("Both Success URL and Cancel URL are required.");
      return;
    }

    setLoading(true);

    try {
      await put("/strapi5-plugin-for-stripe/settings", data);
      setSuccess("Settings saved.");
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "An unexpected error occurred.",
      );
    }

    setLoading(false);
  };

  if (!data) return null;

  const isLive = data.environment === "live";

  return (
    <Flex justifyContent="center" alignItems="center" minHeight="100vh">
      <Box
        padding={7}
        width="100%"
        maxWidth="1000px"
        background="neutral0"
        borderRadius="8px"
        shadow="tableShadow"
      >
        <Flex justifyContent="center">
          <Typography variant="beta">Stripe Settings</Typography>
        </Flex>

        <Box marginTop={7}>
          <Flex wrap="wrap" gap={6} justifyContent="space-between">
            <Box width="48%">
              <Flex direction="column" alignItems="center" gap={3}>
                <Typography fontWeight="bold">Environment</Typography>
                <Flex alignItems="center" gap={3}>
                  <Switch
                    selected={isLive}
                    onChange={(checked) =>
                      setData({
                        ...data,
                        environment: checked ? "live" : "test",
                      })
                    }
                  />
                  <Typography
                    fontWeight="bold"
                    textColor={isLive ? "success600" : "warning600"}
                  >
                    {isLive ? "LIVE" : "TEST"}
                  </Typography>
                </Flex>
              </Flex>
            </Box>

            <Box width="48%">
              <Flex direction="column" gap={2}>
                <Typography textAlign="center">Checkout success URL</Typography>

                <Box width="80%">
                  <TextInput
                    value={data.checkout?.successUrl || ""}
                    onChange={(e) =>
                      setData({
                        ...data,
                        checkout: {
                          ...data.checkout,
                          successUrl: e.target.value,
                        },
                      })
                    }
                  />
                </Box>
              </Flex>
            </Box>

            <Box width="48%">
              <Flex direction="column" gap={2}>
                <Typography textAlign="center">Checkout cancel URL</Typography>

                <Box width="80%">
                  <TextInput
                    value={data.checkout?.cancelUrl || ""}
                    onChange={(e) =>
                      setData({
                        ...data,
                        checkout: {
                          ...data.checkout,
                          cancelUrl: e.target.value,
                        },
                      })
                    }
                  />
                </Box>
              </Flex>
            </Box>

            <Box width="48%">
              <Flex direction="column" gap={2}>
                <Typography textAlign="center">Webhook forward URL</Typography>

                <Box width="80%">
                  <TextInput
                    value={data.webhook?.forwardUrl || ""}
                    onChange={(e) =>
                      setData({
                        ...data,
                        webhook: {
                          ...data.webhook,
                          forwardUrl: e.target.value,
                        },
                      })
                    }
                  />
                </Box>
              </Flex>
            </Box>
            <Box width="100%">
              <Flex direction="column" gap={2}>
                <Typography textAlign="center">Currency</Typography>

                <Box width="38%">
                  <SingleSelect
                    value={data.currency || "eur"}
                    onChange={(value) => {
                      setData({
                        ...data,
                        currency: value,
                      });
                    }}
                    required
                  >
                    <SingleSelectOption value="eur">EUR (€)</SingleSelectOption>
                    <SingleSelectOption value="usd">USD ($)</SingleSelectOption>
                    <SingleSelectOption value="gbp">GBP (£)</SingleSelectOption>
                    <SingleSelectOption value="cad">
                      CAD (CA$)
                    </SingleSelectOption>
                  </SingleSelect>
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Box>

        <Flex justifyContent="flex-end" marginTop={7}>
          <Button loading={loading} onClick={save}>
            Save
          </Button>
        </Flex>

        <Box paddingTop={6}>
          {error && (
            <Box paddingBottom={4}>
              <Alert variant="danger" title="Save failed">
                {error}
              </Alert>
            </Box>
          )}

          {success && (
            <Box paddingBottom={4}>
              <Alert variant="success" title="Success">
                {success}
              </Alert>
            </Box>
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default SettingsPage;
