import core from "@quimera-extension/core";
import login from "@quimera-extension/login";
import vbarbaAlmacen from "@quimera-extension/vbarba-almacen";
import vbarbaAlmacenSoloPartesCarros from "@quimera-extension/vbarba-almacen/soloPartesCarros";
import vbarbaFacturacion from "@quimera-extension/vbarba-facturacion";
import vbarbaFirmaAlb from "@quimera-extension/vbarba-firma_albaranes";
import vbarbaTheme from "./theme";

export default {
  path: "apps/barnaplant",
  dependencies: [core, login, vbarbaFacturacion, vbarbaFirmaAlb, vbarbaAlmacen, vbarbaAlmacenSoloPartesCarros],
  theme: vbarbaTheme,
} as unknown;
