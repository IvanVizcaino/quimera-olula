import { createTheme, ThemeProvider } from "@quimera/styles";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import React, { useEffect, useState } from "react";
import { initReactI18next } from "react-i18next";

import { AppProvider } from "../../contexts";
import { useWidth } from "../../hooks";
import {
  buildView,
  getRoutes,
  getTheme,
  getTranslations,
  getView,
  loadProject,
  loadView,
} from "../../hooks/useManager";
import util from "../../util";

export default function App({ project, environment }) {
  const [loading, setLoading] = useState(true);
  const [globalView, setGlobalView] = useState([[{}, {}], {}, [], {}]);

  const Container = loading ? null : buildView("Container");
  util.setEnvironment(environment);
  util.setMediaWidth(useWidth());

  const needsLogin = !loading && "/login" in getRoutes();
  const Login = needsLogin ? buildView("Login", { onLogin: () => noexiste(true) }) : null;

  const [[appReducer, appInitialState], appApiClient] = loading
    ? [[{}, {}], {}, [], {}]
    : globalView;

  const MUITheme = loading ? null : createTheme(getTheme());
  const title = environment.getCurrentTitle() || "Quimera";
  const visibleLoading = environment.inDevelopment() ? "visible" : "hidden";

  async function loadApp() {
    await loadProject(project);
    await loadView("Container");
    await loadView("Global");
    setGlobalView(getView("Global"));
    setLoading(false);
  }

  useEffect(() => {
    loadApp();
  }, []);

  useEffect(() => {
    if (!loading) {
      i18n
        // detect user language
        // learn more: https://github.com/i18next/i18next-browser-languageDetector
        .use(LanguageDetector)
        // pass the i18n instance to react-i18next.
        .use(initReactI18next)
        // init i18next
        // for all options read: https://www.i18next.com/overview/configuration-options
        .init({
          debug: true,
          fallbackLng: "es",
          interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
          },
          resources: getTranslations(),
        });
      util.setTranslateFunction(i18n.t);
    }
  }, [loading]);

  return loading ? (
    <div style={{ visibility: visibleLoading }}>Loading app</div>
  ) : (
    <ThemeProvider theme={MUITheme}>
      <title>{title}</title>
      <AppProvider
        reducer={appReducer}
        apiClient={appApiClient}
        initialState={{
          ...appInitialState,
          environment,
        }}
      >
        {Container}
      </AppProvider>
    </ThemeProvider>
  );
}
