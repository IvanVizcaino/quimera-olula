import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Entidad } from "@olula/lib/diseño.ts";
import { Link } from "react-router";
import { NecesidadReposicion } from "./diseño.ts";
import { puedeGenerarTraspaso, textoOrigenes } from "./dominio.ts";
import { contextoReposicionInicial, getMaquina } from "./maquina.ts";

export const ReposicionPicking = () => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoReposicionInicial);
    const { estado, almacenId, reposicion } = ctx;

    return (
        <div className="ReposicionPicking">
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
                {estado === "CALCULADO" && (
                    <QBoton
                        deshabilitado={!puedeGenerarTraspaso(reposicion)}
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
                    <TablaNecesidades necesidades={reposicion.necesidades} />
                ))}
        </div>
    );
};

type FilaNecesidad = Entidad & NecesidadReposicion;

const metaTablaNecesidades: MetaTabla<FilaNecesidad> = [
    { id: "articuloId", cabecera: "Artículo", estilo: "destacado" },
    { id: "ubicacion", cabecera: "Ubicación de picking" },
    { id: "fisico", cabecera: "Físico", tipo: "numero" },
    { id: "entrante", cabecera: "Entrante", tipo: "numero" },
    { id: "saliente", cabecera: "Saliente", tipo: "numero" },
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

const TablaNecesidades = ({ necesidades }: { necesidades: NecesidadReposicion[] }) => (
    <QTabla<FilaNecesidad>
        metaTabla={metaTablaNecesidades}
        datos={necesidades.map((n) => ({ ...n, id: n.pickingFijoId }))}
        cargando={false}
        orden={[]}
    />
);
