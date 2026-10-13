import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado, MaestroDetalle } from "@olula/componentes/index.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { ValeEmitido } from "../diseño.ts";
import { AnularVale } from "../anular/AnularVale.tsx";
import { metaTablaVales } from "./diseño.ts";
import { getMaquinaVales } from "./maquina.ts";
import { recargarVales } from "./dominio.ts";

export const MaestroValesTpv = () => {
    const { id, criteria } = getUrlParams();

    const { ctx, emitir } = useMaquina(getMaquinaVales, {
        estado: "INICIAL",
        vales: listaActivaEntidadesInicial<ValeEmitido>(id, criteria),
    });

    useUrlParams(ctx.vales.activo, ctx.vales.criteria);

    useEffect(() => {
        emitir("recarga_solicitada", ctx.vales.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const valeActivo = ctx.vales.lista.find((v) => v.id === ctx.vales.activo) ?? null;

    return (
        <div className="ValesTpv">
            <MaestroDetalle<ValeEmitido>
                seleccionada={ctx.vales.activo}
                layout="TABLA"
                Maestro={
                    <>
                        <h2>Vales</h2>
                        <Listado<ValeEmitido>
                            metaTabla={metaTablaVales}
                            criteria={ctx.vales.criteria}
                            modo="tabla"
                            entidades={ctx.vales.lista}
                            totalEntidades={ctx.vales.total}
                            seleccionada={ctx.vales.activo}
                            onSeleccion={(payload) => emitir("vale_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                        />
                    </>
                }
                Detalle={
                    valeActivo && !valeActivo.anulado ? (
                        <div className="maestro-botones">
                            <button onClick={() => emitir("anular_solicitado")}>Anular</button>
                        </div>
                    ) : null
                }
            />
            {ctx.estado === "ANULANDO" && valeActivo && (
                <AnularVale
                    vale={valeActivo}
                    publicar={emitir}
                />
            )}
        </div>
    );
};

// Re-export so dominio tests can import without the view.
export { recargarVales };
