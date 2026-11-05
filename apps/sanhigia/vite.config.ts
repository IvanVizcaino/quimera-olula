/// <reference types="vitest" />
/// <reference types="vite/client" />

import { mergeConfig } from "vite";
import config from "../../vite.config.ts";

export default mergeConfig(config, {
    resolve: {
        alias: {
            '#': '@olula/ctx',
            'hookrouter': import.meta.dirname + '/node_modules/hookrouter',
            '@olula/lib': import.meta.dirname + '/../../packages/contextos/lib/src',
        }
    }
});