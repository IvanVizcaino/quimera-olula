import { MaestroPeriodoIva } from "#/comun/periodo_iva/maestro/MaestroPeriodoIva.tsx";
import { rutaConPlugin } from "@olula/lib/plugins.tsx";

/** T6.3: CRUD periodos IVA (`cambio_iva`); HTTP solo en backend Crema. */
export class RouterFactoryComunCremaCafe {
    static router = {
        "comun/periodo_iva": rutaConPlugin("cambio_iva", MaestroPeriodoIva),
    };
}
