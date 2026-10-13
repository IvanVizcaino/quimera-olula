import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { PeriodoIva } from "../diseño.ts";

export type EstadoMaestroPeriodoIva = "INICIAL" | "CREANDO";

export type ContextoMaestroPeriodoIva = {
    estado: EstadoMaestroPeriodoIva;
    periodos: ListaActivaEntidades<PeriodoIva>;
    impuestoId: string;
};

const fmtFecha = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "—");

export const metaTablaPeriodoIva: MetaTabla<PeriodoIva> = [
    { id: "fechaDesde", cabecera: "Desde", render: (p) => fmtFecha(p.fechaDesde) },
    { id: "fechaHasta", cabecera: "Hasta", render: (p) => fmtFecha(p.fechaHasta) },
    { id: "iva", cabecera: "IVA (%)" },
    { id: "recargo", cabecera: "Recargo (%)" },
];

export const ordenDefectoPeriodoIva = ["fecha_desde", "DESC"];
