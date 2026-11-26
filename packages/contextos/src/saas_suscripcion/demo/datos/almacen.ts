import { Registro, RespuestaFija } from "../api_demo.ts";
import { DemoModulo } from "../diseño.ts";
import { ALMACENES, ARTICULOS, PROVEEDORES, fecha } from "./comun.ts";

/** Petición que reciben las respuestas fijas calculadas. */
type Peticion = { url: string; cuerpo: unknown };

/** Almacenes de la demo: los comunes y una cámara frigorífica propia del módulo. */
const ALMACENES_DEMO = [...ALMACENES, { id: "CAM", nombre: "Cámara frigorífica" }];

/** Proveedores de género (los comunes son de semillas, envases y transporte). */
const PROVEEDOR_HUERTA = { id: "pv4", nombre: "Huertas de Níjar S.C.A." };
const PROVEEDOR_COSECHEROS = { id: "pv5", nombre: "Cosecheros del Poniente S.L." };

const FAMILIAS = [
    { id: "HORT", descripcion: "Hortalizas", unidad_id: null },
    { id: "FRUT", descripcion: "Fruta", unidad_id: null },
    { id: "ENV", descripcion: "Envases", unidad_id: null },
    { id: "SERV", descripcion: "Servicios", unidad_id: null },
];

const familiaDe = (descripcion: string) => FAMILIAS.find((f) => f.descripcion === descripcion) ?? FAMILIAS[3];

const GRUPOS_IVA = [
    { id: "GEN", descripcion: "General 21%" },
    { id: "RED", descripcion: "Reducido 10%" },
    { id: "SRED", descripcion: "Superreducido 4%" },
];

type DatosArticulo = {
    id: string; descripcion: string; pvp: number; familia: string; codbarras: string | null;
};

/**
 * Un artículo con los campos de las tres vistas que lo leen: almacén (ficha), ventas
 * (pestaña Ventas y autocompletar) y compras (pestaña Compras).
 */
const articulo = (a: DatosArticulo, uso: { vende?: boolean; compra?: boolean; sinStock?: boolean } = {},
    observaciones: string | null = null): Registro => {
    const familia = familiaDe(a.familia);
    return {
        id: a.id, descripcion: a.descripcion, observaciones,
        barcode: a.codbarras, tipo_barcode: a.codbarras ? "EAN" : null,
        familia_id: familia.id, descripcion_familia: familia.descripcion, unidad_id: null,
        sin_stock: uso.sinStock ?? false, se_compra: uso.compra ?? true, se_vende: uso.vende ?? true,
        clase_almacenamiento_id: null, clase_almacenamiento: null, largo: null, ancho: null, alto: null,
        proveedores: [],
        precio: a.pvp, grupo_iva_producto_id: familia.id === "ENV" || familia.id === "SERV" ? "GEN" : "SRED",
        pvp_variable: false, por_lotes: false,
    };
};

const ARTICULOS_DEMO: Registro[] = [
    articulo(ARTICULOS[0], {}, "Calibre G. Cosecha de invernadero."),
    articulo(ARTICULOS[1]),
    articulo(ARTICULOS[2]),
    articulo(ARTICULOS[3], {}, "Campaña de octubre a mayo."),
    articulo(ARTICULOS[4]),
    articulo(ARTICULOS[5], { compra: true }, "Madurar a temperatura ambiente."),
    articulo(ARTICULOS[6], { vende: false }),
    articulo({ id: "ETQ01", descripcion: "Etiquetas adhesivas (rollo)", pvp: 0, familia: "Envases", codbarras: null },
        { vende: false }),
    articulo({ id: "POR01", descripcion: "Porte urgente", pvp: 12, familia: "Servicios", codbarras: null },
        { compra: false, sinStock: true }),
];

/** Precio de compra de un artículo a un proveedor (pestaña Compras de la ficha). */
const precioProveedor = (id: string, art: Registro, proveedor: { id: string; nombre: string }, coste: number,
    porDefecto: boolean, embalaje: number | null = null) => ({
    id, articulo_id: art.id, articulo: art.descripcion, proveedor_id: proveedor.id, nombre_proveedor: proveedor.nombre,
    coste, divisa_id: "EUR", dto: 0, ref_proveedor: `${proveedor.id.toUpperCase()}-${art.id}`, plazo: 2,
    uni_embalaje: embalaje, requiere_embalajes: false, por_defecto: porDefecto,
});

const COSTES: Record<string, number> = Object.fromEntries(ARTICULOS.map((a) => [a.id, a.coste]));

