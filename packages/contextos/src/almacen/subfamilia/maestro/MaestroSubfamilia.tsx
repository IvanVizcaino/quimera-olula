import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado, MaestroDetalle, QBoton } from "@olula/componentes/index.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { Subfamilia } from "../diseño.ts";
import { CrearSubfamilia } from "../crear/CrearSubfamilia.tsx";
import { DetalleSubfamilia } from "../detalle/DetalleSubfamilia.tsx";
import { metaTablaSubfamilia } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroSubfamilia = () => {
    const { id, criteria } = getUrlParams();

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        subfamilias: listaActivaEntidadesInicial<Subfamilia>(id, criteria),
    });

    useUrlParams(ctx.subfamilias.activo, ctx.subfamilias.criteria);

    useEffect(() => {
        emitir("recarga_solicitada", ctx.subfamilias.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Subfamilia">
            <MaestroDetalle<Subfamilia>
                seleccionada={ctx.subfamilias.activo}
                layout="TABLA"
                Maestro={
                    <>
                        <h2>Subfamilias</h2>
                        <div className="maestro-botones">
                            <QBoton onClick={() => emitir("crear")}>Nueva</QBoton>
                        </div>
                        <Listado<Subfamilia>
                            metaTabla={metaTablaSubfamilia}
                            criteria={ctx.subfamilias.criteria}
                            modo="tabla"
                            entidades={ctx.subfamilias.lista}
                            totalEntidades={ctx.subfamilias.total}
                            seleccionada={ctx.subfamilias.activo}
                            onSeleccion={(payload) => emitir("subfamilia_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetalleSubfamilia
                        id={ctx.subfamilias.activo}
                        publicar={emitir}
                    />
                }
            />
            <CrearSubfamilia publicar={emitir} activo={ctx.estado === "CREANDO"} />
        </div>
    );
};
