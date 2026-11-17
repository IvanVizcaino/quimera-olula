import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { Entidad, Modelo } from "@olula/lib/diseño.ts";
import { criteriaDefecto, puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearFiscal } from "./CrearFiscal.tsx";
import { DetalleFiscal } from "./DetalleFiscal.tsx";
import { ConfigMaestroFiscal } from "./diseño.ts";
import { getMaquinaMaestroFiscal } from "./maestro.ts";

/** Maestro con detalle de un maestro de Fiscalidad (listado, ficha con
 * guardado automático, alta y borrado). */
export const MaestroFiscal = <T extends Entidad & Modelo, N extends Modelo>({
    config,
}: {
    config: ConfigMaestroFiscal<T, N>;
}) => {
    const criteriaInicial = useMemo(
        () => ({ ...criteriaDefecto, filtro: [], orden: ["id", "ASC"] as [string, string] }),
        [],
    );
    const getMaquina = useMemo(() => () => getMaquinaMaestroFiscal(config), [config]);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        entidades: listaActivaEntidadesInicial<T>(undefined, criteriaInicial),
    });

    const { estado, entidades } = ctx;
    const autorizado = puede(config.regla);

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_solicitada", entidades.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>No tienes permiso para ver {config.titulo.toLowerCase()}.</p>;
    }

    return (
        <div className={`MaestroFiscal ${config.nombre}`}>
            <MaestroDetalle<T>
                seleccionada={entidades.activo}
                Maestro={
                    <>
                        <h2>{config.titulo}</h2>
                        <Listado<T>
                            metaTabla={config.metaTabla}
                            metaFiltro={config.metaFiltro}
                            criteria={entidades.criteria}
                            modoInicial="tabla"
                            entidades={entidades.lista}
                            totalEntidades={entidades.total}
                            seleccionada={entidades.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_solicitado")}>Nuevo</QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("entidad_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleFiscal config={config} id={entidades.activo} publicar={emitir} />}
            />
            {estado === "CREANDO" && <CrearFiscal config={config} publicar={emitir} />}
        </div>
    );
};
