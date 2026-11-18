import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import {
    CambiosLibroFacturasRecibidas,
    LibroFacturasRecibidas,
} from "../diseño.ts";
import { libroFacturasRecibidasVacio } from "../dominio.ts";
import {
    getLibroFacturasRecibidas,
    getResultadoLibroFacturasRecibidas,
    patchLibroFacturasRecibidas,
} from "../infraestructura.ts";
import {
    ContextoDetalleLibroFacturasRecibidas,
    EstadoDetalleLibroFacturasRecibidas,
} from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<
    EstadoDetalleLibroFacturasRecibidas,
    ContextoDetalleLibroFacturasRecibidas
>;

const pipeInforme = ejecutarListaProcesos<
    EstadoDetalleLibroFacturasRecibidas,
    ContextoDetalleLibroFacturasRecibidas
>;

export const metaLibroFacturasRecibidas: MetaModelo<LibroFacturasRecibidas> = {
    campos: {
        descripcion: { requerido: true },
        ejercicioId: { requerido: true },
    },
};

export const contextoDetalleLibroFacturasRecibidasInicial: ContextoDetalleLibroFacturasRecibidas =
    {
        estado: "INICIAL",
        informe: libroFacturasRecibidasVacio(),
        resultado: null,
    };

const CAMPOS_SUELTOS = [
    "descripcion",
    "ejercicioId",
    "fechaDesde",
    "fechaHasta",
    "codigoSerie",
    "todos",
    "porcentaje",
    "conIva",
    "mostrarTotalFactura",
    "mostrarNif",
    "mostrarDocumento",
    "mostrarAsiento",
    "numeracionAutomatica",
    "numeroDesde",
] as const satisfies readonly (keyof CambiosLibroFacturasRecibidas)[];

/** Qué ha cambiado respecto a lo guardado. `infraestructura.ts` se encarga de
 * reagrupar el filtro y la presentación para la API. */
export const cambiosDeInforme = (
    previo: LibroFacturasRecibidas,
    actual: LibroFacturasRecibidas
): CambiosLibroFacturasRecibidas => {
    const cambios: CambiosLibroFacturasRecibidas = {};
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
    contexto: ContextoDetalleLibroFacturasRecibidas,
    informe: LibroFacturasRecibidas
): Promise<void> => {
    const cambios = cambiosDeInforme(contexto.informe, informe);
    if (Object.keys(cambios).length === 0) return;
    await patchLibroFacturasRecibidas(informe, cambios);
};

export const refrescarInforme: ProcesarDetalle = async (contexto) => {
    const informe = await getLibroFacturasRecibidas(contexto.informe.id);
    return [
        // Los criterios han cambiado: el resultado que había deja de valer.
        { ...contexto, informe, resultado: null },
        [["informe_cambiado", informe]],
    ];
};

export const calcularResultado: ProcesarDetalle = async (contexto) => {
    const resultado = await getResultadoLibroFacturasRecibidas(
        contexto.informe.id
    );
    return { ...contexto, resultado };
};

export const cargarInforme: (_: string) => ProcesarDetalle =
    (id) => async (contexto) => {
        const informe = await getLibroFacturasRecibidas(id);
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
        informe: libroFacturasRecibidasVacio(),
        resultado: null,
    };
};
