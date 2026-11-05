import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { useEsMovil } from "@olula/componentes/maestro/useEsMovil.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearMoneda } from "@olula/lib/dominio.ts";
import { PartidaAsiento } from "../../diseño.ts";
import { descuadrePartidas, totalDebe, totalHaber } from "../../dominio.ts";
import "./PartidasAsientoLista.css";

const metaTablaPartida: MetaTabla<PartidaAsiento> = [
    {
        id: "codigoSubcuenta",
        cabecera: "Subcuenta",
        prioridad: "alta",
        render: (p) => p.codigoSubcuenta || String(p.subcuentaId),
    },
    { id: "debe", cabecera: "Debe", tipo: "moneda", prioridad: "alta" },
    { id: "haber", cabecera: "Haber", tipo: "moneda", prioridad: "alta" },
    { id: "concepto", cabecera: "Concepto", prioridad: "baja" },
    {
        id: "esIva",
        cabecera: "IVA",
        prioridad: "media",
        render: (p) => (p.esIva ? "SI" : "NO"),
    },
];

// Las partidas vienen embebidas en el asiento, así que se ordenan y paginan en
// memoria: no hay consulta que lanzar al servidor.
const criteriaPartidasDefecto: Criteria = { ...criteriaDefecto };

export const PartidasAsientoLista = ({ partidas }: { partidas: PartidaAsiento[] }) => {
    const esMovil = useEsMovil();
    const descuadre = descuadrePartidas(partidas);

    return (
        <div className="PartidasAsientoLista">
            <h3>Partidas</h3>
            <ListadoSemiControlado
                metaTabla={metaTablaPartida}
                entidades={partidas}
                totalEntidades={partidas.length}
                seleccionada={null}
                onSeleccion={() => {}}
                criteriaInicial={criteriaPartidasDefecto}
                modoInicial={esMovil ? "tarjetas" : "tabla"}
                onCriteriaChanged={(_: Criteria) => null}
            />
            <div className="totales-asiento">
                <div className="totales-asiento-item">
                    <label>Debe:</label>
                    <span>{formatearMoneda(totalDebe(partidas), "EUR")}</span>
                </div>
                <div className="totales-asiento-item">
                    <label>Haber:</label>
                    <span>{formatearMoneda(totalHaber(partidas), "EUR")}</span>
                </div>
                {Math.abs(descuadre) >= 0.005 && (
                    <div className="totales-asiento-item totales-asiento-item--descuadre">
                        <label>Descuadre:</label>
                        <span>{formatearMoneda(descuadre, "EUR")}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
