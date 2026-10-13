import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado, MaestroDetalle } from "@olula/componentes/index.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { ItemInventario } from "../../diseño.ts";
import { CrearInventario } from "../crear/CrearInventario.tsx";
import { CrearInventarioTotal } from "../inventario_total/CrearInventarioTotal.tsx";
import { DetalleInventario } from "../detalle/DetalleInventario.tsx";
import { metaTablaInventario } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetalleInventario = () => {
    const criteriaBase = useMemo(() => criteriaDefecto, []);
    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        inventarios: listaActivaEntidadesInicial<ItemInventario>(id, criteriaInicial),
    });

    useUrlParams(ctx.inventarios.activo, ctx.inventarios.criteria);

    useEffect(() => {
        emitir("recarga_de_inventarios_solicitada", ctx.inventarios.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Inventario">
            <MaestroDetalle<ItemInventario>
                seleccionada={ctx.inventarios.activo}
                layout="TABLA"
                Maestro={
                    <>
                        <h2>Inventarios</h2>
                        <Listado<ItemInventario>
                            metaTabla={metaTablaInventario}
                            criteria={ctx.inventarios.criteria}
                            modo="tabla"
                            entidades={ctx.inventarios.lista}
                            totalEntidades={ctx.inventarios.total}
                            seleccionada={ctx.inventarios.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_inventario_solicitado")}>
                                        Nuevo inventario
                                    </QBoton>
                                    {pluginActivo("articulos_compuestos") && (
                                        <QBoton onClick={() => emitir("inventario_total_solicitado")}>
                                            Inventario total
                                        </QBoton>
                                    )}
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("inventario_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetalleInventario
                        id={ctx.inventarios.activo}
                        publicar={emitir}
                    />
                }
            />
            {ctx.estado === "CREANDO" && <CrearInventario publicar={emitir} />}
            {ctx.estado === "INVENTARIO_TOTAL" && <CrearInventarioTotal publicar={emitir} />}
        </div>
    );
};
