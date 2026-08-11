import { ConfigTpv } from "../config/diseño.ts";
import { getConfigTpv } from "../config/infraestructura.ts";

export const divisaTpv = 'EUR';

let _configCache: ConfigTpv | null = null;

export const getTpvConfig = async (): Promise<ConfigTpv> => {
    if (!_configCache) {
        _configCache = await getConfigTpv();
    }
    return _configCache;
};