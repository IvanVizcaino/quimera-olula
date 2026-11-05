import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { Subcuenta } from "../diseño.ts";
import { subcuentaVacia } from "../dominio.ts";
import { getSubcuenta, patchSubcuenta } from "../infraestructura.ts";
import { ContextoDetalleSubcuenta, EstadoDetalleSubcuenta } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleSubcuenta, ContextoDetalleSubcuenta>;

const pipeSubcuenta = ejecutarListaProcesos<EstadoDetalleSubcuenta, ContextoDetalleSubcuenta>;

/** Solo la descripción es editable. El código, la cuenta y el ejercicio los
 * fija el alta; el impuesto y sus tasas aún no los acepta el endpoint de
 * cambio (ver PATCH /contabilidad/subcuenta), así que van en solo lectura. */
export const metaSubcuenta: MetaModelo<Subcuenta> = {
    campos: {
        nombre: { requerido: true },
    },
};

export const contextoDetalleSubcuentaInicial: ContextoDetalleSubcuenta = {
    estado: 'INICIAL',
    subcuenta: subcuentaVacia(),
};

export const refrescarSubcuenta: ProcesarDetalle = async (contexto) => {
    const subcuenta = await getSubcuenta(contexto.subcuenta.id);
    return [
        { ...contexto, subcuenta },
        [["subcuenta_cambiada", subcuenta]],
    ];
};

export const guardarSubcuenta = async (
    contexto: ContextoDetalleSubcuenta,
    subcuenta: Subcuenta
): Promise<void> => {
    if (subcuenta.nombre !== contexto.subcuenta.nombre) {
        await patchSubcuenta(subcuenta.id, { nombre: subcuenta.nombre });
    }
};

export const cargarSubcuenta: (_: string) => ProcesarDetalle =
    (idSubcuenta) => async (contexto) => {
        const subcuenta = await getSubcuenta(idSubcuenta);
        return pipeSubcuenta(contexto, [
            async (ctx) => ({ ...ctx, subcuenta }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idSubcuenta = payload as string;
    if (idSubcuenta) {
        return cargarSubcuenta(idSubcuenta)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', subcuenta: subcuentaVacia() };
};
