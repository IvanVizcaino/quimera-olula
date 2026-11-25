/// <reference types="vitest" />
/// <reference types="vite/client" />

import { mergeConfig } from "vite";
import config from "../../vite.config.ts";

// olula_max: la app olula con los plugins de olula_max (servidor `main.py olula_max`).
// Puerto propio (5185) para poder tenerla levantada a la vez que olula (5173).
// La URL del servidor se indica con VITE_API_URL (p.ej. en un `.env` de esta carpeta).
export default mergeConfig(config, {
    resolve: {
        alias: {
            '#': '@olula/ctx',
        }
    },
    server: {
        port: 5185,
        strictPort: true,
        allowedHosts: true,
        proxy: {
            '/public': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
    test: {
        setupFiles: ["../../setupTests.ts"]
    }
});
