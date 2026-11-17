import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearFormaPago } from "../crear/CrearFormaPago.tsx";
import { DetalleFormaPago } from "../detalle/DetalleFormaPago.tsx";
import { FormaPago } from "../diseño.ts";
import { REGLA_FORMA_PAGO } from "../dominio.ts";
import { criteriaFormasPagoDefecto, metaFiltroFormaPago, metaTablaFormaPago } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

/** Formas de pago (Eneboo `formaspago.ui` con su tabla de plazos). */
export const MaestroConDetalleFormaPago = () => {

    const criteriaInicial = useMemo(criteriaFormasPagoDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        formasPago: listaActivaEntidadesInicial<FormaPago>(undefined, criteriaInicial),
    });

    const { estado, formasPago } = ctx;

    const autorizado = puede(REGLA_FORMA_PAGO);

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_formas_pago_solicitada", formasPago.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>No tienes permiso para ver las formas de pago.</p>;
    }

    return (
        <div className="FormaPago">
            <MaestroDetalle<FormaPago>
                seleccionada={formasPago.activo}
                Maestro={
                    <>
                        <h2>Formas de pago</h2>
                        <Listado<FormaPago>
                            metaTabla={metaTablaFormaPago}
                            metaFiltro={metaFiltroFormaPago}
                            criteria={formasPago.criteria}
                            modoInicial="tabla"
                            entidades={formasPago.lista}
                            totalEntidades={formasPago.total}
                            seleccionada={formasPago.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_forma_pago_solicitada")}>
                                        Nueva forma de pago
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("forma_pago_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleFormaPago id={formasPago.activo} publicar={emitir} />}
            />

            {estado === "CREANDO" && <CrearFormaPago publicar={emitir} />}
        </div>
    );
};
