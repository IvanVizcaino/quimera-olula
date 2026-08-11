import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { pipe } from "@olula/lib/funcional.js";
import { Accion } from "../diseño.ts";
import { getAccion, patchAccion } from "../infraestructura.ts";
import { ContextoDetalleAccion, EstadoDetalleAccion } from "./diseño.ts";

export const accionVacia: Accion = {
    id: "",
    fecha: new Date(),
    fecha_fin: null,
    descripcion: "",
    estado: "",
    observaciones: "",
    agente_id: "",
    tipo: "",
    cliente_id: "",
    nombre_cliente: "",
    contacto_id: "",
    nombre_contacto: "",
    oportunidad_id: "",
    descripcion_oportunidad: "",
    tarjeta_id: "",
    incidencia_id: "",
    usuario_id: "",
    cliente: null,
};

export const metaAccion: MetaModelo<Accion> = {
    campos: {
        fecha: { requerido: true, tipo: "fecha" },
        descripcion: { requerido: true, validacion: (accion: Accion) => stringNoVacio(accion.descripcion) },
        observaciones: { requerido: false },
        agente_id: { requerido: false },
        tipo: { requerido: false },
    },
};

type ProcesarAccion = ProcesarContexto<EstadoDetalleAccion, ContextoDetalleAccion>;

const pipeAccion = ejecutarListaProcesos<EstadoDetalleAccion, ContextoDetalleAccion>;

const conAccion = (accion: Accion) => (ctx: ContextoDetalleAccion) => ({ ...ctx, accion });
const conEstado = (estado: EstadoDetalleAccion) => (ctx: ContextoDetalleAccion) => ({ ...ctx, estado });

const cargarAccion: (_: string) => ProcesarAccion = (id) =>
    async (contexto) => {
        const accion = await getAccion(id);

        return pipe(
            contexto,
            conAccion(accion)
        )
    }

export const refrescarAccion: ProcesarAccion = async (contexto) => {
    const accion = await getAccion(contexto.accion.id);

    return [
        pipe(
            contexto,
            conAccion({
                ...contexto.accion,
                ...accion
            })
        ),
        [["accion_cambiada", accion]]
    ]
}

export const cambiarAccion: ProcesarAccion = async (contexto, payload) => {
    const accion = payload as Accion;
    await patchAccion(contexto.accion.id, accion)

    return pipeAccion(contexto, [
        refrescarAccion,
        "INICIAL",
    ]);
}

export const getContextoVacio: ProcesarAccion = async (contexto) => {
    return pipe(
        contexto,
        conEstado("INICIAL"),
        conAccion(accionVacia)
    )
}

export const cargarContexto: ProcesarAccion = async (contexto, payload) => {
    const id = payload as string;

    if (!id) return getContextoVacio(contexto);

    return pipeAccion(
        contexto,
        [cargarAccion(id)],
        payload
    );
}
