import { Registro, RespuestaFija } from "../api_demo.ts";
import { DemoModulo } from "../diseño.ts";
import { AGENTES, ALMACENES, ARTICULOS, CLIENTES, FORMAS_PAGO, fecha } from "./comun.ts";

/**
 * Tienda online. El contexto tienda_online no tiene pantallas propias en la app de gestión
 * (la tienda es una app pública aparte): la demo enseña lo que el módulo mueve en el
 * backoffice, los pedidos que entran desde la web y el catálogo con sus precios de venta.
 *
 * Los pedidos se guardan en un almacén propio de este fichero (no en una colección): las
 * altas y cambios de líneas devuelven la línea calculada y los totales de la cabecera se
 * recalculan, como hace el servidor.
 */

// --- Maestros ----------------------------------------------------------------------------

const FAMILIAS = [
    { id: "HORT", descripcion: "Hortalizas", unidad_id: null },
    { id: "FRUT", descripcion: "Fruta", unidad_id: null },
    { id: "ENV", descripcion: "Envases", unidad_id: null },
    { id: "SERV", descripcion: "Servicios", unidad_id: null },
];

const IVA: Record<string, number> = { GEN: 21, RED: 10, SRED: 4 };

type ArticuloTienda = {
    id: string; descripcion: string; pvp: number; familia: string; codbarras: string | null;
};

/** Envío de los pedidos web: el único artículo del catálogo que no es género. */
const ENVIO: ArticuloTienda = { id: "ENV24", descripcion: "Envío a domicilio 24 h", pvp: 4.9, familia: "Servicios", codbarras: null };

const articuloVenta = (a: ArticuloTienda, observaciones: string | null = null) => {
    const familia = FAMILIAS.find((f) => f.descripcion === a.familia) ?? FAMILIAS[3];
    return {
        id: a.id, descripcion: a.descripcion, barcode: a.codbarras, tipo_barcode: a.codbarras ? "EAN" : null,
        observaciones, familia_id: familia.id, descripcion_familia: familia.descripcion,
        precio: a.pvp, grupo_iva_producto_id: familia.id === "ENV" || familia.id === "SERV" ? "GEN" : "SRED",
        pvp_variable: false, sin_stock: familia.id === "SERV", por_lotes: false,
    };
};

const CATALOGO = [
    articuloVenta(ARTICULOS[0], "Se publica en la web como «Tomate pera de Almería»."),
    articuloVenta(ARTICULOS[1]),
    articuloVenta(ARTICULOS[2]),
    articuloVenta(ARTICULOS[3], "Caja de 10 kg en la web."),
    articuloVenta(ARTICULOS[4]),
    articuloVenta(ARTICULOS[5], "Producto destacado en portada."),
    articuloVenta(ARTICULOS[6]),
    articuloVenta(ENVIO, "Se añade solo a los pedidos de menos de 60 €."),
];

const articuloDe = (id: string) => CATALOGO.find((a) => a.id === id);

const DIRECCIONES: Record<string, { tipo_via: string; nombre_via: string; numero: string; cod_postal: string; ciudad: string; provincia_id: number; provincia: string }> = {
    c1: { tipo_via: "Calle", nombre_via: "Real", numero: "12", cod_postal: "04001", ciudad: "Almería", provincia_id: 4, provincia: "Almería" },
    c2: { tipo_via: "Avenida", nombre_via: "de la Constitución", numero: "45", cod_postal: "18001", ciudad: "Granada", provincia_id: 18, provincia: "Granada" },
    c3: { tipo_via: "Paseo", nombre_via: "Marítimo", numero: "3", cod_postal: "11001", ciudad: "Cádiz", provincia_id: 11, provincia: "Cádiz" },
    c4: { tipo_via: "Carretera", nombre_via: "de Bigastro", numero: "km 2", cod_postal: "03300", ciudad: "Orihuela", provincia_id: 3, provincia: "Alicante" },
};

