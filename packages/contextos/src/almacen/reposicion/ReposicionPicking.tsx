import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
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

const TablaNecesidades = ({ necesidades }: { necesidades: NecesidadReposicion[] }) => (
    <table className="tabla-necesidades">
        <thead>
            <tr>
                <th>Artículo</th>
                <th>Ubicación de picking</th>
                <th>Disponible</th>
                <th>Mín. / Máx.</th>
                <th>A reponer</th>
                <th>Falta</th>
                <th>Orígenes</th>
            </tr>
        </thead>
        <tbody>
            {necesidades.map((n) => (
                <tr key={n.pickingFijoId}>
                    <td>{n.articuloId}</td>
                    <td>{n.ubicacion}</td>
                    <td title={`Físico ${n.fisico} + entrante ${n.entrante} - saliente ${n.saliente}`}>
                        {n.disponible}
                    </td>
                    <td>{n.minimo} / {n.maximo}</td>
                    <td>{n.cantidad}</td>
                    <td>{n.falta}</td>
                    <td>{textoOrigenes(n)}</td>
                </tr>
            ))}
        </tbody>
    </table>
);
