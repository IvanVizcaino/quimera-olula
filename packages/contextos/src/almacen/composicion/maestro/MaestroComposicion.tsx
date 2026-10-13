import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado, MaestroDetalle, QBoton } from "@olula/componentes/index.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { puede } from "@olula/lib/dominio.ts";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { Composicion } from "../diseño.ts";
import { CrearComposicion } from "../crear/CrearComposicion.tsx";
import { DetalleComposicion } from "../detalle/DetalleComposicion.tsx";
import { metaTablaComposicion } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroComposicion = () => {
    const { id, criteria } = getUrlParams();

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        composiciones: listaActivaEntidadesInicial<Composicion>(id, criteria),
    });

    useUrlParams(ctx.composiciones.activo, ctx.composiciones.criteria);

    useEffect(() => {
        emitir("recarga_solicitada", ctx.composiciones.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Composicion">
            <MaestroDetalle<Composicion>
                seleccionada={ctx.composiciones.activo}
                layout="TABLA"
                Maestro={
                    <>
                        <h2>Composiciones de artículos</h2>
                        <div className="maestro-botones">
                            {puede("almacen.composicion") && (
                                <QBoton onClick={() => emitir("crear")}>Nueva</QBoton>
                            )}
                        </div>
                        <Listado<Composicion>
                            metaTabla={metaTablaComposicion}
                            criteria={ctx.composiciones.criteria}
                            modo="tabla"
                            entidades={ctx.composiciones.lista}
                            totalEntidades={ctx.composiciones.total}
                            seleccionada={ctx.composiciones.activo}
                            onSeleccion={(payload) => emitir("composicion_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetalleComposicion
                        id={ctx.composiciones.activo}
                        publicar={emitir}
                    />
                }
            />
            <CrearComposicion publicar={emitir} activo={ctx.estado === "CREANDO"} />
        </div>
    );
};
