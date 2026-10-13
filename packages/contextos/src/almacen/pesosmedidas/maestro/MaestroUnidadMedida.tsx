import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado, MaestroDetalle, QBoton } from "@olula/componentes/index.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { UnidadMedida } from "../diseño.ts";
import { CrearUnidadMedida } from "../crear/CrearUnidadMedida.tsx";
import { DetalleUnidadMedida } from "../detalle/DetalleUnidadMedida.tsx";
import { metaTablaUnidadMedida } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroUnidadMedida = () => {
    const { id, criteria } = getUrlParams();

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        unidades: listaActivaEntidadesInicial<UnidadMedida>(id, criteria),
    });

    useUrlParams(ctx.unidades.activo, ctx.unidades.criteria);

    useEffect(() => {
        emitir("recarga_solicitada", ctx.unidades.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="UnidadMedida">
            <MaestroDetalle<UnidadMedida>
                seleccionada={ctx.unidades.activo}
                layout="TABLA"
                Maestro={
                    <>
                        <h2>Unidades de medida</h2>
                        <div className="maestro-botones">
                            <QBoton onClick={() => emitir("crear")}>Nueva</QBoton>
                        </div>
                        <Listado<UnidadMedida>
                            metaTabla={metaTablaUnidadMedida}
                            criteria={ctx.unidades.criteria}
                            modo="tabla"
                            entidades={ctx.unidades.lista}
                            totalEntidades={ctx.unidades.total}
                            seleccionada={ctx.unidades.activo}
                            onSeleccion={(payload) => emitir("unidad_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetalleUnidadMedida
                        id={ctx.unidades.activo}
                        publicar={emitir}
                    />
                }
            />
            <CrearUnidadMedida publicar={emitir} activo={ctx.estado === "CREANDO"} />
        </div>
    );
};
