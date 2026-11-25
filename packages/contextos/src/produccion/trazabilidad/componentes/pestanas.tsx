import { Tab } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { EntradasSalidasLote } from "../diseño.ts";
import { ArbolTrazabilidad } from "./ArbolTrazabilidad.tsx";
import { MovimientosLote } from "./MovimientosLote.tsx";

/**
 * Las pestañas de trazabilidad de un lote («Movimientos», «Hacia atrás», «Hacia delante») para
 * meterlas en unas `Tabs` (la ficha del lote de almacén y la pantalla de trazabilidad).
 */
export const pestanasTrazabilidad = (
    loteId: string,
    opciones: {
        abrirLote?: (loteId: string) => void;
        alCargarMovimientos?: (datos: EntradasSalidasLote | null) => void;
    } = {},
) => [
    <Tab key="tab-movimientos-lote" label="Movimientos">
        <MovimientosLote loteId={loteId} alCargar={opciones.alCargarMovimientos} />
    </Tab>,
    <Tab key="tab-trazabilidad-atras" label="Hacia atrás">
        <ArbolTrazabilidad loteId={loteId} sentido="atras" abrirLote={opciones.abrirLote} />
    </Tab>,
    <Tab key="tab-trazabilidad-adelante" label="Hacia delante">
        <ArbolTrazabilidad loteId={loteId} sentido="adelante" abrirLote={opciones.abrirLote} />
    </Tab>,
];
