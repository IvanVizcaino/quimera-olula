import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.tsx";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useLayout } from "@olula/lib/useLayout.js";
import { useEffect } from "react";
import { Ubicacion } from "../../diseño.ts";
import { CrearUbicacion } from "../crear/CrearUbicacion.tsx";
import { DetalleUbicacion } from "../detalle/DetalleUbicacion.tsx";
import { metaTablaUbicacion } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetalleUbicacion = () => {
    const { layout, cambiarLayout } = useLayout("TABLA");

    const { id, criteria } = getUrlParams();

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        ubicaciones: listaActivaEntidadesInicial<Ubicacion>(id, criteria),
    });

    useUrlParams(ctx.ubicaciones.activo, ctx.ubicaciones.criteria);

    useEffect(() => {
        emitir("recarga_de_ubicaciones_solicitada", ctx.ubicaciones.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Ubicacion">
            <MaestroDetalle<Ubicacion>
                Maestro={
                    <>
                        <h2>Ubicaciones</h2>
                        <div className="maestro-botones">
                            <QBoton onClick={() => emitir("crear")}>Nueva</QBoton>
                            <span
                                className="cambio-modo-icono"
                                onClick={cambiarLayout}
                            >
                                <QIcono
                                    nombre={layout === "TABLA" ? "lista" : "tabla"}
                                    tamaño="md"
                                />
                            </span>
                        </div>
                        <Listado<Ubicacion>
                            metaTabla={metaTablaUbicacion}
                            criteria={ctx.ubicaciones.criteria}
                            modo={layout === "TARJETA" ? "tarjetas" : "tabla"}
                            tarjeta={TarjetaUbicacion}
                            entidades={ctx.ubicaciones.lista}
                            totalEntidades={ctx.ubicaciones.total}
                            seleccionada={ctx.ubicaciones.activo}
                            onSeleccion={(payload) => emitir("ubicacion_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetalleUbicacion
                        id={ctx.ubicaciones.activo}
                        publicar={emitir}
                    />
                }
                layout={layout}
                seleccionada={ctx.ubicaciones.activo}
                modoDisposicion="maestro-50"
            />
            {ctx.estado === "CREANDO" && (
                <CrearUbicacion publicar={emitir} activo={true} />
            )}
        </div>
    );
};

const TarjetaUbicacion = (ubicacion: Ubicacion) => {
    return (
        <div className="tarjeta-ubicacion" key={ubicacion.id}>
            <div>{ubicacion.codigo}</div>
            <div>{ubicacion.zona}</div>
        </div>
    );
};
