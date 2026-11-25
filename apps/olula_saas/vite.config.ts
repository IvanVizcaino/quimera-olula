/// <reference types="vitest" />
/// <reference types="vite/client" />

import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import config from "../../vite.config.ts";

// Olula SaaS: el ERP (VITE_API_URL -> app olula_saas del servidor) y, para el
// registro público, el backoffice (VITE_API_SAAS_ADMIN_URL -> olula_saas_admin).
export default mergeConfig(config, {
    resolve: {
        alias: {
            '#': '@olula/ctx',
        }
    },
    server: {
        allowedHosts: true,
    },
    // Dos páginas: la app y la demo de los módulos («Módulos disponibles» › Probar).
    build: {
        rollupOptions: {
            input: {
                main: fileURLToPath(new URL("./index.html", import.meta.url)),
                demo: fileURLToPath(new URL("./demo.html", import.meta.url)),
            },
        },
    },
    test: {
        setupFiles: ["../../setupTests.ts"]
    }
});
