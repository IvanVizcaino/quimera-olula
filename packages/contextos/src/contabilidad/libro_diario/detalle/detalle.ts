import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosLibroDiario, LibroDiario } from "../diseño.ts";
import { libroDiarioVacio } from "../dominio.ts";
import {
    getLibroDiario,
    getResultadoLibroDiario,
    patchLibroDiario,
} from "../infraestructura.ts";
import {
    ContextoDetalleLibroDiario,
    EstadoDetalleLibroDiario,
} from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<
    EstadoDetalleLibroDiario,
    ContextoDetalleLibroDiario
>;

const pipeInforme = ejecutarListaProcesos<
    EstadoDetalleLibroDiario,
    ContextoDetalleLibroDiario
>;

export const metaLibroDiario: MetaModelo<LibroDiario> = {
    campos: {
        descripcion: { requerido: true },
        ejercicioId: { requerido: true },
    },
};

export const contextoDetalleLibroDiarioInicial: ContextoDetalleLibroDiario = {
    estado: "INICIAL",
    informe: libroDiarioVacio(),
    resultado: null,
};

const CAMPOS_SUELTOS = [
    "descripcion",
    "ejercicioId",
    "fechaDesde",
    "fechaHasta",
    "datosIva",
    "agruparMeses",
    "resumenMensual",
    "todosAsientos",
    "asientoDesde",
    "asientoHasta",
    "todasSubcuentas",
    "subcuentaDesde",
    "subcuentaHasta",
    "orden1",
    "tipoOrden1",
    "orden2",
    "tipoOrden2",
    "orden3",
    "tipoOrden3",
] as const satisfies readonly (keyof CambiosLibroDiario)[];

/** Qué ha cambiado respecto a lo guardado. `infraestructura.ts` se encarga de
 * reagrupar los rangos y los niveles de orden para la API. */
export const cambiosDeInforme = (
    previo: LibroDiario,
    actual: LibroDiario
): CambiosLibroDiario => {
    const cambios: CambiosLibroDiario = {};
    CAMPOS_SUELTOS.forEach((campo) => {
        if (actual[campo] !== previo[campo]) {
            // El tipo de cada campo coincide en ambos lados; TS no lo deduce
            // al indexar con una unión de claves.
            (cambios as Record<string, unknown>)[campo] = actual[campo];
        }
    });
    return cambios;
};

export const guardarInforme = async (
    contexto: ContextoDetalleLibroDiario,
    informe: LibroDiario
): Promise<void> => {
    const cambios = cambiosDeInforme(contexto.informe, informe);
    if (Object.keys(cambios).length === 0) return;
    await patchLibroDiario(informe, cambios);
};

export const refrescarInforme: ProcesarDetalle = async (contexto) => {
    const informe = await getLibroDiario(contexto.informe.id);
    return [
        // Los criterios han cambiado: el resultado que había deja de valer.
        { ...contexto, informe, resultado: null },
        [["informe_cambiado", informe]],
    ];
};

export const calcularResultado: ProcesarDetalle = async (contexto) => {
    const resultado = await getResultadoLibroDiario(contexto.informe.id);
    return { ...contexto, resultado };
};

export const cargarInforme: (_: string) => ProcesarDetalle =
    (id) => async (contexto) => {
        const informe = await getLibroDiario(id);
        return pipeInforme(contexto, [
            async (ctx) => ({ ...ctx, informe, resultado: null }),
            "ABIERTO",
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) {
        return cargarInforme(id)(contexto);
    }
    return {
        ...contexto,
        estado: "INICIAL",
        informe: libroDiarioVacio(),
        resultado: null,
    };
};
