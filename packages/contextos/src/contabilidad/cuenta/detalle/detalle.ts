import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { Cuenta } from "../diseño.ts";
import { cuentaVacia } from "../dominio.ts";
import { getCuenta, patchCuenta } from "../infraestructura.ts";
import { ContextoDetalleCuenta, EstadoDetalleCuenta } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleCuenta, ContextoDetalleCuenta>;

const pipeCuenta = ejecutarListaProcesos<EstadoDetalleCuenta, ContextoDetalleCuenta>;

/** En una cuenta del PGC solo la descripción es editable: el código, el
 * epígrafe y el ejercicio los fija el alta. */
export const metaCuenta: MetaModelo<Cuenta> = {
    campos: {
        nombre: { requerido: true },
    },
};

export const contextoDetalleCuentaInicial: ContextoDetalleCuenta = {
    estado: 'INICIAL',
    cuenta: cuentaVacia(),
};

export const refrescarCuenta: ProcesarDetalle = async (contexto) => {
    const cuenta = await getCuenta(contexto.cuenta.id);
    return [
        { ...contexto, cuenta },
        [["cuenta_cambiada", cuenta]],
    ];
};

export const guardarCuenta = async (
    contexto: ContextoDetalleCuenta,
    cuenta: Cuenta
): Promise<void> => {
    if (cuenta.nombre !== contexto.cuenta.nombre) {
        await patchCuenta(cuenta.id, { nombre: cuenta.nombre });
    }
};

export const cargarCuenta: (_: string) => ProcesarDetalle =
    (idCuenta) => async (contexto) => {
        const cuenta = await getCuenta(idCuenta);
        return pipeCuenta(contexto, [
            async (ctx) => ({ ...ctx, cuenta }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idCuenta = payload as string;
    if (idCuenta) {
        return cargarCuenta(idCuenta)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', cuenta: cuentaVacia() };
};
