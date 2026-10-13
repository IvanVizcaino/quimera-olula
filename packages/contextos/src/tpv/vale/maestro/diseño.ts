import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ValeEmitido } from "../diseño.ts";

export type EstadoMaestroVales = "INICIAL" | "ANULANDO";

export type ContextoMaestroVales = {
    estado: EstadoMaestroVales;
    vales: ListaActivaEntidades<ValeEmitido>;
};

export const metaTablaVales: MetaTabla<ValeEmitido> = [
    { id: "id", cabecera: "Código" },
    { id: "fecha", cabecera: "Fecha" },
    { id: "nombreCliente", cabecera: "Cliente", render: (v: ValeEmitido) => v.nombreCliente ?? "" },
    { id: "saldoInicial", cabecera: "Saldo inicial", tipo: "moneda" },
    { id: "saldoPendiente", cabecera: "Saldo pendiente", tipo: "moneda" },
    { id: "anulado", cabecera: "Anulado", render: (v: ValeEmitido) => v.anulado ? "Sí" : "No" },
];