/** compras/articulo/<id>/proveedor para cada artículo que se compra. */
const preciosProveedor = Object.fromEntries(ARTICULOS_DEMO.filter((a) => a.se_compra).map((a, i) => {
    const esEnvase = a.familia_id === "ENV";
    const principal = esEnvase ? PROVEEDORES[1] : PROVEEDOR_HUERTA;
    const coste = COSTES[a.id] ?? 0.1;
    const precios = [precioProveedor(`ap${i}a`, a, principal, coste, true, esEnvase ? 100 : 10)];
    if (!esEnvase) precios.push(precioProveedor(`ap${i}b`, a, PROVEEDOR_COSECHEROS, Math.round(coste * 112) / 100, false));
    return [`compras/articulo/${a.id}/proveedor`, precios];
}));

const almacenDe = (id: string) => ALMACENES_DEMO.find((a) => a.id === id)!;

/** Stock de un artículo en un almacén. Disponible = física - reservada. */
const stock = (articuloId: string, almacenId: string, fisica: number, reservada: number, pendiente: number,
    minimo: number | null, maximo: number | null, regularizado: number | null) => {
    const art = ARTICULOS_DEMO.find((a) => a.id === articuloId)!;
    const necesidad = minimo !== null && fisica - reservada + pendiente < minimo ? minimo - (fisica - reservada + pendiente) : 0;
    return {
        id: `${articuloId}-${almacenId}`, articulo: art.descripcion, almacen: almacenDe(almacenId).nombre,
        articulo_id: articuloId, almacen_id: almacenId,
        cantidad_fisica: fisica, cantidad_disponible: fisica - reservada, cantidad_reservada: reservada,
        cantidad_pendiente: pendiente, necesidad, stock_minimo: minimo, stock_maximo: maximo,
        fecha_ultima_regularizacion: regularizado === null ? null : fecha(regularizado),
        hora_ultima_regularizacion: regularizado === null ? null : "08:30:00",
        cantidad_ultima_regularizacion: regularizado === null ? null : fisica + 12,
    };
};

const STOCKS: Registro[] = [
    stock("TOM01", "ALM", 420, 60, 200, 150, 900, -6),
    stock("TOM01", "CAM", 180, 0, 0, 50, 400, -6),
    stock("PIM01", "ALM", 260, 40, 0, 100, 600, -13),
    stock("PEP01", "ALM", 310, 25, 0, 100, 500, -13),
    stock("NAR01", "ALM", 800, 120, 500, 300, 2000, -20),
    stock("LIM01", "ALM", 150, 90, 0, 120, 400, -20),
    stock("AGU01", "CAM", 600, 48, 0, 200, 1200, -3),
    stock("CAJ01", "ALM", 1200, 0, 1000, 500, 3000, -30),
    stock("TOM01", "TDA", 35, 0, 0, 20, 80, null),
    stock("NAR01", "TDA", 60, 0, 0, 30, 120, null),
    stock("ETQ01", "ALM", 14, 0, 0, 20, 60, null),
];

const transferencia = (id: string, origen: string, destino: string, dias: number) => ({
    id, almacen_origen_id: origen, almacen_destino_id: destino, fecha: fecha(dias),
    nombre_almacen_origen: almacenDe(origen).nombre, nombre_almacen_destino: almacenDe(destino).nombre,
});

const lineasTransferencia = (transferenciaId: string, lineas: [string, number][]) =>
    lineas.map(([sku, cantidad], i) => ({
        id: `${transferenciaId}-${i + 1}`, transferencia_id: transferenciaId, sku, cantidad,
        descripcion: ARTICULOS_DEMO.find((a) => a.id === sku)!.descripcion,
    }));

const TRANSFERENCIAS = [
    transferencia("TR0006", "ALM", "TDA", 0),
    transferencia("TR0005", "CAM", "ALM", -1),
    transferencia("TR0004", "ALM", "TDA", -3),
    transferencia("TR0003", "ALM", "CAM", -5),
    transferencia("TR0002", "ALM", "TDA", -8),
    transferencia("TR0001", "CAM", "TDA", -12),
];

const LINEAS_TRANSFERENCIA: Record<string, [string, number][]> = {
    TR0006: [["TOM01", 20], ["NAR01", 40], ["LIM01", 10]],
    TR0005: [["TOM01", 60], ["AGU01", 120]],
    TR0004: [["PIM01", 15], ["PEP01", 15], ["CAJ01", 50]],
    TR0003: [["TOM01", 180], ["AGU01", 300]],
    TR0002: [["NAR01", 60], ["TOM01", 30]],
    TR0001: [["AGU01", 48]],
};

// --- Listas filtradas ---------------------------------------------------------------------

/** Cláusulas de igualdad del filtro de la query (?q={filtro:[[campo, "=", valor]…]}). */
const clausulasIgualdad = (url: string): [string, string][] => {
    try {
        const q = JSON.parse(new URL(url, "http://demo").searchParams.get("q") ?? "{}") as { filtro?: unknown };
        return Array.isArray(q.filtro)
            ? q.filtro.filter((c): c is [string, string, unknown] => Array.isArray(c) && ["=", "==", "eq"].includes(c[1]))
                .map(([campo, , valor]) => [campo, String(valor)])
            : [];
    } catch {
        return [];
    }
};

