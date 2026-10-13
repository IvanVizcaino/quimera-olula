import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado, MaestroDetalle, QBoton } from "@olula/componentes/index.ts";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { Cuenta } from "../diseño.ts";
import { CrearCuenta } from "../crear/CrearCuenta.tsx";
import { DetalleCuenta } from "../detalle/DetalleCuenta.tsx";
import {
    criteriaConEjercicio,
    ejercicioIdDesdeCriteria,
} from "./dominio.ts";
import { metaTablaCuenta, ordenDefectoCuenta } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { EJERCICIO_DEFECTO_CUENTA } from "../dominio.ts";

export const MaestroCuenta = () => {
    const { id, criteria: criteriaUrl } = getUrlParams(ordenDefectoCuenta);
    const ejercicioInicial =
        ejercicioIdDesdeCriteria(criteriaUrl) ?? EJERCICIO_DEFECTO_CUENTA;
    const criteria = criteriaConEjercicio(ejercicioInicial, criteriaUrl);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        ejercicioId: ejercicioInicial,
        cuentas: listaActivaEntidadesInicial<Cuenta>(id, criteria),
    });

    useUrlParams(ctx.cuentas.activo, ctx.cuentas.criteria, ordenDefectoCuenta);

    useEffect(() => {
        emitir("recarga_solicitada", ctx.cuentas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Cuenta">
            <MaestroDetalle<Cuenta>
                seleccionada={ctx.cuentas.activo}
                layout="TABLA"
                Maestro={
                    <>
                        <h2>Plan de cuentas — cuentas PGC</h2>
                        <quimera-formulario className="filtro-ejercicio">
                            <QInput
                                label="Ejercicio"
                                nombre="ejercicio_id"
                                valor={ctx.ejercicioId}
                                onChange={(v) => emitir("ejercicio_cambiado", v)}
                            />
                        </quimera-formulario>
                        <div className="maestro-botones">
                            <QBoton onClick={() => emitir("crear")}>Nueva cuenta</QBoton>
                        </div>
                        <Listado<Cuenta>
                            metaTabla={metaTablaCuenta}
                            criteria={ctx.cuentas.criteria}
                            modo="tabla"
                            entidades={ctx.cuentas.lista}
                            totalEntidades={ctx.cuentas.total}
                            seleccionada={ctx.cuentas.activo}
                            onSeleccion={(payload) => emitir("cuenta_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetalleCuenta
                        id={ctx.cuentas.activo}
                        publicar={emitir}
                    />
                }
            />
            <CrearCuenta
                publicar={emitir}
                activo={ctx.estado === "CREANDO"}
                ejercicioId={ctx.ejercicioId}
            />
        </div>
    );
};
