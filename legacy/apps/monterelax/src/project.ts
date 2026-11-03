import core from "@quimera-extension/core";
import login from "@quimera-extension/login";
import MrelaxErp from "@quimera-extension/monterelax-erp";

import MrelaxTheme from "./theme";

export default {
  path: "projects/monterelax",
  dependencies: [core, login, MrelaxErp],
  theme: MrelaxTheme,
} as unknown;