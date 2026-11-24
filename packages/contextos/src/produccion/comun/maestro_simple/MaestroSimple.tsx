import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { Criteria, EmitirEvento, Entidad } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { ReactNode, useEffect, useMemo } from "react";
import { ConsultasMaestro } from "./diseño.ts";
import { getMaquinaMaestroSimple } from "./maquina.ts";

export type PropsMaestroSimple<T extends Entidad> = {
    /** Clase CSS del contenedor. */
    clase: string;
    titulo: string;
    textoNuevo: string;
    metaTabla: MetaTabla<T>;
    consultas: ConsultasMaestro<T>;
    tarjeta: (entidad: T) => ReactNode;
    /** Modal de alta; publica `entidad_creada` (id) o `alta_cancelada`. */
    crear: (publicar: EmitirEvento) => ReactNode;
    /** Detalle de la entidad activa; publica `entidad_cambiada`, `entidad_borrada` y `entidad_deseleccionada`. */
    detalle: (id: string | undefined, publicar: EmitirEvento) => ReactNode;
    /** Por defecto, por código ascendente. */
    criteriaBase?: Criteria;
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
    consultas,
    tarjeta,
    crear,
    detalle,
    criteriaBase = porCodigo,
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
                            metaTabla={metaTabla}
                            criteria={entidades.criteria}
                            modoInicial="tabla"
                            tarjeta={tarjeta}
                            entidades={entidades.lista}
                            totalEntidades={entidades.total}
                            seleccionada={entidades.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_solicitado")}>{textoNuevo}</QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("entidad_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={detalle(entidades.activo, emitir)}
                seleccionada={entidades.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && crear(emitir)}
        </div>
    );
};
