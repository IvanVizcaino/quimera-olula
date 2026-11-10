import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { ItemOrdenAlmacen, LineaOrdenAlmacen, OrdenAlmacen } from "./diseño.ts";

export const ERR_SKU_REQUERIDO = "El SKU es requerido";
export const ERR_CANTIDAD_PREVISTA_REQUERIDA = "La cantidad prevista es requerida";

export const ordenVacia = (): OrdenAlmacen => ({
    id: "",
    fecha: new Date().toISOString().slice(0, 10),
    tipo: "ENTRADA",
    almacenId: "",
    almacen: "",
    abierta: true,
    estado: "",
    descripcion: "",
    idUbicacionOrigen: null,
    ubicacionOrigen: null,
    idCajaOrigen: null,
    idUbicacionDestino: null,
    ubicacionDestino: null,
    idCajaDestino: null,
    lineas: [],
    lecturasCaja: [],
    albaranes: [],
    pasosPick: null,
    pasosDrop: null,
});

export const lineaOrdenVacia = (): LineaOrdenAlmacen => ({
    id: "",
    sku: "",
    articulo: "",
    loteId: null,
    cantidadPrevista: 0,
    idUbicacionOrigen: null,
    ubicacionOrigen: null,
    idCajaOrigen: null,
    cajaOrigen: null,
    idUbicacionDestino: null,
    ubicacionDestino: null,
    idCajaDestino: null,
    cajaDestino: null,
    pedidoVentaId: null,
    pedidoVenta: null,
    cliente: null,
    cambioPedido: null,
    cantidadPedidoAnterior: null,
    lecturas: [],
    porLotes: false,
    idLineaPick: null,
    pasosPick: null,
    pasosDrop: null,
});

const onOrdenCambiada = (orden: OrdenAlmacen, campo: string, _: unknown, otros?: Record<string, unknown>) => {
    if (campo === "idCajaDestino" && otros) {

        const nuevoValor: OrdenAlmacen = {
            ...orden,
            idUbicacionDestino: otros.idUbicacion as string,
            codUbicacionDestino: otros.codUbicacion as string,
        }
        return nuevoValor
    }
    else if (campo === "idCajaOrigen" && otros) {

        const nuevoValor: OrdenAlmacen = {
            ...orden,
            idUbicacionOrigen: otros.idUbicacion as string,
            codUbicacionOrigen: otros.codUbicacion as string,
        }
        return nuevoValor
    }
    return orden
}

export const metaOrden: MetaModelo<OrdenAlmacen> = {
    campos: {
        tipo: { requerido: true },
        almacenId: { requerido: true },
        fecha: { requerido: true },
        abierta: { tipo: "checkbox", requerido: true },
        idCajaOrigen: {},
        idUbicacionOrigen: {},
        idCajaDestino: {},
        idUbicacionDestino: {},
    },
    onChange: onOrdenCambiada
};



export const metaNuevaLinea: MetaModelo<LineaOrdenAlmacen> = {
    campos: {
        sku: {
            validacion: (linea) => {
                if (linea.sku === null || linea.sku === undefined || linea.sku === "") {
                    return ERR_SKU_REQUERIDO;
                }
                return true;
            },
        },
        cantidadPrevista: {
            tipo: "numero",
            validacion: (linea) => {
                if (linea.cantidadPrevista === null || linea.cantidadPrevista === undefined) {
                    return ERR_CANTIDAD_PREVISTA_REQUERIDA;
                }
                return true;
            },
        },
    },
};

/** Id del usuario con sesión iniciada (de `whoami` en localStorage), o null. */
export const usuarioActualId = (): string | null => {
    try {
        const raw = localStorage.getItem("whoami");
        return raw ? (JSON.parse(raw) as { usuario_id?: string }).usuario_id ?? null : null;
    } catch {
        return null;
    }
};

/**
 * Una orden se puede adquirir si no está terminada y está libre o ya es del usuario.
 * Adquirir la propia sirve para liberar al usuario del resto de órdenes abiertas.
 */
export const ordenAdquirible = (
    orden: Pick<ItemOrdenAlmacen, "estado" | "idResponsable">,
    usuarioId: string | null,
): boolean =>
    usuarioId !== null &&
    (orden.estado === "PENDIENTE" || orden.estado === "EN_CURSO") &&
    (orden.idResponsable === null || orden.idResponsable === usuarioId);

/**
 * Una SALIDA con todas las lecturas hechas queda PREPARADA: solo pasa a
 * TERMINADA al generar su albarán.
 */
