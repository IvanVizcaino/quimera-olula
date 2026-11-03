import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { CuentaEspecial } from "../diseño.ts";
import { cuentaEspecialVacia } from "../dominio.ts";
import {
    getCuentaEspecial,
    patchCuentaEspecial,
} from "../infraestructura.ts";
import {
    ContextoDetalleCuentaEspecial,
    EstadoDetalleCuentaEspecial,
} from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<
    EstadoDetalleCuentaEspecial,
    ContextoDetalleCuentaEspecial
>;

const pipeCuentaEspecial = ejecutarListaProcesos<
    EstadoDetalleCuentaEspecial,
    ContextoDetalleCuentaEspecial
>;

/** El código es la clave primaria: para cambiarlo hay que borrar y volver a
 * crear, así que aquí va en solo lectura. */
export const metaCuentaEspecial: MetaModelo<CuentaEspecial> = {
    campos: {
        descripcion: { requerido: true },
        codigoCuenta: { requerido: false },
        codigoSubcuenta: { requerido: false },
    },
};

export const contextoDetalleCuentaEspecialInicial: ContextoDetalleCuentaEspecial = {
    estado: 'INICIAL',
    cuentaEspecial: cuentaEspecialVacia(),
};

export const refrescarCuentaEspecial: ProcesarDetalle = async (contexto) => {
    const cuentaEspecial = await getCuentaEspecial(
        contexto.cuentaEspecial.id
    );
    return [
        { ...contexto, cuentaEspecial },
        [["cuenta_especial_cambiada", cuentaEspecial]],
    ];
};

export const guardarCuentaEspecial = async (
    contexto: ContextoDetalleCuentaEspecial,
    cuentaEspecial: CuentaEspecial
): Promise<void> => {
    const previa = contexto.cuentaEspecial;
    if (
        cuentaEspecial.descripcion !== previa.descripcion ||
        cuentaEspecial.codigoCuenta !== previa.codigoCuenta ||
        cuentaEspecial.codigoSubcuenta !== previa.codigoSubcuenta
    ) {
        await patchCuentaEspecial(cuentaEspecial.id, {
            descripcion: cuentaEspecial.descripcion,
            codigoCuenta: cuentaEspecial.codigoCuenta,
            codigoSubcuenta: cuentaEspecial.codigoSubcuenta,
        });
    }
};

export const cargarCuentaEspecial: (_: string) => ProcesarDetalle =
    (idCuentaEspecial) => async (contexto) => {
        const cuentaEspecial = await getCuentaEspecial(idCuentaEspecial);
        return pipeCuentaEspecial(contexto, [
            async (ctx) => ({ ...ctx, cuentaEspecial }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idCuentaEspecial = payload as string;
    if (idCuentaEspecial) {
        return cargarCuentaEspecial(idCuentaEspecial)(contexto);
    }
    return {
        ...contexto,
        estado: 'INICIAL',
        cuentaEspecial: cuentaEspecialVacia(),
    };
};
