import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ConexionBancaria } from "../diseño.js";
import { getConexionBancaria, getConexionesBancarias } from "../infraestructura.js";
import { ContextoMaestroConexionBancaria, EstadoMaestroConexionBancaria } from "./diseño.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroConexionBancaria, ContextoMaestroConexionBancaria>;

const conConexiones = (fn: ProcesarListaActivaEntidades<ConexionBancaria>) =>
    (ctx: ContextoMaestroConexionBancaria) => ({ ...ctx, conexiones: fn(ctx.conexiones) });

export const Conexiones = accionesListaActivaEntidades(conConexiones);

export const recargarConexiones: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getConexionesBancarias(criteria);
    return Conexiones.recargar(contexto, resultado);
};

export const ampliarConexiones: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getConexionesBancarias(criteria);
    return Conexiones.ampliar(contexto, resultado);
};

/**
 * El flujo de conexión (conectar_banco/ConectarBancoConexionBancaria.tsx) ya hizo el
 * POST con los datos que devolvió el widget del proveedor; aquí se obtiene la conexión
 * completa (con sus cuentas) y se incluye en la lista, seleccionada, igual que un alta
 * por modal en otros módulos.
 */
export const incluirConexionCreadaPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const conexion = await getConexionBancaria(id);
    return {
        ...contexto,
        estado: "INICIAL",
        conexiones: {
            ...contexto.conexiones,
            lista: [conexion, ...contexto.conexiones.lista],
            total: contexto.conexiones.total + 1,
            activo: conexion.id,
        },
    };
};

/** Desde la lista o desde las tarjetas de saldos, que solo conocen el id de la conexión. */
export const prepararReautenticacion: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const conexion = contexto.conexiones.lista.find((c) => c.id === id) ?? await getConexionBancaria(id);
    return { ...contexto, estado: "REAUTENTICANDO", conexionReautenticando: conexion };
};

export const aplicarReautenticacion: ProcesarMaestro = async (contexto, payload) => {
    const conexion = await getConexionBancaria(payload as string);
    return {
        ...Conexiones.cambiar(contexto, conexion),
        estado: "INICIAL",
        conexionReautenticando: null,
        refresco: contexto.refresco + 1,
    };
};

export const cancelarReautenticacion: ProcesarMaestro = async (contexto) => ({
    ...contexto,
    estado: "INICIAL",
    conexionReautenticando: null,
});