const direccion = (clienteId: string) => {
    const d = DIRECCIONES[clienteId];
    return d
        ? { ...d, otros: "", pais_id: "ES", pais: "España", apartado: "", telefono: CLIENTES.find((c) => c.id === clienteId)?.telefono1 ?? "" }
        : { tipo_via: "", nombre_via: "", numero: "", otros: "", cod_postal: "", ciudad: "", provincia_id: 0, provincia: "", pais_id: "ES", pais: "España", apartado: "", telefono: "" };
};

const CLIENTES_VENTA = CLIENTES.map((c, i) => ({
    id: c.id, nombre: c.nombre, nombre_comercial: null, id_fiscal: c.cif, tipo_id_fiscal: "NIF",
    agente_id: i < 4 ? AGENTES[i % 2].id : null, nombre_agente: i < 4 ? AGENTES[i % 2].nombre : null,
    divisa_id: "EUR", divisa: "Euro", serie_id: "W", serie: "Tienda web",
    forma_pago_id: i === 4 ? "CONT" : FORMAS_PAGO[1 + (i % 2)].id,
    forma_pago: i === 4 ? "Contado" : FORMAS_PAGO[1 + (i % 2)].descripcion,
    grupo_iva_negocio_id: "NAC", de_baja: false, fecha_baja: null, grupo_id: "", grupo: "",
    telefono1: c.telefono1 ?? "", telefono2: "", email: c.email ?? "", web: "", observaciones: "",
    copiasfactura: 1, contacto_id: "", cuenta_domiciliada: "", descripcion_cuenta: "",
    cuenta_remesa: "", descripcion_cuenta_remesa: "", poblacion: c.poblacion,
}));

const direccionesCliente = Object.fromEntries(Object.keys(DIRECCIONES).map((id) => [
    `ventas/cliente/${id}/direccion`,
    [{ id: `d-${id}`, direccion: direccion(id), dir_envio: true, dir_facturacion: true }],
]));

const AGENTES_VENTA = AGENTES.map((a, i) => ({
    id: a.id, nombre: a.nombre, nombre_pila: a.nombre.split(" ")[0], apellidos: a.nombre.split(" ").slice(1).join(" "),
    id_fiscal: "", por_comision: i === 0 ? 3 : 2.5, telefono: null, email: `${a.id}@hortalizasdelsur.ejemplo.test`,
    direccion: null, ciudad: null, codpostal: null, provincia: null, usuario_id: null,
}));

const ALMACENES_VENTA = ALMACENES.map((a) => ({ ...a }));

// --- Pedidos web ---------------------------------------------------------------------------

const redondear = (n: number) => Math.round(n * 100) / 100;

type Linea = Registro & {
    referencia: string | null; descripcion: string; cantidad: number; pvp_unitario: number;
    dto_porcentual: number; dto_lineal: number; pvp_total: number; grupo_iva_producto_id: string;
    tipo_iva: number; servida: number;
};

type Pedido = Registro & {
    codigo: string; cliente_id: string; servido: string; por_descuento: number; agente_id: string;
    nombre_agente: string; por_comision: number;
};

const calcularLinea = (l: Linea): Linea => ({
    ...l,
    tipo_iva: IVA[l.grupo_iva_producto_id] ?? 21,
    pvp_total: redondear(l.cantidad * l.pvp_unitario * (1 - l.dto_porcentual / 100) - l.dto_lineal),
    importe_comision: 0,
});

const linea = (pedidoId: string, n: number, referencia: string, cantidad: number, servida = 0, dto = 0): Linea => {
    const a = articuloDe(referencia)!;
    return calcularLinea({
        id: `${pedidoId}-${n}`, referencia, descripcion: a.descripcion, descripcion_articulo: a.descripcion,
        cantidad, pvp_unitario: a.precio, dto_porcentual: dto, dto_lineal: 0, pvp_total: 0,
        grupo_iva_producto_id: a.grupo_iva_producto_id, iva_incluido: false, tipo_irpf: 0, tipo_recargo: 0,
        tipo_iva: 0, por_comision: 0, importe_comision: 0, por_lotes: false, servida,
    });
};

