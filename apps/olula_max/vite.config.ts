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
    server: {
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