/** Material recogido de más en la línea (el pedido se redujo después de recogerlo). */
export const sobranteLinea = (linea: Pick<LineaOrdenAlmacen, "cantidadPrevista" | "cantidadReal" | "cantidadPick">): number =>
    Math.max(0, Math.max(linea.cantidadReal ?? 0, linea.cantidadPick ?? 0) - linea.cantidadPrevista);

export type PedidoDeOrden = { id: string; codigo: string; cliente: string | null };

/** El pedido de venta de la orden si todas sus líneas con pedido son del mismo; null si no hay o hay varios. */
export const pedidoUnicoDeOrden = (orden: Pick<OrdenAlmacen, "lineas">): PedidoDeOrden | null => {
    const conPedido = orden.lineas.filter((l) => l.pedidoVentaId);
    const ids = new Set(conPedido.map((l) => l.pedidoVentaId));
    if (ids.size !== 1) return null;
    const linea = conPedido[0];
    return {
        id: linea.pedidoVentaId as string,
        codigo: linea.pedidoVenta ?? (linea.pedidoVentaId as string),
        cliente: linea.cliente,
    };
};

/** Texto de la marca de una línea cambiada en el pedido después de generar la salida. */
export const textoCambioPedido = (
    linea: Pick<LineaOrdenAlmacen, "cambioPedido" | "cantidadPedidoAnterior">,
): string | null => {
    switch (linea.cambioPedido) {
        case "ANADIDA":
            return "Añadida en pedido";
        case "BORRADA":
            return "Borrada en pedido";
        case "CAMBIADA":
            return linea.cantidadPedidoAnterior != null
                ? `Cambiada en pedido (antes ${linea.cantidadPedidoAnterior})`
                : "Cambiada en pedido";
        default:
            return null;
    }
};

export const lineasConSobrante = (orden: Pick<OrdenAlmacen, "lineas">): LineaOrdenAlmacen[] =>
    orden.lineas.filter((l) => sobranteLinea(l) > 0);

/** Una salida preparada se albarana; si tiene sobrante, antes hay que devolverlo. */
export const ordenAlbaranable = (
    orden: Pick<OrdenAlmacen, "tipo" | "estado"> & Partial<Pick<OrdenAlmacen, "lineas">>,
): boolean =>
    orden.tipo === "SALIDA" && orden.estado === "PREPARADA" && lineasConSobrante({ lineas: orden.lineas ?? [] }).length === 0;

const ETIQUETAS_ESTADO_ORDEN: Record<string, EstadoEtiqueta> = {
    PENDIENTE: { texto: "Pendiente", tono: "borrador" },
    EN_CURSO: { texto: "En curso", tono: "pendiente" },
    PREPARADA: { texto: "Preparada", tono: "parcial" },
    TERMINADA: { texto: "Terminada", tono: "completado" },
};

export const etiquetaEstadoOrden = (orden: Pick<OrdenAlmacen, "estado">): EstadoEtiqueta =>
    ETIQUETAS_ESTADO_ORDEN[orden.estado] ?? { texto: orden.estado, tono: "borrador" };

/** Por defecto el maestro muestra solo las órdenes abiertas (incluidas las pendientes de albaranar). */
export const ESTADOS_ORDEN_DEFECTO: string[] = ["EN_CURSO", "PENDIENTE", "PREPARADA"];

export const opcionesEstadoOrden = [
    { valor: "PENDIENTE", descripcion: "Pendiente" },
    { valor: "EN_CURSO", descripcion: "En curso" },
    { valor: "PREPARADA", descripcion: "Preparada" },
    { valor: "TERMINADA", descripcion: "Terminada" },
];

const comoLista = (valor: unknown): string[] =>
    Array.isArray(valor)
        ? valor.map(String).filter(Boolean)
        : typeof valor === "string"
            ? valor.split(",").map((v) => v.trim()).filter(Boolean)
            : [];

export const filtroEstadoOrden = (valor: unknown): ClausulaFiltro | null => {
    const estados = comoLista(valor);
    if (!estados.length) return null;
    return ["estado", "in", estados as unknown as string] as ClausulaFiltro;
};

export const estadosOrdenDesdeFiltro = (filtro: ClausulaFiltro[]): string[] => {
    const clausula = filtro.find(([campo, operador]) => campo === "estado" && operador === "in");
    return clausula ? comoLista(clausula[2]) : [];
};