const pedidos: Pedido[] = [];
const lineas: Record<string, Linea[]> = {};

/** Totales de la cabecera a partir de sus líneas (y el descuento de cabecera). */
const recalcular = (p: Pedido): Pedido => {
    const ls = lineas[p.id] ?? [];
    const netoSinDto = redondear(ls.reduce((s, l) => s + l.pvp_total, 0));
    const factor = 1 - p.por_descuento / 100;
    const neto = redondear(netoSinDto * factor);
    const iva = redondear(ls.reduce((s, l) => s + l.pvp_total * factor * l.tipo_iva / 100, 0));
    const total = redondear(neto + iva);
    return { ...p, neto_sin_dto: netoSinDto, neto, total_iva: iva, total, total_divisa_empresa: total };
};

const datosCliente = (clienteId: string) => {
    const c = CLIENTES_VENTA.find((x) => x.id === clienteId)!;
    return {
        cliente_id: c.id, nombre_cliente: c.nombre, id_fiscal: c.id_fiscal,
        direccion_id: DIRECCIONES[c.id] ? `d-${c.id}` : null, direccion: direccion(c.id),
    };
};

const pedido = (id: string, web: number, cliente: number, dias: number, servido: string,
    nuevasLineas: [string, number, number?][], nota = ""): Pedido => {
    const c = CLIENTES_VENTA[cliente];
    const agente = AGENTES_VENTA.find((a) => a.id === c.agente_id);
    const forma = FORMAS_PAGO.find((f) => f.id === c.forma_pago_id)!;
    lineas[id] = nuevasLineas.map(([ref, cantidad, servida], i) => linea(id, i + 1, ref, cantidad, servida ?? 0));
    return recalcular({
        id, codigo: `W${String(web).padStart(6, "0")}`, fecha: fecha(dias),
        fecha_salida: servido === "No" ? fecha(dias + 2) : fecha(dias + 1),
        almacen_id: "ALM", nombre_almacen: "Almacén central", ...datosCliente(c.id),
        agente_id: agente?.id ?? "", nombre_agente: agente?.nombre ?? "", por_comision: agente?.por_comision ?? 0,
        divisa_id: "EUR", tasa_conversion: 1, total: 0, neto: 0, total_iva: 0, total_irpf: 0, total_recargo: 0,
        total_divisa_empresa: 0, por_descuento: 0, neto_sin_dto: 0,
        forma_pago_id: forma.id, nombre_forma_pago: forma.descripcion, grupo_iva_negocio_id: "NAC", serie_id: "W",
        observaciones: `Pedido web nº W-${web}.${nota ? ` ${nota}` : ""}`, servido,
    });
};

pedidos.push(
    pedido("pw8", 1048, 4, 0, "No", [["AGU01", 12], ["LIM01", 2], ["ENV24", 1]], "Entregar por la tarde."),
    pedido("pw7", 1047, 1, 0, "No", [["TOM01", 40], ["PIM01", 25], ["PEP01", 20]]),
    pedido("pw6", 1046, 2, -1, "No", [["TOM01", 15], ["LIM01", 8], ["AGU01", 30]], "Cliente recoge en tienda."),
    pedido("pw5", 1045, 0, -2, "Parcial", [["NAR01", 120, 120], ["LIM01", 30, 0], ["CAJ01", 15, 15]]),
    pedido("pw4", 1044, 3, -3, "Parcial", [["TOM01", 200, 120], ["PIM01", 80, 80]]),
    pedido("pw3", 1043, 4, -5, "TOTAL", [["NAR01", 10, 10], ["ENV24", 1, 1]]),
    pedido("pw2", 1042, 1, -8, "TOTAL", [["AGU01", 60, 60], ["TOM01", 30, 30]]),
    pedido("pw1", 1041, 2, -12, "TOTAL", [["PEP01", 25, 25], ["PIM01", 20, 20], ["LIM01", 6, 6]]),
);

// --- Utilidades de las respuestas ----------------------------------------------------------

