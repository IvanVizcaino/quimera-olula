import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { PausaJornada, RegistroJornada } from "../diseño.ts";
import { BorrarPausaJornada } from "./BorrarPausaJornada.tsx";
import { CrearPausaJornada } from "./CrearPausaJornada.tsx";
import { EditarPausaJornada } from "./EditarPausaJornada.tsx";

const metaTablaPausas: MetaTabla<PausaJornada> = [
    { id: "horaInicio", cabecera: "Hora inicio", tipo: "hora" },
    { id: "horaFin", cabecera: "Hora fin", tipo: "hora" },
    { id: "causa", cabecera: "Causa", tipo: "texto" },
];

// const esPausaAbierta = (pausa: PausaJornada): boolean => pausa.horaFin === null;

export const PausasJornada = ({
    jornada,
    estadoDetalle,
    pausaActiva,
    publicar,
}: {
    jornada: RegistroJornada;
    estadoDetalle: string;
    pausaActiva: PausaJornada | null;
    publicar: EmitirEvento;
}) => {
    const esBorrador = jornada.estado === "BORRADOR";

    return (
        <div className="PausasJornada">
            <h3>Pausas</h3>

            <QTabla<PausaJornada>
                metaTabla={[
                    ...metaTablaPausas,
                    {
                        id: "acciones",
                        cabecera: "",
                        render: (pausa: PausaJornada) => (
                            <span className="pausas-acciones">
                                {esBorrador && (
                                    <QBoton
                                        tamaño="pequeño"
                                        variante="borde"
                                        onClick={() => publicar("editar_pausa_solicitado", pausa)}
                                    >
                                        Editar
                                    </QBoton>
                                )}
                                {esBorrador && (
                                    <QBoton
                                        tamaño="pequeño"
                                        variante="borde"
                                        advertencia
                                        onClick={() => publicar("borrar_pausa_solicitado", pausa)}
                                    >
                                        Borrar
                                    </QBoton>
                                )}
                            </span>
                        ),
                    },
                ]}
                datos={jornada.pausas}
                cargando={false}
                orden={[]}
            />

            {estadoDetalle === "CREANDO_PAUSA" && (
                <CrearPausaJornada publicar={publicar} jornada={jornada} />
            )}
            {estadoDetalle === "EDITANDO_PAUSA" && pausaActiva && (
                <EditarPausaJornada
                    publicar={publicar}
                    jornada={jornada}
                    pausa={pausaActiva}
                />
            )}
            {estadoDetalle === "BORRANDO_PAUSA" && pausaActiva && (
                <BorrarPausaJornada
                    publicar={publicar}
                    jornada={jornada}
                    pausa={pausaActiva}
                />
            )}
        </div>
    );
};
