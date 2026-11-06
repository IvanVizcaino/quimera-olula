import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.js";
import { ReactNode } from "react";
import { CandidatoListaConciliacion, MovimientoBancario } from "../../diseño.js";
import {
    admiteSeleccion,
    esConciliacionParcial,
    esIngresoMovimientoBancario,
    esRemesaDeNominas,
    etiquetaTipoConciliacion,
    importePartidaCoincide,
    urlAsiento,
    urlRecibo,
    urlRemesa,
} from "../../dominio.js";

const diasTexto = (dias: number): string => ` (${dias > 0 ? "+" : ""}${dias})`;

/**
 * Tarjeta compacta de un candidato en dos filas, con la casilla para conciliarlo junto a otros:
 *   ☐ | identificación | importe       | acción directa
 *     | tipo · detalle | fecha (+días) | Ver
 * Las columnas vienen de la lista (subgrid), así quedan alineadas entre tarjetas.
 * Seleccionada (en la zona de selección) no tiene acción directa: se concilia con las demás.
 */
export const TarjetaCandidato = ({
    candidato,
    movimiento,
    divisa,
    bloqueado,
    seleccionada = false,
    publicar,
}: {
    candidato: CandidatoListaConciliacion;
    movimiento: MovimientoBancario;
    divisa: string;
    bloqueado: boolean;
    seleccionada?: boolean;
    publicar: EmitirEvento;
}) => {
    const { titulo, detalle, importe, fecha, accion, ver } = contenidoTarjeta(
        candidato, movimiento, bloqueado, publicar
    );
    const admite = admiteSeleccion(candidato, movimiento);
    return (
        <li className={`tarjeta-candidato tarjeta-candidato-${candidato.clase}`}>
            <div className="tarjeta-candidato-casilla"
                title={admite ? "Conciliar junto a otros candidatos" : "Un parcial no se suma a otros candidatos"}>
                <QCheckbox
                    label=""
                    nombre={`seleccion-${candidato.id}`}
                    valor={seleccionada}
                    deshabilitado={!admite}
                    condensado
                    onChange={(valor) => valor === "true"
                        ? publicar("candidato_añadido", candidato)
                        : publicar("candidato_quitado", candidato.id)}
                />
            </div>
            <span className="tarjeta-candidato-codigo">{titulo}</span>
            <strong className="tarjeta-candidato-importe">{formatearMoneda(importe, divisa)}</strong>
            <div className="tarjeta-candidato-accion">{!seleccionada && accion}</div>
            <small className="tarjeta-candidato-detalle" title={detalle ?? undefined}>
                <span className="tarjeta-candidato-tipo">{etiquetaTipoConciliacion(candidato.tipo)}</span>
                {detalle && ` · ${detalle}`}
            </small>
            <small className="tarjeta-candidato-fecha">{fecha}</small>
            <div className="tarjeta-candidato-accion">
                <QBoton tamaño="pequeño" variante="borde" ancho enlace={ver}>
                    Ver
                </QBoton>
            </div>
        </li>
    );
};

type ContenidoTarjeta = {
    titulo: ReactNode;
    detalle: string | null;
    importe: number;
    fecha: string;
    /** Conciliar solo este candidato; null si no cubre por sí solo el movimiento. */
    accion: ReactNode;
    /** Enlace del botón "Ver" */
    ver: string;
};

const contenidoTarjeta = (
    candidato: CandidatoListaConciliacion,
    movimiento: MovimientoBancario,
    bloqueado: boolean,
    publicar: EmitirEvento,
): ContenidoTarjeta => {
    switch (candidato.clase) {
        case "recibo": {
            const r = candidato.recibo;
            return {
                titulo: <>{r.codigo}{r.facturaCodigo && <small>Factura {r.facturaCodigo}</small>}</>,
                detalle: r.tercero,
                importe: r.importe,
                fecha: formatearFechaDate(r.fechaVencimiento) + diasTexto(r.diasDiferencia),
                ver: urlRecibo(r.tipoRecibo, r.reciboId),
                // Un recibo menor que el movimiento solo se concilia sumado a otros.
                accion: r.encaje === "menor" ? null : (
                    <QBoton tamaño="pequeño" ancho deshabilitado={bloqueado}
                        onClick={() => publicar("candidato_solicitado", r)}>
                        {esConciliacionParcial(r.tipoConciliacion) ? "Parcial" : "Conciliar"}
                    </QBoton>
                ),
            };
        }
        case "remesa": {
            const r = candidato.remesa;
            const parcial = r.tipoConciliacion === "cobro_parcial_remesa";
            const recibos = esIngresoMovimientoBancario(movimiento)
                ? `${r.recibos.length} recibos pendientes`
                : `${r.recibos.length} ${esRemesaDeNominas(r) ? "nóminas" : "recibos"}`;
            const propuestos = !parcial
                ? ""
                : r.reciboIdsPropuestos.length === 0
                    ? " · sin combinación que cuadre"
                    : ` · ${r.reciboIdsPropuestos.length} propuestos${r.propuestaAmbigua ? " (puede haber otras)" : ""}`;
            return {
                titulo: <>Remesa {r.id}<small>{formatearFechaDate(r.fecha)}</small></>,
                detalle: recibos + propuestos,
                importe: r.importePendiente,
                fecha: formatearFechaDate(r.fechaCargo) + diasTexto(r.diasDiferencia),
                ver: urlRemesa(r.id, r.tipoConciliacion),
                accion: (
                    <QBoton tamaño="pequeño" ancho deshabilitado={bloqueado}
                        onClick={() => publicar("remesa_solicitada", r)}>
                        {parcial ? "Parcial" : "Conciliar"}
                    </QBoton>
                ),
            };
        }
        case "partida": {
            const p = candidato.partida;
            return {
                titulo: <>Asiento {p.numeroAsiento ?? `#${p.idasiento}`}</>,
                detalle: p.descripcion,
                importe: p.importe,
                fecha: formatearFechaDate(p.fecha),
                ver: urlAsiento(String(p.idasiento)),
                accion: (
                    <QBoton tamaño="pequeño" ancho deshabilitado={!importePartidaCoincide(p, movimiento)}
                        onClick={() => publicar("asiento_vinculado_confirmado",
                            { idasiento: p.idasiento, importe: p.importe })}>
                        Vincular
                    </QBoton>
                ),
            };
        }
    }
};