const ruta = (url: string) => url.split("?")[0].replace(/\/+$/, "");
const tramo = (url: string, patron: RegExp) => decodeURIComponent(patron.exec(ruta(url))?.[1] ?? "");
const idPedido = (url: string) => tramo(url, /ventas\/pedido\/([^/]+)/);
const pedidoDe = (url: string) => pedidos.find((p) => p.id === idPedido(url));

type Criteria = { filtro?: unknown; orden?: string[]; paginacion?: { limite: number; pagina: number } };
const criteriaDe = (url: string): Criteria => {
    try {
        return JSON.parse(new URL(url, "http://demo").searchParams.get("q") ?? "{}") as Criteria;
    } catch {
        return {};
    }
};

/** El estado de servido llega como «No/Parcial/Sí» en los filtros y «TOTAL» en los pedidos. */
const SERVIDO: Record<string, string> = { no: "P", pendiente: "P", parcial: "A", "sí": "T", si: "T", total: "T", servido: "T" };
const normalizar = (campo: string, valor: unknown) =>
    campo === "servido" ? SERVIDO[String(valor).toLowerCase()] ?? String(valor) : String(valor);

const valorDe = (r: Registro, campo: string) => campo === "nombre_cliente" ? r.nombre_cliente : r[campo];

/** Filtros de igualdad, «in» y «~» (contiene); el resto se ignora. */
const cumple = (r: Registro, filtro: unknown): boolean => {
    if (!Array.isArray(filtro)) return true;
    return filtro.every((c) => {
        if (!Array.isArray(c) || typeof c[0] !== "string" || !(c[0] in r)) return true;
        const [campo, op, valor] = c as [string, string, unknown];
        const actual = normalizar(campo, valorDe(r, campo));
        if (op === "=" || op === "==") return actual === normalizar(campo, valor);
        if (op === "in" && Array.isArray(valor)) return valor.some((v) => normalizar(campo, v) === actual);
        if (op === "~") return actual.toLowerCase().includes(String(valor).toLowerCase());
        return true;
    });
};

const listar = (registros: Registro[], url: string) => {
    const { filtro, orden, paginacion } = criteriaDe(url);
    let datos = registros.filter((r) => cumple(r, filtro));
    if (orden?.length) {
        const [campo, sentido] = orden;
        const signo = String(sentido).toUpperCase() === "DESC" ? -1 : 1;
        datos = [...datos].sort((a, b) =>
            signo * String(a[campo] ?? "").localeCompare(String(b[campo] ?? ""), "es", { numeric: true }));
    }
    const total = datos.length;
    if (paginacion?.limite) {
        const inicio = Math.max(0, (paginacion.pagina - 1) * paginacion.limite);
        datos = datos.slice(inicio, inicio + paginacion.limite);
    }
    return { datos, total };
};

const guardar = (p: Pedido) => {
    const i = pedidos.findIndex((x) => x.id === p.id);
    if (i >= 0) pedidos[i] = recalcular(p);
};

// --- Cambios de cabecera y líneas ----------------------------------------------------------

type CambiosPedido = {
    cliente?: { cliente_id?: string; nombre?: string; id_fiscal?: string };
    divisa?: { divisa_id: string; tasa_conversion: number };
    [campo: string]: unknown;
};

const aplicarCambios = (p: Pedido, cambios: CambiosPedido): Pedido => {
    const { cliente, divisa, ...resto } = cambios;
    let nuevo: Pedido = { ...p };
    for (const campo of ["fecha", "fecha_salida", "almacen_id", "agente_id", "por_comision", "por_descuento",
        "forma_pago_id", "grupo_iva_negocio_id", "observaciones"]) {
        if (resto[campo] !== undefined) nuevo = { ...nuevo, [campo]: resto[campo] };
    }
    if (typeof nuevo.fecha === "string") nuevo.fecha = nuevo.fecha.slice(0, 10);
    if (divisa) nuevo = { ...nuevo, divisa_id: divisa.divisa_id, tasa_conversion: divisa.tasa_conversion };
    const clienteId = cliente?.cliente_id ?? (resto.cliente_id as string | undefined);
    if (clienteId && clienteId !== p.cliente_id && CLIENTES_VENTA.some((c) => c.id === clienteId)) {
        nuevo = { ...nuevo, ...datosCliente(clienteId) };
    } else if (cliente && !cliente.cliente_id) {
        nuevo = { ...nuevo, cliente_id: "", nombre_cliente: cliente.nombre ?? "", id_fiscal: cliente.id_fiscal ?? "", direccion_id: null };
    }
    return {
        ...nuevo,
        nombre_agente: AGENTES_VENTA.find((a) => a.id === nuevo.agente_id)?.nombre ?? "",
        nombre_almacen: ALMACENES_VENTA.find((a) => a.id === nuevo.almacen_id)?.nombre ?? String(nuevo.almacen_id),
        nombre_forma_pago: FORMAS_PAGO.find((f) => f.id === nuevo.forma_pago_id)?.descripcion ?? "",
    };
};

