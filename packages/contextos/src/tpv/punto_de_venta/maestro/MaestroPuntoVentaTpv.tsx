import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado, MaestroDetalle, QBoton } from "@olula/componentes/index.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { PuntoVentaTpv } from "../diseño.ts";
import { CrearPuntoVentaTpv } from "../crear/CrearPuntoVentaTpv.tsx";
import { DetallePuntoVentaTpv } from "../detalle/DetallePuntoVentaTpv.tsx";
import { metaTablaPuntoVentaTpv } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroPuntoVentaTpv = () => {
    const { id, criteria } = getUrlParams();

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        puntos: listaActivaEntidadesInicial<PuntoVentaTpv>(id, criteria),
    });

    useUrlParams(ctx.puntos.activo, ctx.puntos.criteria);

    useEffect(() => {
        emitir("recarga_solicitada", ctx.puntos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="PuntoVentaTpv">
            <MaestroDetalle<PuntoVentaTpv>
                seleccionada={ctx.puntos.activo}
                layout="TABLA"
                Maestro={
                    <>
                        <h2>Puntos de venta</h2>
                        <div className="maestro-botones">
                            <QBoton onClick={() => emitir("crear")}>Nuevo</QBoton>
                        </div>
                        <Listado<PuntoVentaTpv>
                            metaTabla={metaTablaPuntoVentaTpv}
                            criteria={ctx.puntos.criteria}
                            modo="tabla"
                            entidades={ctx.puntos.lista}
                            totalEntidades={ctx.puntos.total}
                            seleccionada={ctx.puntos.activo}
                            onSeleccion={(payload) => emitir("punto_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetallePuntoVentaTpv
                        id={ctx.puntos.activo}
                        publicar={emitir}
                    />
                }
            />
            <CrearPuntoVentaTpv publicar={emitir} activo={ctx.estado === "CREANDO"} />
        </div>
    );
};
