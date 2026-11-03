import login from "@quimera-extension/login";
import vbarbaFacturacion from "@quimera-extension/vbarba-facturacion";

import core from "quimera";
import vbarbaTheme from "./theme";

export default {
  path: "apps/arboricultura",
  dependencies: [core, login, vbarbaFacturacion],
  theme: vbarbaTheme,
} as unknown;
