import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { filtroFechas, MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { DetalleEventoCola } from "../detalle/DetalleEventoCola.tsx";
import { EventoCola } from "../diseño.ts";
import { ESTADOS_EVENTO_COLA, formatearMarcaTiempo, varianteEstadoEvento } from "../dominio.ts";
import { getMaquina } from "./maquina.ts";

// Columnas del escritorio (flmastercolas.qs, ordenarColumnas).
const metaTabla: MetaTabla<EventoCola> = [
    { id: "creacion", cabecera: "Creación", render: (e) => formatearMarcaTiempo(e.creacion) },
    { id: "programada", cabecera: "Programada", render: (e) => formatearMarcaTiempo(e.programada) },
    { id: "inicio", cabecera: "Inicio", render: (e) => formatearMarcaTiempo(e.inicio) },
    { id: "fin", cabecera: "Fin", render: (e) => formatearMarcaTiempo(e.fin) },
    {
        id: "estado", cabecera: "Estado",
        render: (e) => <QEtiqueta variante={varianteEstadoEvento(e.estado)}>{e.estado}</QEtiqueta>,
    },
    { id: "tipo", cabecera: "Tipo de evento" },
    { id: "colaId", cabecera: "Cola" },
    { id: "error", cabecera: "Error" },
];

const metaFiltro: MetaFiltro = {
    estado: {
        id: "estado",
        label: "Estado",
        tipo: "multiseleccion",
        opciones: ESTADOS_EVENTO_COLA.map((e) => ({ valor: e, descripcion: e })),
        filtro: (valor) => {
            const elegidos = (valor as string[]) ?? [];
            return elegidos.length === 0 ? null : ["estado", "in", elegidos as unknown as string];
        },
    },
    tipo: { id: "tipo", label: "Tipo de evento", tipo: "texto", filtro: (v) => (v ? ["tipo", "~", v as string] : null) },
    cola_id: { id: "cola_id", label: "Cola", tipo: "texto", filtro: (v) => (v ? ["cola_id", "~", v as string] : null) },
    // Por día (el servidor compara la parte de fecha de cada marca de tiempo).
    ...Object.fromEntries(([
        ["fecha_creacion", "Fecha creación"],
        ["fecha_programada", "Fecha programada"],
        ["fecha_inicio", "Fecha inicio"],
        ["fecha_fin", "Fecha fin"],
    ] as const).map(([id, label]) => [id, {
        id, label, tipo: "intervalo_fechas" as const, filtro: (v: unknown) => filtroFechas(id, v),
    }])),
};

/** Administración > Cola de eventos (flmastercolas.ui / flcolas.ui). */
export const MaestroConDetalleEventoCola = () => {
    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 || criteria.orden.length ? criteria : criteriaDefecto;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        eventos: listaActivaEntidadesInicial<EventoCola>(id, { ...criteriaInicial, orden: [] }),
    });
    const { eventos } = ctx;

    useUrlParams(eventos.activo, eventos.criteria);

    useEffect(() => {
        emitir("recarga_de_eventos_solicitada", eventos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="EventoCola">
            <MaestroDetalle<EventoCola>
                Maestro={
                    <>
                        <h2>Cola de eventos</h2>
                        <Listado<EventoCola>
                            metaTabla={metaTabla}
                            metaFiltro={metaFiltro}
                            criteria={eventos.criteria}
                            modoInicial="tabla"
                            modosDisponibles={["tabla"]}
                            entidades={eventos.lista}
                            totalEntidades={eventos.total}
                            seleccionada={eventos.activo}
                            onSeleccion={(payload) => emitir("evento_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleEventoCola id={eventos.activo} publicar={emitir} />}
                seleccionada={eventos.activo}
                modoDisposicion="maestro-dinamico"
            />
        </div>
    );
};
