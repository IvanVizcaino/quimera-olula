import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearGrupoContableAmortizacion } from "../crear/CrearGrupoContableAmortizacion.tsx";
import { DetalleGrupoContableAmortizacion } from "../detalle/DetalleGrupoContableAmortizacion.tsx";
import { GrupoContableAmortizacion } from "../diseño.ts";
import {
    criteriaGruposDefecto,
    metaFiltroGrupoContableAmortizacion,
    metaTablaGrupoContableAmortizacion,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

/**
 * Grupos contables de amortización (Eneboo `co_gruposcontablesamo`): las
 * subcuentas con que se contabilizan las dotaciones y el cierre de las
 * amortizaciones de cada grupo.
 */
export const MaestroConDetalleGrupoContableAmortizacion = () => {

    const criteriaInicial = useMemo(criteriaGruposDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        grupos: listaActivaEntidadesInicial<GrupoContableAmortizacion>(undefined, criteriaInicial),
    });

    const { estado, grupos } = ctx;

    const autorizado = puede("contabilidad.asiento");

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_grupos_solicitada", grupos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>No tienes permiso para ver los grupos contables de amortización.</p>;
    }

    return (
        <div className="GrupoContableAmortizacion">
            <MaestroDetalle<GrupoContableAmortizacion>
                seleccionada={grupos.activo}
                Maestro={
                    <>
                        <h2>Grupos contables de amortización</h2>
                        <Listado<GrupoContableAmortizacion>
                            metaTabla={metaTablaGrupoContableAmortizacion}
                            metaFiltro={metaFiltroGrupoContableAmortizacion}
                            criteria={grupos.criteria}
                            modoInicial="tabla"
                            entidades={grupos.lista}
                            totalEntidades={grupos.total}
                            seleccionada={grupos.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_grupo_solicitado")}>
                                        Nuevo grupo
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("grupo_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetalleGrupoContableAmortizacion
                        id={grupos.activo}
                        publicar={emitir}
                    />
                }
            />

            {estado === "CREANDO" && <CrearGrupoContableAmortizacion publicar={emitir} />}
        </div>
    );
};
