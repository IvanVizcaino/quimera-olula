import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosLibroMayor, LibroMayor } from "../diseño.ts";
import { libroMayorVacio } from "../dominio.ts";
import {
    getLibroMayor,
    getResultadoLibroMayor,
    patchLibroMayor,
} from "../infraestructura.ts";
import {
    ContextoDetalleLibroMayor,
    EstadoDetalleLibroMayor,
} from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<
    EstadoDetalleLibroMayor,
    ContextoDetalleLibroMayor
>;

const pipeInforme = ejecutarListaProcesos<
    EstadoDetalleLibroMayor,
    ContextoDetalleLibroMayor
>;

export const metaLibroMayor: MetaModelo<LibroMayor> = {
    campos: {
        descripcion: { requerido: true },
        ejercicioId: { requerido: true },
    },
};

export const contextoDetalleLibroMayorInicial: ContextoDetalleLibroMayor = {
    estado: "INICIAL",
    informe: libroMayorVacio(),
    resultado: null,
};

const CAMPOS_SUELTOS = [
    "descripcion",
    "ejercicioId",
    "fechaDesde",
    "fechaHasta",
    "todasSubcuentas",
    "subcuentaDesde",
    "subcuentaHasta",
    "saldoInicial",
    "excluirPartidasCero",
    "orden",
    "tipoOrden",
] as const satisfies readonly (keyof CambiosLibroMayor)[];

/** Qué ha cambiado respecto a lo guardado. `infraestructura.ts` se encarga de
 * reagrupar el rango y el orden para la API. */
export const cambiosDeInforme = (
    previo: LibroMayor,
    actual: LibroMayor
): CambiosLibroMayor => {
    const cambios: CambiosLibroMayor = {};
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
    contexto: ContextoDetalleLibroMayor,
    informe: LibroMayor
): Promise<void> => {
    const cambios = cambiosDeInforme(contexto.informe, informe);
    if (Object.keys(cambios).length === 0) return;
    await patchLibroMayor(informe, cambios);
};

export const refrescarInforme: ProcesarDetalle = async (contexto) => {
    const informe = await getLibroMayor(contexto.informe.id);
    return [
        // Los criterios han cambiado: el resultado que había deja de valer.
        { ...contexto, informe, resultado: null },
        [["informe_cambiado", informe]],
    ];
};

export const calcularResultado: ProcesarDetalle = async (contexto) => {
    const resultado = await getResultadoLibroMayor(contexto.informe.id);
    return { ...contexto, resultado };
};

export const cargarInforme: (_: string) => ProcesarDetalle =
    (id) => async (contexto) => {
        const informe = await getLibroMayor(id);
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
        informe: libroMayorVacio(),
        resultado: null,
    };
};
