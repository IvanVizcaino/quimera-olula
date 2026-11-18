import { configCodigoDescripcion } from "../comun/codigo_descripcion.ts";
import { MaestroFiscal } from "../comun/maestro/MaestroFiscal.tsx";
import FISCAL_Urls from "../comun/urls.ts";

const config = configCodigoDescripcion({
    titulo: "Regímenes IVA Veri*Factu",
    nombre: "régimen de IVA",
    url: new FISCAL_Urls().REGIMEN_IVA_VERIFACTU,
    regla: "comun.regimen_iva_verifactu",
});

/** Fiscalidad > Regímenes IVA Veri*Factu (veri_regimenesiva). */
export const MaestroRegimenesIvaVerifactu = () => <MaestroFiscal config={config} />;
