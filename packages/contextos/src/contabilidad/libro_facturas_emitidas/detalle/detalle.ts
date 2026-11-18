import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import {
    CambiosLibroFacturasEmitidas,
    LibroFacturasEmitidas,
} from "../diseño.ts";
import { libroFacturasEmitidasVacio } from "../dominio.ts";
import {
    getLibroFacturasEmitidas,
    getResultadoLibroFacturasEmitidas,
    patchLibroFacturasEmitidas,
} from "../infraestructura.ts";
import {
    ContextoDetalleLibroFacturasEmitidas,
    EstadoDetalleLibroFacturasEmitidas,
} from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<
    EstadoDetalleLibroFacturasEmitidas,
    ContextoDetalleLibroFacturasEmitidas
>;

const pipeInforme = ejecutarListaProcesos<
    EstadoDetalleLibroFacturasEmitidas,
    ContextoDetalleLibroFacturasEmitidas
>;

export const metaLibroFacturasEmitidas: MetaModelo<LibroFacturasEmitidas> = {
    campos: {
        descripcion: { requerido: true },
        ejercicioId: { requerido: true },
    },
};

export const contextoDetalleLibroFacturasEmitidasInicial: ContextoDetalleLibroFacturasEmitidas =
    {
        estado: "INICIAL",
        informe: libroFacturasEmitidasVacio(),
        resultado: null,
    };

const CAMPOS_SUELTOS = [
    "descripcion",
    "ejercicioId",
    "fechaDesde",
    "fechaHasta",
    "todos",
    "porcentaje",
    "conIva",
    "mostrarTotalFactura",
    "mostrarNif",
    "mostrarDocumento",
    "mostrarAsiento",
    "numeracionAutomatica",
    "numeroDesde",
] as const satisfies readonly (keyof CambiosLibroFacturasEmitidas)[];

/** Qué ha cambiado respecto a lo guardado. `infraestructura.ts` se encarga de
 * reagrupar el filtro y la presentación para la API. */
export const cambiosDeInforme = (
    previo: LibroFacturasEmitidas,
    actual: LibroFacturasEmitidas
): CambiosLibroFacturasEmitidas => {
    const cambios: CambiosLibroFacturasEmitidas = {};
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
    contexto: ContextoDetalleLibroFacturasEmitidas,
    informe: LibroFacturasEmitidas
): Promise<void> => {
    const cambios = cambiosDeInforme(contexto.informe, informe);
    if (Object.keys(cambios).length === 0) return;
    await patchLibroFacturasEmitidas(informe, cambios);
};

export const refrescarInforme: ProcesarDetalle = async (contexto) => {
    const informe = await getLibroFacturasEmitidas(contexto.informe.id);
    return [
        // Los criterios han cambiado: el resultado que había deja de valer.
        { ...contexto, informe, resultado: null },
        [["informe_cambiado", informe]],
    ];
};

export const calcularResultado: ProcesarDetalle = async (contexto) => {
    const resultado = await getResultadoLibroFacturasEmitidas(
        contexto.informe.id
    );
    return { ...contexto, resultado };
};

export const cargarInforme: (_: string) => ProcesarDetalle =
    (id) => async (contexto) => {
        const informe = await getLibroFacturasEmitidas(id);
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
        informe: libroFacturasEmitidasVacio(),
        resultado: null,
    };
};
