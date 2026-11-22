import { configCodigoDescripcion } from "../comun/codigo_descripcion.ts";
import { MaestroFiscal } from "../comun/maestro/MaestroFiscal.tsx";
import FISCAL_Urls from "../comun/urls.ts";

const config = configCodigoDescripcion({
    titulo: "Causas exención IVA Veri*Factu",
    nombre: "causa de exención",
    url: new FISCAL_Urls().CAUSA_EXENCION_IVA,
    regla: "comun.causa_exencion_iva",
});

/** Fiscalidad > Causas exención IVA Veri*Factu (veri_causasexencioniva). */
export const MaestroCausasExencionIva = () => <MaestroFiscal config={config} />;