type ArticuloPeticion = { articulo_id?: string; descripcion?: string; pvp_unitario?: number; grupo_iva_producto_id?: string };
type PeticionLinea = { articulo: ArticuloPeticion; cantidad: number; dto_porcentual?: number; dto_lineal?: number; tipo_irpf?: number };

/** La línea que calcularía el servidor para un alta (precio y IVA del artículo). */
const lineaDePeticion = (id: string, l: PeticionLinea): Linea => {
    const a = l.articulo.articulo_id ? articuloDe(l.articulo.articulo_id) : undefined;
    const grupo = l.articulo.grupo_iva_producto_id ?? a?.grupo_iva_producto_id ?? "GEN";
    return calcularLinea({
        id, referencia: l.articulo.articulo_id ?? null,
        descripcion: l.articulo.descripcion ?? a?.descripcion ?? "", descripcion_articulo: a?.descripcion ?? null,
        cantidad: Number(l.cantidad ?? 1), pvp_unitario: Number(l.articulo.pvp_unitario ?? a?.precio ?? 0),
        dto_porcentual: Number(l.dto_porcentual ?? 0), dto_lineal: Number(l.dto_lineal ?? 0), pvp_total: 0,
        grupo_iva_producto_id: grupo, iva_incluido: false, tipo_irpf: Number(l.tipo_irpf ?? 0), tipo_recargo: 0,
        tipo_iva: 0, por_comision: 0, importe_comision: 0, por_lotes: false, servida: 0,
    });
};

/** Respuesta de alta de línea (NuevaLineaVentaApiRes). */
const respuestaLinea = (l: Linea) => ({
    id: l.id, articulo_id: l.referencia, descripcion: l.descripcion, cantidad: l.cantidad,
    pvp_unitario: l.pvp_unitario, pvp_total: l.pvp_total, dto_porcentual: l.dto_porcentual, dto_lineal: l.dto_lineal,
    grupo_iva_producto_id: l.grupo_iva_producto_id, tipo_iva: l.tipo_iva, tipo_recargo: l.tipo_recargo,
    tipo_irpf: l.tipo_irpf, iva_incluido: l.iva_incluido, por_lotes: false,
});

/** Lo que recibe el cuerpo de una respuesta fija. */
type Peticion = { url: string; cuerpo: unknown };

let siguiente = 1;

const RE_PEDIDO = /^ventas\/pedido\/[^/]+$/;
const RE_LINEAS = /^ventas\/pedido\/[^/]+\/linea$/;
const RE_LINEA = /^ventas\/pedido\/[^/]+\/linea\/[^/]+$/;

