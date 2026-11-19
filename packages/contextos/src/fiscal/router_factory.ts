import { MaestroCausasExencionIva } from "./causa_exencion_iva/MaestroCausasExencionIva.tsx";
import { EjerciciosFiscales } from "./ejercicio/EjerciciosFiscales.tsx";
import { MaestroGruposIvaNegocio } from "./grupo_iva_negocio/MaestroGruposIvaNegocio.tsx";
import { MaestroImpuestos } from "./impuesto/MaestroImpuestos.tsx";
import { MaestroRegimenesIvaVerifactu } from "./regimen_iva_verifactu/MaestroRegimenesIvaVerifactu.tsx";
import { MaestroSeries } from "./serie/MaestroSeries.tsx";

export class RouterFactoryFiscalOlula {
    static router = {
        "fiscal/ejercicio": EjerciciosFiscales,
        "fiscal/serie": MaestroSeries,
        "fiscal/impuesto": MaestroImpuestos,
        "fiscal/grupo_iva_negocio": MaestroGruposIvaNegocio,
        "fiscal/regimen_iva_verifactu": MaestroRegimenesIvaVerifactu,
        "fiscal/causa_exencion_iva": MaestroCausasExencionIva,
    };
}
