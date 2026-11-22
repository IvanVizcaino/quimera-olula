import { Entidad, Modelo } from "@olula/lib/diseño.ts";

/** Tabla `gruposcontablesivaneg` (veri_gruposcontivaneg.ui). */
export interface DatosGrupoIvaNegocio extends Modelo {
    descripcion: string;
    modelo349: boolean;
    siiClaveOperacionEmitidas: string;
    siiClaveOperacionRecibidas: string;
    siiTipoNoExentaEmitidas: string;
    siiCausaExentaEmitidas: string;
    regimenIva: string;
    regimenIvaVerifactu: string;
    causaExencionIvaVerifactu: string;
    isp: boolean;
    sinIva: boolean;
    aplicarRecargo: boolean;
    siiExentaIva: boolean;
    siiServicios: boolean;
    ventasADistancia: boolean;
    agrario: boolean;
    criterioCaja: boolean;
}

export interface GrupoIvaNegocioFiscal extends Entidad, DatosGrupoIvaNegocio {
    id: string;
    descripcionRegimenIvaVerifactu: string;
    descripcionCausaExencionIvaVerifactu: string;
}

export interface NuevoGrupoIvaNegocio extends DatosGrupoIvaNegocio {
    id: string;
}