const FIJAS_PEDIDO: RespuestaFija[] = [
    { metodo: "GET", ruta: "ventas/pedido", cuerpo: ({ url }: Peticion) => listar(pedidos, url) },
    { metodo: "GET", ruta: RE_PEDIDO, cuerpo: ({ url }: Peticion) => ({ datos: pedidoDe(url) ?? pedidos[0] }) },
    {
        metodo: "POST", ruta: "ventas/pedido",
        cuerpo: ({ cuerpo }: Peticion) => {
            const { cliente } = (cuerpo ?? {}) as { cliente?: { cliente_id?: string; nombre?: string; id_fiscal?: string } };
            const id = `pwn${siguiente++}`;
            const base = pedido(id, 1048 + siguiente, 4, 0, "No", []);
            pedidos.unshift(aplicarCambios({ ...base, observaciones: "" }, { cliente: cliente ?? {} }));
            return { id };
        },
    },
    {
        metodo: "PATCH", ruta: RE_PEDIDO,
        cuerpo: ({ url, cuerpo }: Peticion) => {
            const p = pedidoDe(url);
            if (p) guardar(aplicarCambios(p, ((cuerpo ?? {}) as { cambios?: CambiosPedido }).cambios ?? {}));
            return {};
        },
    },
    {
        metodo: "DELETE", ruta: RE_PEDIDO,
        cuerpo: ({ url }: Peticion) => {
            const i = pedidos.findIndex((p) => p.id === idPedido(url));
            if (i >= 0) pedidos.splice(i, 1);
            return {};
        },
    },
    { metodo: "GET", ruta: RE_LINEAS, cuerpo: ({ url }: Peticion) => ({ datos: lineas[idPedido(url)] ?? [] }) },
    {
        metodo: "POST", ruta: RE_LINEAS,
        cuerpo: ({ url, cuerpo }: Peticion) => {
            const id = idPedido(url);
            const { lineas: nuevas = [], dry_run } = (cuerpo ?? {}) as { lineas?: PeticionLinea[]; dry_run?: boolean };
            const calculadas = nuevas.map((l) => lineaDePeticion(`${id}-n${siguiente++}`, l));
            const p = pedidos.find((x) => x.id === id);
            if (!dry_run && p) {
                lineas[id] = [...(lineas[id] ?? []), ...calculadas];
                guardar(p);
            }
            return calculadas.map(respuestaLinea);
        },
    },
    {
        metodo: "POST", ruta: /^ventas\/pedido\/[^/]+\/nueva_linea$/,
        cuerpo: ({ cuerpo }: Peticion) => respuestaLinea(lineaDePeticion("", cuerpo as PeticionLinea)),
    },
    {
        metodo: "PATCH", ruta: /^ventas\/pedido\/[^/]+\/linea\/borrar$/,
        cuerpo: ({ url, cuerpo }: Peticion) => {
            const id = idPedido(url);
            const borrar = ((cuerpo ?? {}) as { lineas?: string[] }).lineas ?? [];
            lineas[id] = (lineas[id] ?? []).filter((l) => !borrar.includes(l.id));
            const p = pedidos.find((x) => x.id === id);
            if (p) guardar(p);
            return {};
        },
    },
    {
        metodo: "PATCH", ruta: RE_LINEA,
        cuerpo: ({ url, cuerpo }: Peticion) => {
            const id = idPedido(url);
            const lineaId = tramo(url, /\/linea\/([^/]+)$/);
            const cambios = ((cuerpo ?? {}) as { cambios?: Record<string, unknown> }).cambios ?? {};
            lineas[id] = (lineas[id] ?? []).map((l) => {
                if (l.id !== lineaId) return l;
                const articulo = cambios.articulo as ArticuloPeticion | undefined;
                const a = articulo?.articulo_id ? articuloDe(articulo.articulo_id) : undefined;
                const definidos = Object.fromEntries(Object.entries(cambios).filter(([k, v]) =>
                    v !== undefined && v !== null && ["cantidad", "pvp_unitario", "dto_porcentual", "dto_lineal",
                        "grupo_iva_producto_id", "tipo_irpf"].includes(k)));
                return calcularLinea({
                    ...l, ...definidos,
                    ...(a ? { referencia: a.id, descripcion: a.descripcion, descripcion_articulo: a.descripcion } : {}),
                    ...(a && cambios.pvp_unitario === undefined ? { pvp_unitario: a.precio, grupo_iva_producto_id: a.grupo_iva_producto_id } : {}),
                } as Linea);
            });
            const p = pedidos.find((x) => x.id === id);
            if (p) guardar(p);
            return {};
        },
    },
    {
        metodo: "GET", ruta: /^ventas\/pedido\/[^/]+\/traza$/,
        cuerpo: ({ url }: Peticion) => {
            const p = pedidoDe(url) ?? pedidos[0];
            const nodo = { tipo: "pedido_venta", id: p.id, codigo: p.codigo, visible: true, fecha: p.fecha, cliente: p.nombre_cliente, total: p.total };
            const albaranes = p.servido === "No" ? [] : [{
                albaran: {
                    tipo: "albaran_venta", id: `alb-${p.id}`, codigo: `A${p.codigo.slice(1)}`, visible: true,
                    fecha: p.fecha_salida, cliente: p.nombre_cliente, total: p.total,
                },
            }];
            return { datos: { pedido: nodo, albaranes } };
        },
    },
    {
        metodo: "POST", ruta: "ventas/albaran/desde-pedidos",
        cuerpo: ({ cuerpo }: Peticion) => {
            const ids = ((cuerpo ?? {}) as { pedido_ids?: string[] }).pedido_ids ?? [];
            ids.forEach((id) => {
                const p = pedidos.find((x) => x.id === id);
                if (!p) return;
                lineas[id] = (lineas[id] ?? []).map((l) => ({ ...l, servida: l.cantidad }));
                guardar({ ...p, servido: "TOTAL" });
            });
            const n = siguiente++;
            return { datos: { albaran_id: `alb-n${n}`, codigo: `AW${String(n).padStart(6, "0")}` } };
        },
    },
    {
        metodo: "GET", ruta: "comun/agregado/ventas.pedido",
        cuerpo: ({ url }: Peticion) => {
            const { datos } = listar(pedidos, url);
            const suma = (campo: string) => redondear(datos.reduce((s, p) => s + Number(p[campo] ?? 0), 0));
            return {
                totales: {
                    conteo: datos.length, suma_total: suma("total"), suma_neto: suma("neto"),
                    promedio_total: datos.length ? redondear(suma("total") / datos.length) : null,
                },
            };
        },
    },
    { metodo: "GET", ruta: "comun/widgets_usuario/ventas.pedido", cuerpo: { pantalla: "ventas.pedido", widgets: null, origen: null } },
];

