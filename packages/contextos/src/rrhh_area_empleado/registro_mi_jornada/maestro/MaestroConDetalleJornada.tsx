import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { MetaFiltro, filtroMesAnyoConManual } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { TipoInput } from "@olula/lib/diseño.js";
import { formatearFechaDate } from "@olula/lib/dominio.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useLayout } from "@olula/lib/useLayout.js";
import { useEffect } from "react";
import { CrearJornada } from "../crear/CrearJornada.tsx";
import { DetalleJornada } from "../detalle/DetalleJornada.tsx";
import { RegistroJornada } from "../diseño.ts";
import { minutosAHorasMinutos } from "../dominio.ts";
import "./MaestroConDetalleJornada.css";
import { ContextoMaestroJornadas, metaTablaJornada } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetalleJornada = () => {
    const { id, criteria } = getUrlParams();

    const contextoInicial: ContextoMaestroJornadas = {
        estado: "INICIAL",
        jornadas: listaActivaEntidadesInicial<RegistroJornada>(id, criteria),
        mediaMinutos: 0,
    };

    const { layout, cambiarLayout, esMovil } = useLayout("TABLA");

    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial);

    useUrlParams(ctx.jornadas.activo, ctx.jornadas.criteria);

    useEffect(() => {
        emitir("recarga_de_jornadas_solicitada", ctx.jornadas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { estado } = ctx;

    return (
        <div className="RegistroJornada">
            <MaestroDetalle<RegistroJornada>
                Maestro={
                    <>
                        <h2>Registro de jornadas — Media: {minutosAHorasMinutos(ctx.mediaMinutos)}</h2>
                        {!esMovil && (
                            <div className="maestro-botones">
                                <QBoton
                                    texto={layout === "TARJETA" ? "Ver tabla" : "Ver tarjetas"}
                                    onClick={cambiarLayout}
                                />
                            </div>
                        )}
                        <Listado<RegistroJornada>
                            metaTabla={metaTablaJornada}
                            metaFiltro={metaFiltro}
                            criteria={ctx.jornadas.criteria}
                            modo={layout === "TARJETA" ? "tarjetas" : "tabla"}
                            tarjeta={TarjetaJornada}
                            entidades={ctx.jornadas.lista}
                            totalEntidades={ctx.jornadas.total}
                            seleccionada={ctx.jornadas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("inicio_de_jornada_solicitado")}>
                                        Iniciar
                                    </QBoton>
                                    <QBoton onClick={() => emitir("creacion_de_jornada_solicitada")}>
                                        Nueva jornada
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("jornada_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                        />
                    </>
                }
                Detalle={<DetalleJornada id={ctx.jornadas.activo} publicar={emitir} />}
                layout={layout}
                seleccionada={ctx.jornadas.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO_JORNADA" && (
                <CrearJornada publicar={emitir} />
            )}
        </div>
    );
};

const TarjetaJornada = (jornada: RegistroJornada) => (
    <div className="tarjeta-jornada">
        <div className="tarjeta-jornada-principal">
            <span className="tarjeta-jornada-fecha">{formatearFechaDate(jornada.fecha)}</span>
            <span className="tarjeta-jornada-estado">{jornada.estado}</span>
        </div>
        <div className="tarjeta-jornada-horas">
            <span>{jornada.horaEntrada ?? "—"} → {jornada.horaSalida ?? "—"}</span>
            <span className="tarjeta-jornada-duracion">{minutosAHorasMinutos(jornada.minutosJornada)}</span>
        </div>
    </div>
);

const metaFiltro: MetaFiltro = {
    fecha: {
        id: "fecha",
        label: "Mes",
        tipo: "mes_año" as TipoInput,
        filtro: (v) => filtroMesAnyoConManual("fecha", v),
    },
}