import { getTranslation } from "./utils/getTranslation";
import { PLUGIN_ID } from "./pluginId";
import { Initializer } from "./components/Initializer";
import { PluginIcon } from "./components/PluginIcon";

export default {
  register(app) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: "Strapi 5 Plugin Stripe",
      },
      Component: async () => {
        const { App } = await import("./pages/App");

        return App;
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: "Strapi 5 Plugin Stripe",
    });

    app.createSettingSection(
      {
        id: PLUGIN_ID,
        intlLabel: { id: PLUGIN_ID, defaultMessage: "Stripe configuration" },
      },
      [
        {
          id: PLUGIN_ID,
          intlLabel: {
            id: `${PLUGIN_ID}.settings.title`,
            defaultMessage: "Stripe",
          },
          to: `/settings/${PLUGIN_ID}`,
          Component: async () => import("./pages/SettingsPage"),
          permissions: [],
        },
      ],
    );
  },

  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(
            `./translations/${locale}.json`
          );

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      }),
    );
  },
};
