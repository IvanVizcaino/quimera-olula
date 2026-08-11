import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { pipe } from "@olula/lib/funcional.js";
import { EstadoOportunidad } from "../diseño.ts";
import { getEstadoOportunidad, marcarPorDefectoEstadoOportunidad, patchEstadoOportunidad } from "../infraestructura.ts";
import { ContextoDetalleEstadoOportunidad, EstadoDetalleEstadoOportunidad } from "./diseño.ts";

export const estadoOportunidadVacio: EstadoOportunidad = {
    id: '',
    estadobase: 'Pendiente',
    descripcion: '',
    probabilidad: 0,
    valorDefecto: false,
};

export const metaEstadoOportunidad: MetaModelo<EstadoOportunidad> = {
    campos: {
        id: { requerido: true },
        estadobase: { requerido: true, tipo: "selector" },
        descripcion: { requerido: true, validacion: (estado: EstadoOportunidad) => stringNoVacio(estado.descripcion), },
        probabilidad: { requerido: true, tipo: "numero" },
        valorDefecto: { requerido: true, tipo: "checkbox" },
    },
};

type ProcesarEstadoOportunidad = ProcesarContexto<EstadoDetalleEstadoOportunidad, ContextoDetalleEstadoOportunidad>;

const pipeEstadoOportunidad = ejecutarListaProcesos<EstadoDetalleEstadoOportunidad, ContextoDetalleEstadoOportunidad>;

const conEstadoOportunidad = (estado_oportunidad: EstadoOportunidad) => (ctx: ContextoDetalleEstadoOportunidad) => ({ ...ctx, estado_oportunidad });
const conEstado = (estado: EstadoDetalleEstadoOportunidad) => (ctx: ContextoDetalleEstadoOportunidad) => ({ ...ctx, estado });

const cargarEstadoOportunidad: (_: string) => ProcesarEstadoOportunidad = (id) =>
    async (contexto) => {
        const estado_oportunidad = await getEstadoOportunidad(id);

        return pipe(
            contexto,
            conEstadoOportunidad(estado_oportunidad)
        )
    }

export const refrescarEstadoOportunidad: ProcesarEstadoOportunidad = async (contexto) => {
    const estado_oportunidad = await getEstadoOportunidad(contexto.estado_oportunidad.id);

    return [
        pipe(
            contexto,
            conEstadoOportunidad({
                ...contexto.estado_oportunidad,
                ...estado_oportunidad
            })
        ),
        [["estado_oportunidad_cambiado", estado_oportunidad]]
    ]
}

export const cambiarEstadoOportunidad: ProcesarEstadoOportunidad = async (contexto, payload) => {
    const estado_oportunidad = payload as EstadoOportunidad;
    await patchEstadoOportunidad(contexto.estado_oportunidad.id, estado_oportunidad)

    return pipeEstadoOportunidad(contexto, [
        refrescarEstadoOportunidad,
        "INICIAL",
    ]);
}

export const marcarPorDefecto: ProcesarEstadoOportunidad = async (contexto, _) => {
    await marcarPorDefectoEstadoOportunidad(contexto.estado_oportunidad.id);

    return pipeEstadoOportunidad(contexto, [
        refrescarEstadoOportunidad,
        "INICIAL"
    ])
}

export const getContextoVacio: ProcesarEstadoOportunidad = async (contexto) => {
    return pipe(
        contexto,
        conEstado("INICIAL"),
        conEstadoOportunidad(estadoOportunidadVacio)
    )
}

export const cargarContexto: ProcesarEstadoOportunidad = async (contexto, payload) => {
    const id = payload as string;

    if (!id) return getContextoVacio(contexto);

    return pipeEstadoOportunidad(
        contexto,
        [cargarEstadoOportunidad(id)],
        payload
    );
}
