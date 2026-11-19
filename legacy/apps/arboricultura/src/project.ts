import core from "@quimera-extension/core";
import login from "@quimera-extension/login";
import vbarbaFacturacion from "@quimera-extension/vbarba-facturacion";
import vbarbaFirmaAlb from "@quimera-extension/vbarba-firma_albaranes";
import vbarbaTheme from "./theme";

export default {
  path: "apps/arboricultura",
  dependencies: [core, login, vbarbaFacturacion, vbarbaFirmaAlb],
  theme: vbarbaTheme,
} as unknown;
