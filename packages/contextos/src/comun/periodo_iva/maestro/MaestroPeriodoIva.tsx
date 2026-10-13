import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado, MaestroDetalle, QBoton } from "@olula/componentes/index.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { IMPUESTO_ID_DEFECTO } from "../dominio.ts";
import { PeriodoIva } from "../diseño.ts";
import { CrearPeriodoIva } from "../crear/CrearPeriodoIva.tsx";
import { DetallePeriodoIva } from "../detalle/DetallePeriodoIva.tsx";
import {
    criteriaConImpuesto,
    impuestoIdDesdeCriteria,
} from "./dominio.ts";
import { metaTablaPeriodoIva, ordenDefectoPeriodoIva } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroPeriodoIva = () => {
    const { id, criteria: criteriaUrl } = getUrlParams(ordenDefectoPeriodoIva);
    const impuestoInicial = impuestoIdDesdeCriteria(criteriaUrl) ?? IMPUESTO_ID_DEFECTO;
    const criteria = criteriaConImpuesto(impuestoInicial, criteriaUrl);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        impuestoId: impuestoInicial,
        periodos: listaActivaEntidadesInicial<PeriodoIva>(id, criteria),
    });

    useUrlParams(ctx.periodos.activo, ctx.periodos.criteria, ordenDefectoPeriodoIva);

    useEffect(() => {
        emitir("recarga_solicitada", ctx.periodos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="PeriodoIva">
            <MaestroDetalle<PeriodoIva>
                seleccionada={ctx.periodos.activo}
                layout="TABLA"
                Maestro={
                    <>
                        <h2>Periodos de IVA</h2>
                        <quimera-formulario className="filtro-impuesto">
                            <GrupoIvaProducto
                                nombre="impuestoId"
                                valor={ctx.impuestoId}
                                onChange={(opcion) =>
                                    emitir("impuesto_cambiado", opcion?.valor ?? ctx.impuestoId)
                                }
                            />
                        </quimera-formulario>
                        <div className="maestro-botones">
                            <QBoton onClick={() => emitir("crear")}>Nuevo periodo</QBoton>
                        </div>
                        <Listado<PeriodoIva>
                            metaTabla={metaTablaPeriodoIva}
                            criteria={ctx.periodos.criteria}
                            modo="tabla"
                            entidades={ctx.periodos.lista}
                            totalEntidades={ctx.periodos.total}
                            seleccionada={ctx.periodos.activo}
                            onSeleccion={(payload) => emitir("periodo_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetallePeriodoIva
                        id={ctx.periodos.activo}
                        publicar={emitir}
                    />
                }
            />
            <CrearPeriodoIva
                publicar={emitir}
                activo={ctx.estado === "CREANDO"}
                impuestoId={ctx.impuestoId}
            />
        </div>
    );
};
