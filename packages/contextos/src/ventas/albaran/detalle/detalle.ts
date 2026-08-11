import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, publicar } from "@olula/lib/dominio.ts";
import {
    Albaran,
    CambioClienteAlbaran,
    LineaAlbaran
} from "../diseño.ts";
import { albaranVacioContexto } from "../dominio.ts";
import {
    getAlbaran,
    getLineas,
    patchAlbaran,
    patchCambiarCliente,
    patchCambiarDescuento,
    patchCantidadLinea
} from "../infraestructura.ts";
import { ContextoAlbaran, EstadoAlbaran } from "./diseño.ts";

type ProcesarAlbaran = ProcesarContexto<EstadoAlbaran, ContextoAlbaran>;

const pipeAlbaran = ejecutarListaProcesos<EstadoAlbaran, ContextoAlbaran>;

const cargarAlbaran: (_: string) => ProcesarAlbaran = (idAlbaran) =>
    async (contexto) => {
        const albaran = await getAlbaran(idAlbaran);
        return {
            ...contexto,
            albaran,
        }
    }

export const refrescarAlbaran: ProcesarAlbaran = async (contexto) => {
    const albaran = await getAlbaran(contexto.albaran.id);
    return [
        {
            ...contexto,
            albaran: {
                ...contexto.albaran,
                ...albaran
            },
        },
        [["albaran_cambiado", albaran]]
    ]
}

export const cancelarCambioAlbaran: ProcesarAlbaran = async (contexto) => {
    return {
        ...contexto,
        albaran: contexto.albaranInicial
    }
}

export const abiertoOFacturado: ProcesarAlbaran = async (contexto) => {
    const esFacturado = !!contexto.albaran.idfactura;
    return {
        ...contexto,
        estado: esFacturado ? "FACTURADO" : "ABIERTO"
    }
}

export const refrescarLineas: ProcesarAlbaran = async (contexto) => {
    const lineas = await getLineas(contexto.albaran.id);
    return {
        ...contexto,
        albaran: {
            ...contexto.albaran,
            lineas: lineas as LineaAlbaran[]
        }
    }
}

export const activarLinea: ProcesarAlbaran = async (contexto, payload) => {
    const lineaActiva = payload as LineaAlbaran;
    return {
        ...contexto,
        lineaActiva
    }
}

const activarLineaPorIndice = (indice: number) => async (contexto: ContextoAlbaran) => {
    const lineas = contexto.albaran.lineas as LineaAlbaran[];
    const lineaActiva = lineas.length > 0
        ? indice >= 0 && indice < lineas.length
            ? lineas[indice]
            : lineas[lineas.length - 1]
        : null

    return {
        ...contexto,
        lineaActiva
    }
}

export const getContextoVacio: ProcesarAlbaran = async (contexto) => {
    return {
        ...contexto,
        estado: 'INICIAL',
        albaran: albaranVacioContexto(),
        lineaActiva: null
    }
}

export const cargarContexto: ProcesarAlbaran = async (contexto, payload) => {
    const idAlbaran = payload as string;
    if (idAlbaran) {
        return pipeAlbaran(
            contexto,
            [
                cargarAlbaran(idAlbaran),
                refrescarLineas,
                abiertoOFacturado,
                activarLineaPorIndice(0),
            ],
            payload
        );
    } else {
        return getContextoVacio(contexto);
    }
}

export const cambiarAlbaran: ProcesarAlbaran = async (contexto, payload) => {
    const albaran = payload as Albaran;
    await patchAlbaran(contexto.albaran.id, albaran);

    return pipeAlbaran(contexto, [
        refrescarAlbaran,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const borrarAlbaran: ProcesarAlbaran = async (contexto) => {
    return pipeAlbaran(contexto, [
        publicar('albaran_borrado', (ctx) => ctx.albaran),
        getContextoVacio,
    ]);
}

export const cambiarCliente: ProcesarAlbaran = async (contexto, payload) => {
    const cambio = payload as CambioClienteAlbaran;
    await patchCambiarCliente(contexto.albaran.id, cambio);

    return pipeAlbaran(contexto, [
        refrescarAlbaran,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const cambiarDescuento: ProcesarAlbaran = async (contexto, payload) => {
    const { dto_porcentual } = payload as { dto_porcentual: number };
    await patchCambiarDescuento(contexto.albaran.id, dto_porcentual);

    return pipeAlbaran(contexto, [
        refrescarAlbaran,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const crearLinea: ProcesarAlbaran = async (contexto) => {

    return pipeAlbaran(contexto, [
        refrescarAlbaran,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const cambiarLinea: ProcesarAlbaran = async (contexto) => {

    return pipeAlbaran(contexto, [
        refrescarAlbaran,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const cambiarCantidadLinea: ProcesarAlbaran = async (contexto, payload) => {
    const { lineaId, cantidad } = payload as { lineaId: string, cantidad: number };

    const linea = (contexto.albaran.lineas as LineaAlbaran[]).find((l: LineaAlbaran) => l.id === lineaId);
    if (!linea) return contexto;

    await patchCantidadLinea(contexto.albaran.id, linea, cantidad);

    const lineasActualizadas = await getLineas(contexto.albaran.id);
    const albaranActualizado = await getAlbaran(contexto.albaran.id);

    return {
        estado: "ABIERTO" as EstadoAlbaran,
        albaran: {
            ...albaranActualizado,
            lineas: lineasActualizadas
        },
        albaranInicial: contexto.albaranInicial,
        lineaActiva: lineasActualizadas.find(l => l.id === lineaId) || null,
    };
}

export const borrarLinea: ProcesarAlbaran = async (contexto, payload) => {

    const idLinea = payload as string;
    const indiceLineaActiva = (contexto.albaran.lineas as LineaAlbaran[]).findIndex((l: LineaAlbaran) => l.id === idLinea);

    return pipeAlbaran(contexto, [
        refrescarAlbaran,
        refrescarLineas,
        activarLineaPorIndice(indiceLineaActiva),
        'ABIERTO',
    ]);
}
