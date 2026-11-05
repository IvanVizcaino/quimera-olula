import { EmitirEvento } from "@olula/lib/diseño.ts";
import {
    CandidatoConciliacion, CandidatoListaConciliacion, Conciliacion, MovimientoBancario, PartidaHuerfana,
    RemesaCandidata,
} from "../diseño.js";
import { bloqueoConciliarMovimientoBancario } from "../dominio.js";
import { CandidatosConciliacion } from "./candidatos/CandidatosConciliacion.js";
import { ConciliacionesMovimiento } from "./conciliaciones/ConciliacionesMovimiento.js";
import "./TabConciliacion.css";

interface TabConciliacionProps {
    movimiento: MovimientoBancario;
    conciliaciones: Conciliacion[];
    candidatos: CandidatoConciliacion[];
    candidatosTexto: string;
    remesas: RemesaCandidata[];
    partidas: PartidaHuerfana[];
    seleccion: CandidatoListaConciliacion[];
    publicar: EmitirEvento;
}

/**
 * Búsqueda de candidatos para conciliar un movimiento pendiente o con
 * candidatos. Muestra las conciliaciones propuestas y la lista única de
 * recibos, remesas y partidas contables con su buscador. Solo se monta cuando el movimiento puede conciliarse (estado
 * pendiente o candidatos).
 */
export const TabConciliacion = ({
    movimiento, conciliaciones, candidatos, candidatosTexto, remesas, partidas, seleccion, publicar,
}: TabConciliacionProps) => {

    const bloqueo = bloqueoConciliarMovimientoBancario(movimiento);

    return (
        <div className="TabConciliacion">
            {movimiento.estado === "candidatos" && conciliaciones.length > 0 && (
                <ConciliacionesMovimiento
                    movimiento={movimiento}
                    conciliaciones={conciliaciones}
                    bloqueo={bloqueo}
                    publicar={publicar}
                />
            )}

            <CandidatosConciliacion
                movimiento={movimiento}
                candidatos={candidatos}
                remesas={remesas}
                partidas={partidas}
                texto={candidatosTexto}
                seleccion={seleccion}
                bloqueo={bloqueo}
                publicar={publicar}
            />
        </div>
    );
};