/**
 * Lista que respeta los filtros de igualdad (la API de la demo los ignora): «Ver stock» desde
 * la ficha del artículo abre el stock filtrado por él.
 */
const listaFiltrada = (registros: Registro[]) => ({ url }: Peticion) => {
    const clausulas = clausulasIgualdad(url);
    const datos = registros.filter((r) => clausulas.every(([campo, valor]) => !(campo in r) || String(r[campo]) === valor));
    return { datos, total: datos.length };
};

// --- Alta de artículos --------------------------------------------------------------------

/**
 * El alta solo manda referencia y descripción, pero la ficha necesita el registro completo
 * (proveedores, precio…). Los artículos creados en la demo se guardan aquí, completos, y se
 * sirven con respuestas fijas en las tres rutas que los leen.
 */
const altas = new Map<string, Registro>();

/** Artículo (o sus precios de proveedor) en cualquiera de las tres rutas que lo leen. */
const RUTA_ARTICULO = /(almacen|ventas|compras)\/articulo\/([^/?]+)(\/proveedor)?\/?(?:\?|$)/;

/** El artículo dado de alta en la demo al que apunta la ruta o la URL, o null. */
const altaDe = (rutaOUrl: string) => {
    const m = RUTA_ARTICULO.exec(rutaOUrl);
    const id = m ? decodeURIComponent(m[2]) : null;
    return id !== null && altas.has(id) ? { id, proveedores: !!m![3] } : null;
};

/** Ruta que solo casa con los artículos dados de alta en la demo (el resto va a las colecciones). */
const rutaAlta = Object.assign(new RegExp(RUTA_ARTICULO.source), { test: (ruta: string) => altaDe(ruta) !== null });

const fijasAltaArticulo: RespuestaFija[] = [
    {
        metodo: "POST", ruta: "almacen/articulo",
        cuerpo: ({ cuerpo }: Peticion) => {
            const datos = cuerpo as { id?: string; descripcion?: string; grupo_iva_producto_id?: string };
            const id = datos.id || `NUEVO${altas.size + 1}`;
            altas.set(id, {
                ...articulo({ id, descripcion: datos.descripcion ?? "", pvp: 0, familia: "", codbarras: null },
                    { vende: false, compra: false }),
                familia_id: null, descripcion_familia: null, grupo_iva_producto_id: datos.grupo_iva_producto_id ?? "GEN",
            });
            return { id };
        },
    },
    {
        metodo: "GET", ruta: rutaAlta,
        cuerpo: ({ url }: Peticion) => {
            const alta = altaDe(url)!;
            return alta.proveedores ? { datos: [], total: 0 } : { datos: altas.get(alta.id) };
        },
    },
    {
        metodo: "PATCH", ruta: rutaAlta,
        cuerpo: ({ url, cuerpo }: Peticion) => {
            const { id } = altaDe(url)!;
            altas.set(id, { ...altas.get(id)!, ...(cuerpo as Record<string, unknown>), id });
            return {};
        },
    },
    {
        metodo: "DELETE", ruta: rutaAlta,
        cuerpo: ({ url }: Peticion) => {
            altas.delete(altaDe(url)!.id);
            return {};
        },
    },
];

export const demo: DemoModulo = {
    pantallas: [
        { nombre: "Artículos", ruta: "/almacen/articulo" },
        { nombre: "Stock", ruta: "/almacen/stock" },
        { nombre: "Transferencias", ruta: "/almacen/transferencias" },
        { nombre: "Almacenes", ruta: "/almacen/almacenes" },
    ],
    guia: "Abre un artículo y pulsa «Ver stock», revisa una transferencia entre almacenes o crea un artículo nuevo.",
    colecciones: {
        "almacen/articulo": ARTICULOS_DEMO,
        "ventas/articulo": ARTICULOS_DEMO,
        "ventas/articulo/tags": ARTICULOS_DEMO,
        "compras/articulo": ARTICULOS_DEMO,
        ...preciosProveedor,
        "almacen/familia": FAMILIAS,
        "almacen/almacen": ALMACENES_DEMO,
        "almacen/stock": STOCKS,
        // Ubicaciones del SGA: sin el plugin no hay.
        "almacen/stock_ubicacion": [],
        "almacen/transferencia": TRANSFERENCIAS,
        ...Object.fromEntries(Object.entries(LINEAS_TRANSFERENCIA).map(([id, lineas]) =>
            [`almacen/transferencia/${id}/linea`, lineasTransferencia(id, lineas)])),
        "cache/comun/grupo_iva_producto": GRUPOS_IVA,
    },
    fijas: [
        { metodo: "GET", ruta: "almacen/stock", cuerpo: listaFiltrada(STOCKS) },
        { metodo: "GET", ruta: "almacen/config", cuerpo: { datos: { impuesto_id: "SRED", usar_iva_defecto: false } } },
        ...fijasAltaArticulo,
    ],
};
