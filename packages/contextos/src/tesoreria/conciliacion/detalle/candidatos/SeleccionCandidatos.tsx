import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearMoneda } from "@olula/lib/dominio.js";
import { CandidatoListaConciliacion, MovimientoBancario } from "../../diseño.js";
import { diferenciaSeleccion, seleccionCuadra, sumaSeleccion } from "../../dominio.js";
import { TarjetaCandidato } from "./TarjetaCandidato.js";

/**
 * Candidatos reunidos para conciliarlos juntos: su suma frente al importe del movimiento
 * y la diferencia. Solo se concilian si la suma es exactamente la del movimiento; el
 * servidor lo vuelve a comprobar (PATCH `.../conciliar` con varios `items`).
 */
export const SeleccionCandidatos = ({
    movimiento,
    seleccion,
    divisa,
    bloqueado,
    publicar,
}: {
    movimiento: MovimientoBancario;
    seleccion: CandidatoListaConciliacion[];
    divisa: string;
    bloqueado: boolean;
    publicar: EmitirEvento;
}) => {
    const cuadra = seleccionCuadra(movimiento, seleccion);
    const diferencia = diferenciaSeleccion(movimiento, seleccion);

    return (
        <section className="seleccion-candidatos">
            <h4>Conciliar juntos</h4>
            <ul className="lista-candidatos">
                {seleccion.map((c) => (
                    <TarjetaCandidato key={c.id} candidato={c} movimiento={movimiento} divisa={divisa}
                        bloqueado={bloqueado} seleccionada publicar={publicar} />
                ))}
            </ul>
            <dl className="seleccion-candidatos-totales">
                <div>
                    <dt>Seleccionado</dt>
                    <dd>{formatearMoneda(sumaSeleccion(seleccion), divisa)}</dd>
                </div>
                <div>
                    <dt>Movimiento</dt>
                    <dd>{formatearMoneda(Math.abs(movimiento.importe), divisa)}</dd>
                </div>
                <div className={cuadra ? "cuadra" : "descuadra"}>
                    <dt>{diferencia < 0 ? "Sobra" : "Falta"}</dt>
                    <dd>{formatearMoneda(Math.abs(diferencia), divisa)}</dd>
                </div>
            </dl>
            <div className="botones">
                <QBoton variante="texto" onClick={() => publicar("seleccion_vaciada")}>
                    Vaciar
                </QBoton>
                <QBoton deshabilitado={bloqueado || !cuadra} onClick={() => publicar("seleccion_solicitada")}>
                    Conciliar {seleccion.length}
                </QBoton>
            </div>
        </section>
    );
};
