import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Entidad } from "@olula/lib/diseño.ts";
import { Link } from "react-router";
import { NecesidadReposicion } from "./diseño.ts";
import {
    necesidadSeleccionable, ParteSituacion, puedeGenerarSeleccion, puedeGenerarTraspaso, situacion,
    textoArticulo, textoOrigenes, todasSeleccionadas,
} from "./dominio.ts";
import { contextoReposicionInicial, getMaquina } from "./maquina.ts";
import "#/comun/estilos/pagina_proceso.css";
import "./ReposicionPicking.css";

export const ReposicionPicking = () => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoReposicionInicial);
    const { estado, almacenId, reposicion, seleccion } = ctx;

    return (
        <div className="ReposicionPicking PaginaProceso">
            <h2>Reposición de picking</h2>

            <quimera-formulario>
                <Almacen
                    label="Almacén"
                    nombre="almacenId"
                    valor={almacenId}
                    onChange={(opcion) => emitir("almacen_cambiado", opcion?.valor ?? "")}
                />
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton deshabilitado={!almacenId} onClick={() => emitir("calculo_solicitado")}>
                    Calcular
                </QBoton>
                {estado === "CALCULADO" && puedeGenerarTraspaso(reposicion) && (
                    <QBoton
                        variante="texto"
                        onClick={() => emitir("seleccion_todas_cambiada", !todasSeleccionadas(reposicion, seleccion))}
                    >
                        {todasSeleccionadas(reposicion, seleccion) ? "Desmarcar todos" : "Marcar todos"}
                    </QBoton>
                )}
                {estado === "CALCULADO" && (
                    <QBoton
                        deshabilitado={!puedeGenerarSeleccion(reposicion, seleccion)}
                        onClick={() => emitir("generacion_solicitada")}
                    >
                        Generar traspaso
                    </QBoton>
                )}
            </div>

            {estado === "CALCULADO" && reposicion.necesidades.length > 0 && !puedeGenerarTraspaso(reposicion) && (
                <p className="mensaje">
                    No se puede generar el traspaso: ninguno de estos artículos tiene stock libre en
                    ubicaciones activas de zonas de reserva del almacén desde donde reponer.
                </p>
            )}

            {estado === "GENERADO" && (
                <div className="mensaje">
                    {reposicion.ordenId ? (
                        <>
                            Traspaso generado:{" "}
                            <Link to={`/almacen/ordenes?id=${reposicion.ordenId}`}>
                                orden {reposicion.ordenId}
                            </Link>
                        </>
                    ) : (
                        "No había nada que reponer con origen: no se ha creado ninguna orden."
                    )}
                </div>
            )}

            {estado !== "INICIAL" &&
                (reposicion.necesidades.length === 0 ? (
                    <p>No hay necesidades de reposición.</p>
                ) : (
                    <TablaNecesidades
                        necesidades={reposicion.necesidades}
                        seleccion={estado === "CALCULADO" ? seleccion : null}
                        onMarcar={(id, marcada) => emitir("necesidad_marcada", { id, marcada })}
                    />
                ))}
        </div>
    );
};

type FilaNecesidad = Entidad & NecesidadReposicion;

const flechaSituacion: Record<ParteSituacion["tipo"], string> = { fisico: "", entrante: "↓", saliente: "↑" };
const nombreSituacion: Record<ParteSituacion["tipo"], string> = {
    fisico: "Físico", entrante: "Entrante", saliente: "Saliente",
};

const Situacion = ({ necesidad }: { necesidad: NecesidadReposicion }) => (
    <span className="situacion">
        {situacion(necesidad).map((p, i) => (
            <span key={p.tipo} className={`situacion-${p.tipo}`} title={nombreSituacion[p.tipo]}>
                {i > 0 && <span className="situacion-separador" aria-hidden="true"> / </span>}
                {flechaSituacion[p.tipo] && <span aria-hidden="true">{flechaSituacion[p.tipo]} </span>}
                <span className="sr-only">{nombreSituacion[p.tipo]} </span>
                {p.cantidad.toLocaleString("es-ES")}
            </span>
        ))}
    </span>
);

const columnasNecesidades: MetaTabla<FilaNecesidad> = [
    {
        id: "articuloId",
        cabecera: "Artículo",
        estilo: "destacado",
        render: (n) => (
            <Link to={`/almacen/articulo?id=${encodeURIComponent(n.articuloId)}`} onClick={(e) => e.stopPropagation()}>
                {textoArticulo(n)}
            </Link>
        ),
    },
    { id: "ubicacion", cabecera: "Ubicación de picking" },
    {
        id: "situacion",
        cabecera: "Situación",
        render: (n) => <Situacion necesidad={n} />,
    },
    { id: "disponible", cabecera: "Disponible", tipo: "numero", estilo: "destacado" },
    { id: "minimo", cabecera: "Mínimo", tipo: "numero" },
    { id: "maximo", cabecera: "Máximo", tipo: "numero" },
    { id: "cantidad", cabecera: "A reponer", tipo: "numero", estilo: "destacado" },
    { id: "falta", cabecera: "Falta", tipo: "numero" },
    {
        id: "origenes",
        cabecera: "Orígenes",
        ancho: "25%",
        render: (n) => (n.origenes.length ? textoOrigenes(n) : "Sin stock en reserva"),
    },
];

const TablaNecesidades = ({ necesidades, seleccion, onMarcar }: {
    necesidades: NecesidadReposicion[];
    /** null: sin casillas (p. ej. tras generar el traspaso). */
    seleccion: string[] | null;
    onMarcar: (id: string, marcada: boolean) => void;
}) => {
    const casilla: MetaTabla<FilaNecesidad>[number] = {
        id: "seleccionada", cabecera: "", ancho: "40px",
        render: (n) => (
            <input
                type="checkbox"
                checked={!!seleccion?.includes(n.pickingFijoId)}
                disabled={!necesidadSeleccionable(n)}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onMarcar(n.pickingFijoId, e.target.checked)}
            />
        ),
    };
    return (
        <QTabla<FilaNecesidad>
            metaTabla={seleccion ? [casilla, ...columnasNecesidades] : columnasNecesidades}
            datos={necesidades.map((n) => ({ ...n, id: n.pickingFijoId }))}
            cargando={false}
            orden={[]}
        />
    );
};
