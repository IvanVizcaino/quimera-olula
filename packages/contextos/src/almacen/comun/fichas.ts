/**
 * URLs de las pantallas y fichas del almacén, para los enlaces a ficha (↗) y los «Ver en el mapa»
 * (doc sga_ergonomia.md). Un solo sitio: si cambia una ruta, cambia aquí.
 *
 * Los listados admiten `?id=` (abre la ficha) y filtros por la URL: `campo==__valor` es un «igual»
 * exacto (ver lib/src/url-params.ts).
 */

const q = encodeURIComponent;
const igual = (campo: string, valor: string) => `${campo}==__${q(valor)}`;

/** Plantillas con `{id}` para la prop `enlace` de los campos (QSelect, QAutocompletar, QInput). */
export const PLANTILLA_FICHA = {
    articulo: "/almacen/articulo?id={id}",
    almacen: "/almacen/almacenes?id={id}",
    ubicacion: "/almacen/ubicaciones?id={id}",
    caja: "/almacen/cajas?id={id}",
    zona: "/almacen/zonas?id={id}",
    tipoUbicacion: "/almacen/tipos_ubicacion?id={id}",
    tipoCaja: "/almacen/tipos_caja?id={id}",
    claseAlmacenamiento: "/almacen/clases_almacenamiento?id={id}",
    pickingFijo: "/almacen/picking_fijo?id={id}",
    orden: "/almacen/ordenes?id={id}",
    pedidoCompra: "/almacen/pedidos_compra?id={id}",
    pedidoVenta: "/almacen/pedidos_venta?id={id}",
} as const;

const ficha = (plantilla: string) => (id: string | null | undefined): string | null =>
    id ? plantilla.replace("{id}", q(id)) : null;

export const urlFicha = {
    articulo: ficha(PLANTILLA_FICHA.articulo),
    almacen: ficha(PLANTILLA_FICHA.almacen),
    ubicacion: ficha(PLANTILLA_FICHA.ubicacion),
    caja: ficha(PLANTILLA_FICHA.caja),
    zona: ficha(PLANTILLA_FICHA.zona),
    tipoUbicacion: ficha(PLANTILLA_FICHA.tipoUbicacion),
    tipoCaja: ficha(PLANTILLA_FICHA.tipoCaja),
    claseAlmacenamiento: ficha(PLANTILLA_FICHA.claseAlmacenamiento),
    pickingFijo: ficha(PLANTILLA_FICHA.pickingFijo),
    orden: ficha(PLANTILLA_FICHA.orden),
    pedidoCompra: ficha(PLANTILLA_FICHA.pedidoCompra),
    pedidoVenta: ficha(PLANTILLA_FICHA.pedidoVenta),
};

/** Listados filtrados. */
export const urlListado = {
    stockDeArticulo: (articuloId: string) => `/almacen/stock?${igual("articulo_id", articuloId)}`,
    pickingFijoDeArticulo: (articuloId: string) => `/almacen/picking_fijo?${igual("articulo_id", articuloId)}`,
    ubicacionesDePasillo: (pasilloId: string) => `/almacen/ubicaciones?${igual("pasillo_id", pasilloId)}`,
    ubicacionesDeZona: (zonaId: string) => `/almacen/ubicaciones?${igual("zona_id", zonaId)}`,
    ubicacionesDeTipo: (tipoId: string) => `/almacen/ubicaciones?${igual("tipo_ubicacion_id", tipoId)}`,
    ordenesDePedidoCompra: (pedidoId: string) => `/almacen/ordenes?${igual("pedido_compra_id", pedidoId)}`,
    ordenesDePedidoVenta: (pedidoId: string) => `/almacen/ordenes?${igual("pedido_venta_id", pedidoId)}`,
};

export interface FocoMapa {
    almacenId?: string | null;
    zonaId?: string | null;
    ubicacionId?: string | null;
    ordenId?: string | null;
}

/** El mapa del almacén centrado en una zona, una ubicación o el recorrido de una orden. */
export const urlMapa = (foco: FocoMapa = {}): string => {
    const params = Object.entries({
        almacen_id: foco.almacenId, zona_id: foco.zonaId, ubicacion_id: foco.ubicacionId, orden_id: foco.ordenId,
    }).filter(([, v]) => v).map(([k, v]) => `${k}=${q(v as string)}`);
    return `/almacen/mapa${params.length ? `?${params.join("&")}` : ""}`;
};

/** Las pantallas de proceso con su almacén. */
export const urlProceso = {
    slotting: (almacenId?: string | null) => `/almacen/slotting${almacenId ? `?almacen_id=${q(almacenId)}` : ""}`,
    reposicion: (almacenId?: string | null) => `/almacen/reposicion${almacenId ? `?almacen_id=${q(almacenId)}` : ""}`,
};