export const demo: DemoModulo = {
    pantallas: [
        { nombre: "Pedidos web", ruta: "/ventas/pedido" },
        { nombre: "Catálogo", ruta: "/ventas/articulo" },
    ],
    guia: "Abre un pedido de la web, añade o cambia líneas y mira cómo se recalculan los totales; en Catálogo ajusta el precio de un artículo.",
    colecciones: {
        "ventas/articulo": CATALOGO,
        "ventas/articulo/tags": CATALOGO,
        "almacen/familia": FAMILIAS,
        "almacen/almacen": ALMACENES_VENTA,
        "ventas/cliente": CLIENTES_VENTA,
        ...direccionesCliente,
        "ventas/agente": AGENTES_VENTA,
        "cache/comun/formapago": FORMAS_PAGO,
        "cache/comun/divisa": [
            { id: "EUR", descripcion: "Euro", tasa_conversion: 1 },
            { id: "USD", descripcion: "Dólar estadounidense", tasa_conversion: 0.92 },
            { id: "GBP", descripcion: "Libra esterlina", tasa_conversion: 1.17 },
        ],
        "cache/comun/grupo_iva_negocio": [
            { id: "NAC", descripcion: "nacional" },
            { id: "UE", descripcion: "intracomunitario" },
            { id: "EXP", descripcion: "exportaciones" },
        ],
        "cache/comun/grupo_iva_producto": [
            { id: "GEN", descripcion: "General 21%" },
            { id: "RED", descripcion: "Reducido 10%" },
            { id: "SRED", descripcion: "Superreducido 4%" },
        ],
    },
    fijas: [
        ...FIJAS_PEDIDO,
        { metodo: "GET", ruta: "almacen/config", cuerpo: { datos: { impuesto_id: "SRED", usar_iva_defecto: false } } },
    ],
};
