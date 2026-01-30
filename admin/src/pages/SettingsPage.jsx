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
} from "@strapi/design-system";
import { useFetchClient } from "@strapi/strapi/admin";

const SettingsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { get, put } = useFetchClient();

  useEffect(() => {
    const load = async () => {
      const res = await get("/strapi5-plugin-stripe/settings");

      setData({
        environment: res.data?.environment ?? "test",
        currency: res.data?.currency ?? "eur",
        checkout: res.data?.checkout ?? {},
        webhook: res.data?.webhook ?? {},
      });

      console.log(res);
    };

    load();
  }, []);

  const save = async () => {
    setLoading(true);
    await put("/strapi5-plugin-stripe/settings", data);
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
                      (setData({
                        ...data,
                        currency: value,
                      }),
                        console.log(value));
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
      </Box>
    </Flex>
  );
};

export default SettingsPage;
