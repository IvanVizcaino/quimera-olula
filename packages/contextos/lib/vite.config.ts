/// <reference types="vitest" />
/// <reference types="vite/client" />

import { mergeConfig } from "vite";
import config from "../../../vite.config.ts";

export default mergeConfig(config, {
    test: {
        setupFiles: ["../../setupTests.ts"]
    }
});