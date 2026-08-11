import { ProcesarContexto } from "@olula/lib/diseño.js";
import { boolAString, ejecutarListaProcesos, formatearDireccionUnaLinea } from "@olula/lib/dominio.js";
import { accionesListaEntidades, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { DirCliente } from "../../diseño.ts";
import { getDirecciones, setDirEnvio, setDirFacturacion } from "../../infraestructura.ts";
import { ContextoDirecciones, EstadoDirecciones } from "./diseño.ts";

export const metaTablaDirecciones = [
    {
        id: "direccion",
        cabecera: "Dirección",
        render: (direccion: DirCliente) => formatearDireccionUnaLinea(direccion),
    },
    { id: "cod_postal", cabecera: "Cód. postal" },
    { id: "provincia", cabecera: "Provincia" },
    { id: "pais_id", cabecera: "País" },
    { id: "telefono", cabecera: "Teléfono" },
    {
        id: "dir_facturacion",
        cabecera: "Facturación",
        render: (direccion: DirCliente) => boolAString(direccion.dir_facturacion),
    },
    {
        id: "dir_envio",
        cabecera: "Envío",
        render: (direccion: DirCliente) => boolAString(direccion.dir_envio),
    },
];

export { metaNuevaDireccion, nuevaDireccionVacia } from "../../crear_direccion/dominio.ts";
export { metaDireccion } from "../../cambiar_direccion/dominio.ts";

type ProcesarDirecciones = ProcesarContexto<EstadoDirecciones, ContextoDirecciones>;

const pipeDirecciones = ejecutarListaProcesos<EstadoDirecciones, ContextoDirecciones>;

const conDirecciones = (fn: ProcesarListaEntidades<DirCliente>) => (ctx: ContextoDirecciones) => ({ ...ctx, direcciones: fn(ctx.direcciones) });

export const Direcciones = accionesListaEntidades(conDirecciones);

export const cargarDirecciones: ProcesarDirecciones = async (contexto, payload) => {
    const clienteId = (payload as string) || contexto.clienteId;
    const resultado = await getDirecciones(clienteId);
    const contextoActualizado = await Direcciones.recargar(contexto, { datos: resultado, total: resultado.length });
    return {
        ...contextoActualizado,
        clienteId,
        cargando: false,
    }
}

export const activarDireccion: ProcesarDirecciones = async (contexto, payload) => {
    const direccionActiva = payload as DirCliente;
    return Direcciones.activar(contexto, direccionActiva);
}

export const cancelarAlta: ProcesarDirecciones = async (contexto) => {
    return {
        ...contexto,
        direccionActiva: null,
        estado: "lista"
    }
}

export const cancelarEdicion: ProcesarDirecciones = async (contexto) => {
    return {
        ...contexto,
        direccionActiva: null,
        estado: "lista"
    }
}

export const cancelarConfirmacion: ProcesarDirecciones = async (contexto) => {
    return {
        ...contexto,
        estado: "lista"
    }
}

export const direccionCreada: ProcesarDirecciones = async (contexto) => {
    return pipeDirecciones(contexto, [
        cargarDirecciones,
        "lista"
    ]);
}

export const direccionActualizada: ProcesarDirecciones = async (contexto) => {
    return pipeDirecciones(contexto, [
        cargarDirecciones,
        "lista"
    ]);
}

export const borrarDireccion: ProcesarDirecciones = async (contexto) => {
    return pipeDirecciones(contexto, [
        cargarDirecciones,
        "lista"
    ]);
}

export const puedoMarcarDireccionFacturacion = (direccion: DirCliente) => {
    return !direccion.dir_facturacion;
}

export const marcarDireccionFacturacion: ProcesarDirecciones = async (contexto) => {
    if (!contexto.direcciones.activo?.id) return contexto;

    await setDirFacturacion(contexto.clienteId, contexto.direcciones.activo.id);

    return pipeDirecciones(contexto, [
        cargarDirecciones,
    ]);
}

export const puedoMarcarDireccionEnvio = (direccion: DirCliente) => {
    return !direccion.dir_envio;
}

export const marcarDireccionEnvio: ProcesarDirecciones = async (contexto) => {
    if (!contexto.direcciones.activo?.id) return contexto;

    await setDirEnvio(contexto.clienteId, contexto.direcciones.activo.id);

    return pipeDirecciones(contexto, [
        cargarDirecciones,
    ]);
}
