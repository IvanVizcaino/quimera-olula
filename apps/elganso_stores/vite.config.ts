/// <reference types="vitest" />
/// <reference types="vite/client" />

import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import { mergeConfig } from "vite";
import config from "../../vite.config.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const legacyStylesPath = path.resolve(__dirname, "../../legacy/apps/elganso-stores/styles");
const legacyBaseMixinPath = path.resolve(__dirname, "../../legacy/libs/styles/_mixin.scss");

export default mergeConfig(config, {
    resolve: {
        alias: {
            '#': '@olula/ctx',
            'use-db-state': new URL('./node_modules/use-db-state', import.meta.url).pathname,
            '@olula/lib': import.meta.dirname + '/../../packages/lib/src'
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "${legacyBaseMixinPath}" as *;\n@use "${legacyStylesPath}/_clientMixin.scss" as *;`,
                loadPaths: [legacyStylesPath, path.dirname(legacyBaseMixinPath)]
            }
        }
    }
});