import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado, MaestroDetalle, QBoton } from "@olula/componentes/index.ts";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { Subcuenta } from "../diseño.ts";
import { CrearSubcuenta } from "../crear/CrearSubcuenta.tsx";
import { DetalleSubcuenta } from "../detalle/DetalleSubcuenta.tsx";
import {
    criteriaConEjercicio,
    ejercicioIdDesdeCriteria,
} from "./dominio.ts";
import { metaTablaSubcuenta, ordenDefectoSubcuenta } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { EJERCICIO_DEFECTO_SUBCUENTA } from "../dominio.ts";

export const MaestroSubcuenta = () => {
    const { id, criteria: criteriaUrl } = getUrlParams(ordenDefectoSubcuenta);
    const ejercicioInicial =
        ejercicioIdDesdeCriteria(criteriaUrl) ?? EJERCICIO_DEFECTO_SUBCUENTA;
    const criteria = criteriaConEjercicio(ejercicioInicial, criteriaUrl);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        ejercicioId: ejercicioInicial,
        subcuentas: listaActivaEntidadesInicial<Subcuenta>(id, criteria),
    });

    useUrlParams(ctx.subcuentas.activo, ctx.subcuentas.criteria, ordenDefectoSubcuenta);

    useEffect(() => {
        emitir("recarga_solicitada", ctx.subcuentas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Subcuenta">
            <MaestroDetalle<Subcuenta>
                seleccionada={ctx.subcuentas.activo}
                layout="TABLA"
                Maestro={
                    <>
                        <h2>Plan de cuentas — subcuentas</h2>
                        <quimera-formulario className="filtro-ejercicio">
                            <QInput
                                label="Ejercicio"
                                nombre="ejercicio_id"
                                valor={ctx.ejercicioId}
                                onChange={(v) => emitir("ejercicio_cambiado", v)}
                            />
                        </quimera-formulario>
                        <div className="maestro-botones">
                            <QBoton onClick={() => emitir("crear")}>Nueva subcuenta</QBoton>
                        </div>
                        <Listado<Subcuenta>
                            metaTabla={metaTablaSubcuenta}
                            criteria={ctx.subcuentas.criteria}
                            modo="tabla"
                            entidades={ctx.subcuentas.lista}
                            totalEntidades={ctx.subcuentas.total}
                            seleccionada={ctx.subcuentas.activo}
                            onSeleccion={(payload) => emitir("subcuenta_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetalleSubcuenta
                        id={ctx.subcuentas.activo}
                        publicar={emitir}
                    />
                }
            />
            <CrearSubcuenta
                publicar={emitir}
                activo={ctx.estado === "CREANDO"}
                ejercicioId={ctx.ejercicioId}
            />
        </div>
    );
};
