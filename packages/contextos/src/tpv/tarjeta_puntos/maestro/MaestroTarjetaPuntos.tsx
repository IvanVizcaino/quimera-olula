import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado, MaestroDetalle, QBoton } from "@olula/componentes/index.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { TarjetaPuntos } from "../diseño.ts";
import { CrearTarjetaPuntos } from "../crear/CrearTarjetaPuntos.tsx";
import { DetalleTarjetaPuntos } from "../detalle/DetalleTarjetaPuntos.tsx";
import { metaTablaTarjetaPuntos } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroTarjetaPuntos = () => {
    const { id, criteria } = getUrlParams();

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        tarjetas: listaActivaEntidadesInicial<TarjetaPuntos>(id, criteria),
    });

    useUrlParams(ctx.tarjetas.activo, ctx.tarjetas.criteria);

    useEffect(() => {
        emitir("recarga_solicitada", ctx.tarjetas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="TarjetaPuntos">
            <MaestroDetalle<TarjetaPuntos>
                seleccionada={ctx.tarjetas.activo}
                layout="TABLA"
                Maestro={
                    <>
                        <h2>Tarjetas de Puntos</h2>
                        <div className="maestro-botones">
                            <QBoton onClick={() => emitir("crear")}>Nueva</QBoton>
                        </div>
                        <Listado<TarjetaPuntos>
                            metaTabla={metaTablaTarjetaPuntos}
                            criteria={ctx.tarjetas.criteria}
                            modo="tabla"
                            entidades={ctx.tarjetas.lista}
                            totalEntidades={ctx.tarjetas.total}
                            seleccionada={ctx.tarjetas.activo}
                            onSeleccion={(payload) => emitir("tarjeta_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetalleTarjetaPuntos
                        id={ctx.tarjetas.activo}
                        publicar={emitir}
                    />
                }
            />
            <CrearTarjetaPuntos publicar={emitir} activo={ctx.estado === "CREANDO"} />
        </div>
    );
};
