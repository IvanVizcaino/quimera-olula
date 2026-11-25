import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.ts";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.ts";
import { useEffect, useMemo } from "react";
import { CrearPlanProduccion } from "../crear/CrearPlanProduccion.tsx";
import { DetallePlanProduccion } from "../detalle/DetallePlanProduccion.tsx";
import { ItemPlanProduccion } from "../diseño.ts";
import { getMaquina } from "./maquina.ts";

const metaTablaPlan: MetaTabla<ItemPlanProduccion> = [
    { id: "id", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "estado", cabecera: "Estado" },
    { id: "cantidad", cabecera: "Cantidad", tipo: "numero" },
];

export const MaestroConDetallePlanProduccion = () => {
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        planes: listaActivaEntidadesInicial<ItemPlanProduccion>(id, criteriaInicial),
    });

    const { estado, planes } = ctx;

    useUrlParams(planes.activo, planes.criteria);

    useEffect(() => {
        emitir("recarga_de_planes_solicitada", planes.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="PlanProduccion">
            <MaestroDetalle<ItemPlanProduccion>
                Maestro={
                    <>
                        <h2>Planes de producción</h2>
                        <Listado<ItemPlanProduccion>
                            metaTabla={metaTablaPlan}
                            criteria={planes.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaPlan}
                            entidades={planes.lista}
                            totalEntidades={planes.total}
                            seleccionada={planes.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_plan_solicitado")}>
                                        Nuevo plan
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("plan_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetallePlanProduccion id={planes.activo} publicar={emitir} />}
                seleccionada={planes.activo}
                modoDisposicion="maestro-dinamico"
            />

            {estado === "CREANDO" && <CrearPlanProduccion publicar={emitir} />}
        </div>
    );
};

const TarjetaPlan = (plan: ItemPlanProduccion) => (
    <div className="tarjeta-plan-produccion" key={plan.id}>
        <div>{plan.id} - {plan.descripcion}</div>
        <div>{plan.estado} · {plan.cantidad} uds.</div>
    </div>
);
