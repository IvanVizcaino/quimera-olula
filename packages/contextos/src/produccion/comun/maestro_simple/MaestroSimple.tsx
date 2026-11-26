import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { Criteria, EmitirEvento, Entidad } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { ReactNode, useCallback, useEffect, useMemo } from "react";
import { ConsultasMaestro } from "./diseño.ts";
import { getMaquinaMaestroSimple } from "./maquina.ts";

export type PropsMaestroSimple<T extends Entidad> = {
    /** Clase CSS del contenedor. */
    clase: string;
    titulo: string;
    /** Sin `crear`, no hay botón de alta. */
    textoNuevo?: string;
    /** Columnas; como función, reciben `recargar` (p. ej. para acciones por fila). */
    metaTabla: MetaTabla<T> | ((recargar: () => Promise<void>) => MetaTabla<T>);
    /** Filtros del listado; sin ellos, los de las columnas. */
    metaFiltro?: MetaFiltro;
    consultas: ConsultasMaestro<T>;
    tarjeta: (entidad: T) => ReactNode;
    /** Modal de alta; publica `entidad_creada` (id) o `alta_cancelada`. Sin él, no se dan altas. */
    crear?: (publicar: EmitirEvento) => ReactNode;
    /** Detalle de la entidad activa; publica `entidad_cambiada`, `entidad_borrada` y `entidad_deseleccionada`. */
    detalle: (id: string | undefined, publicar: EmitirEvento, recargar: () => Promise<void>) => ReactNode;
    /** Por defecto, por código ascendente. */
    criteriaBase?: Criteria;
    /** Botones de más junto al de alta (p. ej. «Generar órdenes»); como función, reciben `recargar`. */
    accionesExtra?: ReactNode | ((recargar: () => Promise<void>) => ReactNode);
};

const porCodigo: Criteria = { ...criteriaDefecto, orden: ["id", "ASC"] };

/**
 * Maestro sencillo de producción: listado en modo tabla y detalle al lado, como el de
 * unidades de pesos y medidas (`almacen/peso_medida`).
 */
export const MaestroSimple = <T extends Entidad>({
    clase,
    titulo,
    textoNuevo,
    metaTabla,
    metaFiltro,
    consultas,
    tarjeta,
    crear,
    detalle,
    criteriaBase = porCodigo,
    accionesExtra,
}: PropsMaestroSimple<T>) => {
    const getMaquina = useMemo(() => getMaquinaMaestroSimple(consultas), [consultas]);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        entidades: listaActivaEntidadesInicial<T>(id, criteriaInicial),
    });

    const { estado, entidades } = ctx;

    useUrlParams(entidades.activo, entidades.criteria);

    // Vuelve a leer la lista desde la primera página con los filtros y el orden actuales.
    const recargar = useCallback(async () => {
        const { criteria } = entidades;
        await emitir("recarga_solicitada", { ...criteria, paginacion: { ...criteria.paginacion, pagina: 1 } });
    }, [emitir, entidades]);

    useEffect(() => {
        emitir("recarga_solicitada", entidades.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={clase}>
            <MaestroDetalle<T>
                Maestro={
                    <>
                        <h2>{titulo}</h2>
                        <Listado<T>
                            metaTabla={typeof metaTabla === "function" ? metaTabla(recargar) : metaTabla}
                            metaFiltro={metaFiltro}
                            criteria={entidades.criteria}
                            modoInicial="tabla"
                            tarjeta={tarjeta}
                            entidades={entidades.lista}
                            totalEntidades={entidades.total}
                            seleccionada={entidades.activo}
                            renderAcciones={() => (crear || accionesExtra) && (
                                <div className="maestro-botones">
                                    {crear && <QBoton onClick={() => emitir("crear_solicitado")}>{textoNuevo}</QBoton>}
                                    {typeof accionesExtra === "function" ? accionesExtra(recargar) : accionesExtra}
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("entidad_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={detalle(entidades.activo, emitir, recargar)}
                seleccionada={entidades.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && crear?.(emitir)}
        </div>
    );
};
