import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.ts";
import { Conciliacion, ItemConciliacion, MovimientoBancario } from "../../diseño.js";
import {
    BloqueoConciliarMovimiento,
    esConciliacionRemesaPago,
    esRemesaDeNominas,
    etiquetaOrigenConciliacion,
    etiquetaTipoConciliacion,
    reciboIdsConciliacionRemesa,
    urlAsientoConciliacion,
    urlReciboConciliacion,
    urlRemesaConciliacion,
    varianteProbabilidad,
} from "../../dominio.js";
import "./ConciliacionesMovimiento.css";

/** Descripción de un ítem individual dentro de una casación. */
const DescripcionItem = ({ item, divisa }: { item: ItemConciliacion; divisa: string }) => {
    const url = urlReciboConciliacion(item);
    const urlRemesa = urlRemesaConciliacion(item);
    const recibosRemesa = reciboIdsConciliacionRemesa(item);
    const urlAsiento = item.asiento ? urlAsientoConciliacion(item) : null;
    return (
        <span className="item-conciliacion">
            <span className="tipo-conciliacion">
                {etiquetaTipoConciliacion(item.tipo)}
                {item.recibo && ` · ${item.recibo.codigo}`}
                {item.remesa && ` · remesa ${item.remesa.id}`}
                {item.asiento && ` · asiento ${item.asiento.numero ?? `#${item.asiento.id}`}`}
            </span>
            {item.asiento && (
                <span className="recibo-conciliacion">
                    {`${formatearFechaDate(item.asiento.fecha)} · ${formatearMoneda(item.asiento.importe, divisa)}`}
                    {item.asiento.concepto && ` · ${item.asiento.concepto}`}
                </span>
            )}
            {item.remesa && (
                <span className="recibo-conciliacion">
                    {esConciliacionRemesaPago(item.tipo)
                        ? `Pago ${formatearFechaDate(item.remesa.fechaCargo)} · `
                        + `${item.remesa.numRecibos} ${esRemesaDeNominas(item.remesa) ? "nóminas" : "recibos"}`
                        + ` · total ${formatearMoneda(item.remesa.total, divisa)}`
                        : `Cargo ${formatearFechaDate(item.remesa.fechaCargo)} · `
                        + (recibosRemesa
                            ? `${recibosRemesa.length} de ${item.remesa.numRecibos} recibos`
                            : `recibos pendientes de ${item.remesa.numRecibos}`)
                        + ` · total ${formatearMoneda(item.remesa.total, divisa)}`}
                </span>
            )}
            {item.cuota && (
                <span className="recibo-conciliacion">
                    {`${item.cuota.contrato ?? "Préstamo"} · ${formatearFechaDate(item.cuota.fecha)} · ${formatearMoneda(item.cuota.capital, divisa)} de capital y ${formatearMoneda(item.cuota.intereses, divisa)} de intereses`}
                </span>
            )}
            {item.recibo && (
                <span className="recibo-conciliacion">
                    {`${item.recibo.tercero ?? "Sin tercero"} · ${formatearMoneda(item.recibo.importe, divisa)} · vence ${formatearFechaDate(item.recibo.fechaVencimiento)}`}
                </span>
            )}
            {url && (
                <QBoton tamaño="pequeño" variante="borde" enlace={url}>
                    Ver recibo
                </QBoton>
            )}
            {urlAsiento && (
                <QBoton tamaño="pequeño" variante="borde" enlace={urlAsiento}>
                    Ver asiento
                </QBoton>
            )}
            {urlRemesa && (
                <QBoton tamaño="pequeño" variante="borde" enlace={urlRemesa}>
                    Ver remesa
                </QBoton>
            )}
        </span>
    );
};

/**
 * Conciliaciones candidatas propuestas por las reglas o la IA (GET `.../conciliaciones`),
 * de más a menos probable. Cada conciliación puede tener varios ítems ERP (1:M).
 * "Conciliar" abre el modal de confirmación a través de `conciliacion_solicitada`.
 */
export const ConciliacionesMovimiento = ({
    movimiento,
    conciliaciones,
    bloqueo,
    publicar,
}: {
    movimiento: MovimientoBancario;
    conciliaciones: Conciliacion[];
    bloqueo: BloqueoConciliarMovimiento;
    publicar: EmitirEvento;
}) => {
    const divisa = movimiento.divisa ?? "EUR";

    return (
        <div className="ConciliacionesMovimiento">
            <h4>Conciliaciones propuestas</h4>
            <ul>
                {conciliaciones.map((conciliacion) => (
                    <li key={conciliacion.id}>
                        <QEtiqueta variante={varianteProbabilidad(conciliacion.probabilidad)}>
                            {`${conciliacion.probabilidad} %`}
                        </QEtiqueta>
                        <div className="descripcion-conciliacion">
                            {conciliacion.items.map((item, i) => (
                                <DescripcionItem key={i} item={item} divisa={divisa} />
                            ))}
                            {conciliacion.justificacion && (
                                <span className="justificacion-conciliacion">
                                    {`${etiquetaOrigenConciliacion(conciliacion.origen)}: ${conciliacion.justificacion}`}
                                </span>
                            )}
                        </div>
                        <div className="acciones-conciliacion">
                            <QBoton
                                tamaño="pequeño"
                                deshabilitado={bloqueo.bloqueado}
                                onClick={() => publicar("conciliacion_solicitada", conciliacion)}
                            >
                                Conciliar
                            </QBoton>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
