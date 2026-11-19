import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoCodigoBalance } from "../diseño.ts";
import { codigoBalanceVacio, metaCodigoBalance } from "../dominio.ts";

/** `codbalance` es varchar(15) en `co_codbalances08`. */
export const LONGITUD_MAXIMA_CODIGO = 15;

export const metaNuevoCodigoBalance: MetaModelo<NuevoCodigoBalance> = {
    campos: {
        id: { requerido: true, maximo: LONGITUD_MAXIMA_CODIGO },
        ...(metaCodigoBalance.campos as MetaModelo<NuevoCodigoBalance>["campos"]),
    },
};

export const nuevoCodigoBalanceInicial = (): NuevoCodigoBalance => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { orden3, ...resto } = codigoBalanceVacio();
    return resto;
};
