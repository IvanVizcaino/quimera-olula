/// <reference types="vitest" />
/// <reference types="vite/client" />

import { mergeConfig } from "vite";
import config from "../../vite.config.ts";

export default mergeConfig(config, {
    resolve: {
        alias: {
            '#': '@olula/ctx',
        }
    },
    // server: {
    //     host: '0.0.0.0',  // Escucha en todas las interfaces de red
    //     port: 5173        // Opcional, se coje por defecto
    // },
    test: {
        setupFiles: ["../../setupTests.ts"]
    }
});