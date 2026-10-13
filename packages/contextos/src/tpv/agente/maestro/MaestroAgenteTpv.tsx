import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado, MaestroDetalle, QBoton } from "@olula/componentes/index.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { AgenteTpv } from "../diseño.ts";
import { CrearAgenteTpv } from "../crear/CrearAgenteTpv.tsx";
import { DetalleAgenteTpv } from "../detalle/DetalleAgenteTpv.tsx";
import { metaTablaAgenteTpv } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroAgenteTpv = () => {
    const { id, criteria } = getUrlParams();

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        agentes: listaActivaEntidadesInicial<AgenteTpv>(id, criteria),
    });

    useUrlParams(ctx.agentes.activo, ctx.agentes.criteria);

    useEffect(() => {
        emitir("recarga_solicitada", ctx.agentes.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="AgenteTpv">
            <MaestroDetalle<AgenteTpv>
                seleccionada={ctx.agentes.activo}
                layout="TABLA"
                Maestro={
                    <>
                        <h2>Agentes TPV</h2>
                        <div className="maestro-botones">
                            <QBoton onClick={() => emitir("crear")}>Nuevo</QBoton>
                        </div>
                        <Listado<AgenteTpv>
                            metaTabla={metaTablaAgenteTpv}
                            criteria={ctx.agentes.criteria}
                            modo="tabla"
                            entidades={ctx.agentes.lista}
                            totalEntidades={ctx.agentes.total}
                            seleccionada={ctx.agentes.activo}
                            onSeleccion={(payload) => emitir("agente_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetalleAgenteTpv
                        id={ctx.agentes.activo}
                        publicar={emitir}
                    />
                }
            />
            <CrearAgenteTpv publicar={emitir} activo={ctx.estado === "CREANDO"} />
        </div>
    );
};
