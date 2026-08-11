import { Empleado } from "#/rrhh/comun/componentes/Empleado.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { filtroMesAnyo, MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { TipoInput } from "@olula/lib/diseño.ts";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { CrearJornada } from "../crear/CrearJornada.tsx";
import { DetalleJornada } from "../detalle/DetalleJornada.tsx";
import { RegistroJornada } from "../diseño.ts";
import { minutosAHorasMinutos } from "../dominio.ts";
import { AprobarJornadas } from "./AprobarJornadas.tsx";
import { RevisarFirmaJornadas } from "./RevisarFirmaJornadas.tsx";
import { ContextoMaestroJornadas, metaTablaJornada } from "./diseño.ts";
import { todasPuedenAprobarse } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetalleJornada = () => {

    const { id, criteria } = getUrlParams();

    const contextoInicial: ContextoMaestroJornadas = {
        estado: "INICIAL",
        jornadas: listaActivaEntidadesInicial<RegistroJornada>(id, criteria),
        mediaMinutos: 0,
        seleccionadas: [],
    };

    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial);

    useUrlParams(ctx.jornadas.activo, ctx.jornadas.criteria);

    useEffect(() => {
        emitir("recarga_de_jornadas_solicitada", ctx.jornadas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { estado } = ctx;

    const puedeAprobar = todasPuedenAprobarse(ctx.seleccionadas, ctx.jornadas.lista);
    console.log("puede aprobar?", puedeAprobar, ctx.seleccionadas, ctx.jornadas.lista);

    return (
        <div className="RegistroJornada">
            <MaestroDetalle<RegistroJornada>
                Maestro={
                    <>
                        <h2>Registro de jornadas — Media: {minutosAHorasMinutos(ctx.mediaMinutos)}</h2>
                        <Listado<RegistroJornada>
                            metaTabla={metaTablaJornada}
                            metaFiltro={metaFiltro}
                            modoMultiseleccion={true}
                            onMultiSeleccion={(ids) => emitir("seleccionadas_cambiadas", ids)}
                            criteria={ctx.jornadas.criteria}
                            modo="tabla"
                            entidades={ctx.jornadas.lista}
                            totalEntidades={ctx.jornadas.total}
                            seleccionada={ctx.jornadas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("creacion_de_jornada_solicitada")}>
                                        Nueva jornada
                                    </QBoton>
                                    {puedeAprobar && (
                                        <QBoton onClick={() => emitir("aprobacion_multiple_solicitada")}>
                                            Aprobar ({ctx.seleccionadas.length})
                                        </QBoton>
                                    )}
                                    <QBoton onClick={() => emitir("revision_de_firma_solicitada")}>
                                        Verificar firmas
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("jornada_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            urlDescarga="/rrhh/jornada/exportar"
                            formatosDescarga={[
                                { valor: "xlsx", etiqueta: "Excel" },
                                { valor: "csv", etiqueta: "CSV" },
                                { valor: "html", etiqueta: "HTML" },
                            ]}
                        />
                    </>
                }
                Detalle={<DetalleJornada id={ctx.jornadas.activo} publicar={emitir} />}
                seleccionada={ctx.jornadas.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO_JORNADA" && (
                <CrearJornada publicar={emitir} />
            )}

            {estado === "APROBANDO_JORNADAS" && (
                <AprobarJornadas publicar={emitir} cantidad={ctx.seleccionadas.length} />
            )}

            {estado === "REVISANDO_JORNADAS" && (
                <RevisarFirmaJornadas publicar={emitir} />
            )}
        </div>
    );
};

const metaFiltro: MetaFiltro = {
    // ...getMetaFiltroDefecto(metaTablaJornada),
    fecha: {
        id: "fecha",
        label: "Mes",
        tipo: "mes_año" as TipoInput,
        filtro: (v) => filtroMesAnyo("fecha", v),
        fromFiltro: (filtro) => {
            const clausula = filtro.find(([campo]) => campo === "fecha");
            if (!clausula || clausula[1] !== "<>" || !clausula[2]) return undefined;
            const [desde] = clausula[2].split("_");
            return desde.slice(0, 7); // "YYYY-MM"
        },
    },
    empleadoId: {
        id: "empleadoId",
        campo: "empleado_id",
        label: "Empleado",
        filtro: (v) => (v ? ["empleado_id", "=", v as string] : null),
        render: (valor, onChange) => (
            <Empleado
                valor={(valor as string) ?? ""}
                onChange={(opcion) => onChange(opcion?.valor ?? "")}
            />
        ),
    },
}
