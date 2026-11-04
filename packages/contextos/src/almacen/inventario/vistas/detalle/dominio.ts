import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { Inventario, LineaInventario } from "../../diseño.ts";
import { getInventario, getLineasInventario } from "../../infraestructura.ts";
import { ContextoDetalleInventario, EstadoDetalleInventario } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleInventario, ContextoDetalleInventario>;

export const metaInventario: MetaModelo<Inventario> = {
    campos: {
        observaciones: { requerido: false },
    },
    editable: (_: Inventario, campo?: string) => campo === "observaciones",
};

export const inventarioVacio = (): Inventario => ({
    id: "",
    almacenId: "",
    almacen: null,
    fecha: "",
    hora: "",
    observaciones: null,
});

export const contextoDetalleInventarioInicial: ContextoDetalleInventario = {
    estado: "INICIAL",
    inventario: inventarioVacio(),
    lineas: [],
    lineaActiva: null,
};

const leerInventario = async (id: string) => {
    const [inventario, lineas] = await Promise.all([
        getInventario(id),
        getLineasInventario(id),
    ]);
    return { inventario, lineas };
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        return { ...contextoDetalleInventarioInicial };
    }
    return {
        ...contexto,
        ...(await leerInventario(id)),
        lineaActiva: null,
        estado: "ABIERTO",
    };
};

/** Recarga cabecera y líneas tras cualquier operación y avisa al maestro. */
export const refrescarInventario: ProcesarDetalle = async (contexto) => {
    const leido = await leerInventario(contexto.inventario.id);
    return [
        { ...contexto, ...leido, lineaActiva: null, estado: "ABIERTO" },
        [["inventario_cambiado", leido.inventario]],
    ];
};

export const activarLinea: ProcesarDetalle = async (contexto, payload) => ({
    ...contexto,
    lineaActiva: payload as LineaInventario,
});
