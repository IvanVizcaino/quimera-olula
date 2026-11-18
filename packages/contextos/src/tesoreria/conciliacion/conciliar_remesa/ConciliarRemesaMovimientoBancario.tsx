import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useState } from "react";
import { MovimientoBancario, RemesaCandidata } from "../diseño.js";
import {
    cuadraRemesa,
    esConciliacionRemesaPago,
    esRemesaDeNominas,
    importeRecibosRemesa,
} from "../dominio.js";
import "./ConciliarRemesaMovimientoBancario.css";

/**
 * Conciliación con una remesa de cobro: el usuario confirma qué recibos
 * pendientes paga el movimiento. Parte de los que propone el servidor (todos
 * si la remesa cuadra entera) y solo deja conciliar si suman exactamente el
 * importe del movimiento. Una remesa de pago se paga siempre entera: se
 * muestran sus recibos o nóminas, todos marcados y sin poder cambiarlos. La
 * llamada a la API vive en detalle/detalle.ts (onConciliadoRemesa), que recibe
 * los ids como payload.
 */
export const ConciliarRemesaMovimientoBancario = ({
    movimiento,
    remesa,
    publicar,
}: {
    movimiento: MovimientoBancario;
    remesa: RemesaCandidata;
    publicar: EmitirEvento;
}) => {
    const [reciboIds, setReciboIds] = useState<string[]>(remesa.reciboIdsPropuestos);

    const conciliar_ = async () => publicar("conciliacion_remesa_confirmada", reciboIds);
    const cancelar_ = () => publicar("conciliacion_cancelada");

    const [conciliar, cancelar] = useForm(conciliar_, cancelar_);

    const marcar = (reciboId: string, marcado: boolean) =>
        setReciboIds((actuales) =>
            marcado ? [...actuales, reciboId] : actuales.filter((id) => id !== reciboId));

    const divisa = movimiento.divisa ?? "EUR";
    const importeMovimiento = Math.abs(movimiento.importe);
    const seleccionado = importeRecibosRemesa(remesa, reciboIds);
    const cuadra = cuadraRemesa(movimiento, remesa, reciboIds);
    const todos = reciboIds.length === remesa.recibos.length;
    const dePago = esConciliacionRemesaPago(remesa.tipoConciliacion);
    const lineas = esRemesaDeNominas(remesa) ? "nóminas" : "recibos";

    return (
        <QModal abierto={true} nombre="conciliarRemesaMovimientoBancario"
            titulo={`Remesa ${remesa.id}`} onCerrar={cancelar}>
            <div className="ConciliarRemesaMovimientoBancario">
                {dePago ? (
                    <p>
                        {`Remesa de pago con fecha de pago el ${formatearFechaDate(remesa.fechaCargo)} · `}
                        {`${remesa.recibos.length} ${lineas} por ${formatearMoneda(remesa.total, divisa)}. `}
                        Se paga entera con el cargo.
                    </p>
                ) : (
                    <p>
                        {`Cargo el ${formatearFechaDate(remesa.fechaCargo)} · ${remesa.recibos.length} recibos pendientes por `}
                        {formatearMoneda(remesa.importePendiente, divisa)}
                        {`. Marca los recibos que paga el movimiento de ${formatearMoneda(importeMovimiento, divisa)}.`}
                    </p>
                )}

                {remesa.tipoConciliacion === "cobro_parcial_remesa" && remesa.reciboIdsPropuestos.length === 0 && (
                    <QAviso variante="advertencia">
                        No se ha encontrado ninguna combinación de recibos que cuadre con el importe: elígelos a mano.
                    </QAviso>
                )}
                {remesa.propuestaAmbigua && (
                    <QAviso variante="advertencia">
                        Puede haber otras combinaciones de recibos por el mismo importe: comprueba que la propuesta es la buena.
                    </QAviso>
                )}

                <ul className="recibos-remesa">
                    {remesa.recibos.map((recibo) => (
                        <li key={recibo.reciboId}>
                            <QCheckbox
                                nombre={`recibo-remesa-${recibo.reciboId}`}
                                label={`${recibo.codigo} · ${recibo.tercero ?? (dePago ? "—" : "Sin cliente")}`}
                                valor={reciboIds.includes(recibo.reciboId)}
                                onChange={(valor) => marcar(recibo.reciboId, valor === "true")}
                                soloLectura={dePago}
                                condensado
                            />
                            <span className="importe-recibo">{formatearMoneda(recibo.importe, divisa)}</span>
                        </li>
                    ))}
                </ul>

                <p className={cuadra ? "resumen-remesa" : "resumen-remesa descuadre"}>
                    {`${reciboIds.length} ${lineas} por ${formatearMoneda(seleccionado, divisa)}`}
                    {cuadra
                        ? todos ? " · la remesa quedará pagada." : " · la remesa seguirá emitida con el resto."
                        : ` · faltan ${formatearMoneda(Math.round((importeMovimiento - seleccionado) * 100) / 100, divisa)} para cuadrar.`}
                </p>

                <div className="botones maestro-botones">
                    <QBoton onClick={conciliar} deshabilitado={!cuadra}>Conciliar</QBoton>
                </div>
            </div>
        </QModal>
    );
};
