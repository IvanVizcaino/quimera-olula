import { RespuestaFija } from "../api_demo.ts";
import { DemoModulo } from "../diseño.ts";
import { AGENTES, ALMACENES, ARTICULOS, CLIENTES, fecha, FORMAS_PAGO } from "./comun.ts";

/*
 * Demo de Ventas: presupuestos → pedidos → albaranes → facturas, y clientes.
 *
 * Los documentos no van en `colecciones` sino en un pequeño motor en memoria (más abajo,
 * exportado para la demo de Compras): sus PATCH llegan como `{cambios: {...}}`, las líneas
 * se dan de alta en lote y la cabecera recalcula los totales a partir de las líneas. Así,
 * añadir una línea, cambiar una cantidad o aprobar un presupuesto se ve igual que en la app.
 */

// ─── Motor de documentos en memoria ───────────────────────────────────────────

export type Fila = Record<string, unknown> & { id: string };
export type Peticion = { url: string; cuerpo: unknown };
export type Cuerpo = Record<string, unknown>;

const redondear = (n: number): number => Math.round(n * 100) / 100;

export const escapar = (texto: string): string => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Tramos de la ruta (sin prefijo ni query) a partir de la url de la petición. */
export const tramos = (url: string): string[] =>
    new URL(url, "http://demo").pathname.split("/").filter(Boolean).map(decodeURIComponent);

const criteriaDe = (url: string): { filtro?: unknown; orden?: string[]; paginacion?: { limite: number; pagina: number } } => {
    try {
        return JSON.parse(new URL(url, "http://demo").searchParams.get("q") ?? "{}");
    } catch {
        return {};
    }
};

const comparar = (a: unknown, b: unknown): number =>
    typeof a === "number" ? a - Number(b) : String(a ?? "").localeCompare(String(b ?? ""), "es", { numeric: true });

/** Filtro del servidor: cláusulas [campo, op, valor], listas (y) y {or}/{and}. Campo desconocido = no filtra. */
export const cumpleFiltro = (fila: Record<string, unknown>, filtro: unknown): boolean => {
    if (!filtro) return true;
    if (Array.isArray(filtro)) {
        if (filtro.length === 0) return true;
        if (Array.isArray(filtro[0])) return filtro.every((c) => cumpleFiltro(fila, c));
        const [campo, op, valor] = filtro as [string, string, unknown];
        if (!(campo in fila)) return true;
        const v = fila[campo];
        switch (op) {
            case "=": case "==": return String(v) === String(valor);
            case "!=": case "<>!": return String(v) !== String(valor);
            case "~": return String(v ?? "").toLowerCase().includes(String(valor ?? "").toLowerCase());
            case "in": return (Array.isArray(valor) ? valor : [valor]).map(String).includes(String(v));
            case ">": return comparar(v, valor) > 0;
            case ">=": return comparar(v, valor) >= 0;
            case "<": return comparar(v, valor) < 0;
            case "<=": return comparar(v, valor) <= 0;
            case "<>": {
                const [desde, hasta] = String(valor).split("_");
                const texto = String(v ?? "").slice(0, 10);
                return texto >= desde && texto <= hasta;
            }
            default: return true;
        }
    }
    const f = filtro as { or?: unknown[]; and?: unknown[] };
    if (f.or) return f.or.some((c) => cumpleFiltro(fila, c));
    if (f.and) return f.and.every((c) => cumpleFiltro(fila, c));
    return true;
};

/** Lista como la del servidor: filtro, orden y paginación de `?q=`. */
export const listar = (filas: Fila[], url: string) => {
    const { filtro, orden, paginacion } = criteriaDe(url);
    let datos = filas.filter((f) => cumpleFiltro(f, filtro));
    if (orden?.length) {
        const [campo, sentido] = orden;
        const signo = String(sentido).toUpperCase() === "DESC" ? -1 : 1;
        datos = [...datos].sort((a, b) => signo * comparar(a[campo], b[campo]));
    }
    const total = datos.length;
    if (paginacion?.limite) {
        const inicio = Math.max(0, (paginacion.pagina - 1) * paginacion.limite);
        datos = datos.slice(inicio, inicio + paginacion.limite);
    }
    return { datos, total };
};

let contador = 100;
export const nuevoId = (prefijo: string): string => `${prefijo}${++contador}`;

type OpcionesRecurso = {
    prefijo?: string;
    /** Registro nuevo a partir del cuerpo del POST. */
    alta?: (cuerpo: Cuerpo, id: string) => Fila;
    /** Aplica los `{cambios}` de un PATCH. */
    cambiar?: (fila: Fila, cambios: Cuerpo) => Fila;
};

/**
 * Recurso REST en memoria con el formato de la API: lista `{datos,total}` con filtro, orden y
 * paginación, registro `{datos}`, alta `{id}`, cambios como `{cambios}` y borrado.
 */
export class RecursoDemo {
    constructor(readonly ruta: string, readonly filas: Fila[], readonly opciones: OpcionesRecurso = {}) { }

    /** Registro tal y como lo devuelve la API (con los campos calculados). */
    leer(fila: Fila): Fila {
        return fila;
    }

    crear(cuerpo: Cuerpo, id: string): Fila {
        return this.opciones.alta ? this.opciones.alta(cuerpo, id) : { ...cuerpo, id };
    }

    buscar(id: string): Fila | undefined {
        return this.filas.find((f) => f.id === id);
    }

    guardar(fila: Fila): void {
        const i = this.filas.findIndex((f) => f.id === fila.id);
        if (i >= 0) this.filas[i] = fila;
        else this.filas.unshift(fila);
    }

    leidas(): Fila[] {
        return this.filas.map((f) => this.leer(f));
    }

    fijas(): RespuestaFija[] {
        const uno = new RegExp(`^${escapar(this.ruta)}/([^/]+)$`);
        const idDe = (url: string) => tramos(url).at(-1) ?? "";
        return [
            { metodo: "GET", ruta: this.ruta, cuerpo: ({ url }: Peticion) => listar(this.leidas(), url) },
            {
                metodo: "GET", ruta: uno, cuerpo: ({ url }: Peticion) => {
                    const fila = this.buscar(idDe(url));
                    return { datos: fila ? this.leer(fila) : null };
                },
            },
            {
                metodo: "POST", ruta: this.ruta, cuerpo: ({ cuerpo }: Peticion) => {
                    const id = nuevoId(this.opciones.prefijo ?? "n");
                    this.filas.unshift(this.crear((cuerpo ?? {}) as Cuerpo, id));
                    return { id };
                },
            },
            {
                metodo: "PATCH", ruta: uno, cuerpo: ({ url, cuerpo }: Peticion) => {
                    const fila = this.buscar(idDe(url));
                    if (!fila) return {};
                    const cambios = ((cuerpo as Cuerpo)?.cambios ?? cuerpo ?? {}) as Cuerpo;
                    this.guardar(this.opciones.cambiar ? this.opciones.cambiar(fila, cambios) : { ...fila, ...cambios, id: fila.id });
                    return {};
                },
            },
            {
                metodo: "DELETE", ruta: uno, cuerpo: ({ url }: Peticion) => {
                    const i = this.filas.findIndex((f) => f.id === idDe(url));
                    if (i >= 0) this.filas.splice(i, 1);
                    return {};
                },
            },
        ];
    }
}

/** Datos de una línea ya calculada (precio, IVA, importes), común a ventas y compras. */
export type LineaCalculada = {
    referencia: string | null;
    descripcion: string;
    descripcion_articulo: string | null;
    cantidad: number;
    pvp_unitario: number;
    dto_porcentual: number;
    dto_lineal: number;
    pvp_sin_dto: number;
    pvp_total: number;
    grupo_iva_producto_id: string;
    tipo_iva: number;
    tipo_recargo: number;
    tipo_irpf: number;
    iva_incluido: boolean;
};

export const GRUPOS_IVA_PRODUCTO = [
    { id: "GENERAL", descripcion: "General (21%)", iva: 21 },
    { id: "REDUCIDO", descripcion: "Reducido (10%)", iva: 10 },
    { id: "SUPERREDUCIDO", descripcion: "Superreducido (4%)", iva: 4 },
];

const ivaDeGrupo = (grupo: string): number => GRUPOS_IVA_PRODUCTO.find((g) => g.id === grupo)?.iva ?? 21;

/** Fruta y verdura van al 4 %; envases y servicios al 21 %. */
export const grupoIvaArticulo = (referencia: string | null): string => {
    const articulo = ARTICULOS.find((a) => a.id === referencia);
    return articulo && articulo.familia !== "Envases" ? "SUPERREDUCIDO" : "GENERAL";
};

/** Recalcula importes de una línea con sus datos actuales. */
export const recalcularLinea = <T extends Cuerpo>(datos: T): T & LineaCalculada => {
    const l = datos as Partial<LineaCalculada>;
    const cantidad = Number(l.cantidad ?? 0);
    const pvp = Number(l.pvp_unitario ?? 0);
    const dto = Number(l.dto_porcentual ?? 0);
    const dtoLineal = Number(l.dto_lineal ?? 0);
    const grupo = l.grupo_iva_producto_id || grupoIvaArticulo(l.referencia ?? null);
    const sinDto = redondear(cantidad * pvp);
    return {
        ...datos,
        referencia: l.referencia ?? null,
        descripcion: l.descripcion ?? "",
        descripcion_articulo: l.descripcion_articulo ?? null,
        cantidad, pvp_unitario: pvp, dto_porcentual: dto, dto_lineal: dtoLineal,
        pvp_sin_dto: sinDto,
        pvp_total: redondear(sinDto * (1 - dto / 100) - dtoLineal),
        grupo_iva_producto_id: grupo,
        tipo_iva: ivaDeGrupo(grupo),
        tipo_recargo: 0, tipo_irpf: Number(l.tipo_irpf ?? 0), iva_incluido: false,
    };
};

type ArticuloPeticion = { articulo_id?: string; descripcion?: string; pvp_unitario?: number; grupo_iva_producto_id?: string };

/**
 * Línea a partir de la petición del servidor (`{articulo, cantidad, pvp_unitario?, dto_porcentual?…}`).
 * `precio` da el precio del artículo de catálogo (PVP en ventas, coste en compras).
 */
export const lineaDePeticion = (p: Cuerpo, precio: (articulo: typeof ARTICULOS[number]) => number): LineaCalculada => {
    const art = (p.articulo ?? {}) as ArticuloPeticion;
    const catalogo = ARTICULOS.find((a) => a.id === art.articulo_id);
    return recalcularLinea({
        referencia: art.articulo_id ?? null,
        descripcion: art.descripcion || catalogo?.descripcion || "",
        descripcion_articulo: catalogo?.descripcion ?? null,
        cantidad: Number(p.cantidad ?? 1),
        pvp_unitario: Number(p.pvp_unitario ?? art.pvp_unitario ?? (catalogo ? precio(catalogo) : 0)),
        dto_porcentual: Number(p.dto_porcentual ?? 0),
        dto_lineal: Number(p.dto_lineal ?? 0),
        grupo_iva_producto_id: String(p.grupo_iva_producto_id ?? art.grupo_iva_producto_id ?? ""),
        tipo_irpf: Number(p.tipo_irpf ?? 0),
    });
};

/** Respuesta de `nueva_linea` (cálculo previo al alta), igual en ventas y compras. */
export const respuestaNuevaLinea = (l: LineaCalculada) => ({
    articulo_id: l.referencia, descripcion: l.descripcion, cantidad: l.cantidad, pvp_unitario: l.pvp_unitario,
    pvp_total: l.pvp_total, dto_porcentual: l.dto_porcentual, dto_lineal: l.dto_lineal,
    grupo_iva_producto_id: l.grupo_iva_producto_id, tipo_iva: l.tipo_iva, tipo_recargo: 0, tipo_irpf: l.tipo_irpf,
    iva_incluido: false, por_lotes: false,
});

/** Aplica `{cambios}` de una línea: artículo, cantidad, precio, descuentos, IVA. */
export const cambiarLinea = (linea: Fila, cambios: Cuerpo, precio: (articulo: typeof ARTICULOS[number]) => number): Fila => {
    const art = cambios.articulo as ArticuloPeticion | undefined;
    let nueva: Fila = { ...linea };
    if (art?.articulo_id && art.articulo_id !== linea.referencia) {
        const catalogo = ARTICULOS.find((a) => a.id === art.articulo_id);
        nueva = {
            ...nueva, referencia: art.articulo_id, descripcion: art.descripcion || catalogo?.descripcion || "",
            descripcion_articulo: catalogo?.descripcion ?? null, pvp_unitario: catalogo ? precio(catalogo) : 0,
            grupo_iva_producto_id: grupoIvaArticulo(art.articulo_id),
        };
    } else if (art?.descripcion) {
        nueva.descripcion = art.descripcion;
    }
    for (const campo of ["cantidad", "pvp_unitario", "dto_porcentual", "dto_lineal", "grupo_iva_producto_id", "tipo_irpf"]) {
        if (cambios[campo] !== undefined && cambios[campo] !== null) nueva[campo] = cambios[campo];
    }
    if (cambios.comision !== undefined) nueva.por_comision = cambios.comision;
    return recalcularLinea(nueva);
};

/** Totales de cabecera a partir de las líneas (con descuento global opcional). */
export const totalesDe = (lineas: Fila[], porDescuento = 0) => {
    const netoSinDto = redondear(lineas.reduce((s, l) => s + Number(l.pvp_total ?? 0), 0));
    const factor = 1 - porDescuento / 100;
    const neto = redondear(netoSinDto * factor);
    const iva = redondear(lineas.reduce((s, l) => s + Number(l.pvp_total ?? 0) * factor * Number(l.tipo_iva ?? 0) / 100, 0));
    const total = redondear(neto + iva);
    return { neto_sin_dto: netoSinDto, neto, total_iva: iva, total_recargo: 0, total_irpf: 0, total, total_divisa_empresa: total };
};

/**
 * Documento con líneas (`<ruta>/<id>/linea`): alta en lote, cálculo `nueva_linea`, cambio,
 * borrado en lote (`linea/borrar`) y cierre de línea. Los totales de la cabecera salen de las líneas.
 */
type OpcionesDocumento = OpcionesRecurso & {
    prefijo: string;
    /** Precio de catálogo de un artículo (PVP o coste). */
    precio: (articulo: typeof ARTICULOS[number]) => number;
    /** Campos propios del tipo de documento en cada línea nueva. */
    extraLinea?: (docId: string) => Cuerpo;
    /** Respuesta del alta de líneas (ventas: las líneas; compras: sus ids). */
    respuestaAlta: (creadas: Fila[]) => unknown;
    /** Campos calculados de cabecera (estado...) además de los totales. */
    calcular?: (fila: Fila, lineas: Fila[]) => Fila;
    /** Los totales aplican `por_descuento` de la cabecera. */
    conDescuento?: boolean;
};

export class DocumentoDemo extends RecursoDemo {
    constructor(ruta: string, filas: Fila[], readonly lineas: Record<string, Fila[]>, readonly doc: OpcionesDocumento) {
        super(ruta, filas, doc);
    }

    override leer(fila: Fila): Fila {
        const lineas = this.lineasDe(fila.id);
        const conTotales = { ...fila, ...totalesDe(lineas, this.doc.conDescuento ? Number(fila.por_descuento ?? 0) : 0) };
        return this.doc.calcular ? this.doc.calcular(conTotales, lineas) : conTotales;
    }

    override crear(cuerpo: Cuerpo, id: string): Fila {
        this.lineas[id] = [];
        return super.crear(cuerpo, id);
    }

    lineasDe(id: string): Fila[] {
        return (this.lineas[id] ??= []);
    }

    /** Añade líneas ya calculadas a un documento (también lo usan las acciones de paso entre documentos). */
    anadir(docId: string, lineas: Cuerpo[]): Fila[] {
        const creadas = lineas.map((l) => recalcularLinea({ ...this.doc.extraLinea?.(docId), ...l, id: nuevoId("l") }));
        this.lineasDe(docId).push(...creadas);
        return creadas;
    }

    override fijas(): RespuestaFija[] {
        const base = escapar(this.ruta);
        const docId = (url: string) => tramos(url)[this.ruta.split("/").length] ?? "";
        const peticiones = (cuerpo: unknown): Cuerpo[] => ((cuerpo as Cuerpo)?.lineas ?? []) as Cuerpo[];
        return [
            { metodo: "GET", ruta: new RegExp(`^${base}/[^/]+/linea$`), cuerpo: ({ url }: Peticion) => ({ datos: this.lineasDe(docId(url)) }) },
            {
                metodo: "GET", ruta: new RegExp(`^${base}/[^/]+/linea/[^/]+$`), cuerpo: ({ url }: Peticion) =>
                    ({ datos: this.lineasDe(docId(url)).find((l) => l.id === tramos(url).at(-1)) ?? null }),
            },
            {
                metodo: "POST", ruta: new RegExp(`^${base}/[^/]+/linea$`), cuerpo: ({ url, cuerpo }: Peticion) => {
                    const id = docId(url);
                    const calculadas = peticiones(cuerpo).map((p) => lineaDePeticion(p, this.doc.precio));
                    if ((cuerpo as Cuerpo)?.dry_run) return this.doc.respuestaAlta(calculadas.map((l) => ({ ...l, id: "" })));
                    return this.doc.respuestaAlta(this.anadir(id, calculadas));
                },
            },
            {
                metodo: "POST", ruta: new RegExp(`^${base}/[^/]+/nueva_linea$`), cuerpo: ({ cuerpo }: Peticion) =>
                    respuestaNuevaLinea(lineaDePeticion((cuerpo ?? {}) as Cuerpo, this.doc.precio)),
            },
            {
                metodo: "PATCH", ruta: new RegExp(`^${base}/[^/]+/linea/borrar$`), cuerpo: ({ url, cuerpo }: Peticion) => {
                    const id = docId(url);
                    const borrar = ((cuerpo as Cuerpo)?.lineas ?? []) as string[];
                    this.lineas[id] = this.lineasDe(id).filter((l) => !borrar.includes(l.id));
                    return {};
                },
            },
            {
                metodo: "PATCH", ruta: new RegExp(`^${base}/[^/]+/linea/[^/]+/cerrar$`), cuerpo: ({ url, cuerpo }: Peticion) => {
                    const linea = this.lineasDe(docId(url)).find((l) => l.id === tramos(url).at(-2));
                    if (linea) linea.cerrada = Boolean((cuerpo as Cuerpo)?.cerrada);
                    return {};
                },
            },
            {
                metodo: "PATCH", ruta: new RegExp(`^${base}/[^/]+/linea/[^/]+$`), cuerpo: ({ url, cuerpo }: Peticion) => {
                    const lista = this.lineasDe(docId(url));
                    const i = lista.findIndex((l) => l.id === tramos(url).at(-1));
                    if (i >= 0) lista[i] = cambiarLinea(lista[i], ((cuerpo as Cuerpo)?.cambios ?? {}) as Cuerpo, this.doc.precio);
                    return {};
                },
            },
            ...super.fijas(),
        ];
    }
}

/** Agregados de los widgets de los maestros (`/comun/agregado/<recurso>?metricas=…`). */
export const fijaAgregados = (recursos: Record<string, RecursoDemo>): RespuestaFija[] => [
    { metodo: "GET", ruta: "comun/agregado", cuerpo: [] },
    { metodo: "GET", ruta: /^comun\/widgets_usuario\//, cuerpo: ({ url }: Peticion) => ({ pantalla: tramos(url).at(-1), widgets: null, origen: null }) },
    {
        metodo: "GET", ruta: /^comun\/agregado\/[^/]+$/, cuerpo: ({ url }: Peticion) => {
            const recurso = recursos[tramos(url).at(-1) ?? ""];
            const filas = recurso ? listar(recurso.leidas(), url.replace(/&?metricas=[^&]*/, "")).datos : [];
            const metricas = (new URL(url, "http://demo").searchParams.get("metricas") ?? "conteo").split(",");
            const totales = Object.fromEntries(metricas.map((m) => {
                const [op, campo] = m.split(":");
                const valores = filas.map((f) => Number(f[campo] ?? 0));
                const suma = redondear(valores.reduce((s, v) => s + v, 0));
                const valor = op === "conteo" ? filas.length
                    : op === "suma" ? suma
                        : op === "promedio" ? (filas.length ? redondear(suma / filas.length) : null)
                            : op === "minimo" ? (valores.length ? Math.min(...valores) : null)
                                : op === "maximo" ? (valores.length ? Math.max(...valores) : null) : null;
                return [campo ? `${op}_${campo}` : op, valor];
            }));
            return { totales, grupos: [] };
        },
    },
];

// ─── Maestros de ventas ───────────────────────────────────────────────────────

type DireccionDemo = {
    nombre_via: string; tipo_via: string; numero: string; otros: string; cod_postal: string; ciudad: string;
    provincia_id: number; provincia: string; pais_id: string; apartado: string; telefono: string;
};

const dir = (tipo_via: string, nombre_via: string, numero: string, cod_postal: string, ciudad: string,
    provincia_id: number, provincia: string, telefono = ""): DireccionDemo => ({
    tipo_via, nombre_via, numero, otros: "", cod_postal, ciudad, provincia_id, provincia, pais_id: "ES", apartado: "", telefono,
});

/** Dirección principal de cada cliente (id `d<cliente>`). */
const DIRECCIONES: Record<string, DireccionDemo> = {
    c1: dir("Calle", "Real", "12", "04001", "Almería", 4, "Almería", "950 000 001"),
    c2: dir("Avenida", "de Andalucía", "45", "18014", "Granada", 18, "Granada", "958 000 002"),
    c3: dir("Paseo", "Marítimo", "3", "11001", "Cádiz", 11, "Cádiz", "956 000 003"),
    c4: dir("Carretera", "de Almoradí", "km 2", "03300", "Orihuela", 3, "Alicante", "966 000 004"),
    c5: dir("Calle", "Sin nombre", "s/n", "04700", "El Ejido", 4, "Almería"),
};

const clienteDe = (id: string) => CLIENTES.find((c) => c.id === id) ?? CLIENTES[4];
const nombreAgente = (id: unknown) => AGENTES.find((a) => a.id === id)?.nombre ?? "";
const nombreFormaPago = (id: unknown) => FORMAS_PAGO.find((f) => f.id === id)?.descripcion ?? "";
const nombreAlmacen = (id: unknown) => ALMACENES.find((a) => a.id === id)?.nombre ?? "";

/** Condiciones comerciales de cada cliente: agente y forma de pago. */
const CONDICIONES: Record<string, { agente: string; formaPago: string; observaciones: string }> = {
    c1: { agente: "ag1", formaPago: "TRF30", observaciones: "" },
    c2: { agente: "ag2", formaPago: "REC60", observaciones: "Entregar antes de las 8:00 en el muelle 2." },
    c3: { agente: "ag1", formaPago: "TRF30", observaciones: "" },
    c4: { agente: "ag2", formaPago: "REC60", observaciones: "Pedir albarán firmado por el encargado." },
    c5: { agente: "", formaPago: "CONT", observaciones: "" },
};

const cliente = (c: typeof CLIENTES[number], extra: Cuerpo = {}): Fila => {
    const cond = CONDICIONES[c.id];
    return {
        id: c.id, nombre: c.nombre, nombre_comercial: null, id_fiscal: c.cif, tipo_id_fiscal: "39",
        agente_id: cond.agente || null, nombre_agente: nombreAgente(cond.agente) || null,
        divisa_id: "EUR", divisa: "Euro", serie_id: "A", serie: "Serie A", forma_pago_id: cond.formaPago,
        forma_pago: nombreFormaPago(cond.formaPago), grupo_iva_negocio_id: "NACIONAL", de_baja: false, fecha_baja: null,
        grupo_id: "", grupo: "", telefono1: c.telefono1 ?? "", telefono2: "", email: c.email ?? "", web: "",
        observaciones: cond.observaciones, copiasfactura: 1, contacto_id: "", cuenta_domiciliada: "", descripcion_cuenta: "",
        cuenta_remesa: "", descripcion_cuenta_remesa: "", ...extra,
    };
};

const CUENTAS: Record<string, { id: string; descripcion: string; iban: string }> = {
    c2: { id: "cb2", descripcion: "Cuenta principal", iban: "ES9100000000000000000002" },
    c4: { id: "cb4", descripcion: "Cuenta de la cooperativa", iban: "ES9100000000000000000004" },
};

const clientes = new RecursoDemo("ventas/cliente", CLIENTES.map((c) => cliente(c, CUENTAS[c.id]
    ? { cuenta_domiciliada: CUENTAS[c.id].id, descripcion_cuenta: CUENTAS[c.id].descripcion }
    : {})), {
    prefijo: "c",
    alta: (cuerpo, id) => cliente({
        id, nombre: String(cuerpo.nombre ?? ""), cif: String(cuerpo.id_fiscal ?? ""), email: null, telefono1: null, poblacion: null,
    }, { tipo_id_fiscal: cuerpo.tipo_id_fiscal ?? "39", agente_id: cuerpo.agente_id || null, nombre_agente: nombreAgente(cuerpo.agente_id) || null }),
    cambiar: (fila, cambios) => {
        const idFiscal = cambios.id_fiscal as { id?: string; tipo?: string } | undefined;
        return {
            ...fila, ...cambios, id: fila.id,
            ...(idFiscal ? { id_fiscal: idFiscal.id ?? fila.id_fiscal, tipo_id_fiscal: idFiscal.tipo ?? fila.tipo_id_fiscal } : {}),
            ...(cambios.agente_id !== undefined ? { nombre_agente: nombreAgente(cambios.agente_id) || null } : {}),
            ...(cambios.forma_pago_id !== undefined ? { forma_pago: nombreFormaPago(cambios.forma_pago_id) } : {}),
        };
    },
});

const contacto = (id: string, nombre: string, cargo: string, email: string, telefono1: string) =>
    ({ id, nombre, cargo, email, telefono1, telefono2: null, observaciones: null });

/** Agenda de contactos de cada cliente. */
const CONTACTOS: Record<string, ReturnType<typeof contacto>[]> = {
    c1: [contacto("k1", "Laura Gómez", "Compras", "laura@frutasmartin.ejemplo.test", "600 000 001")],
    c2: [
        contacto("k2", "Javier Ruiz", "Jefe de frescos", "javier@lahuerta.ejemplo.test", "600 000 002"),
        contacto("k3", "Ana Molina", "Administración", "ana@lahuerta.ejemplo.test", "600 000 003"),
    ],
    c3: [contacto("k4", "Carlos Pérez", "Jefe de cocina", "carlos@elpuerto.ejemplo.test", "600 000 004")],
    c4: [contacto("k5", "Rosa Martínez", "Gerente", "rosa@vegabaja.ejemplo.test", "600 000 005")],
};

/** Sub-recursos de cada cliente: direcciones, cuentas y contactos (colecciones normales). */
const subrecursosCliente = Object.fromEntries(CLIENTES.flatMap((c) => [
    [`ventas/cliente/${c.id}/contacto`, CONTACTOS[c.id] ?? []],
    [`ventas/cliente/${c.id}/direccion`, [{ id: `d${c.id}`, direccion: DIRECCIONES[c.id], dir_envio: true, dir_facturacion: true }]],
    [`ventas/cliente/${c.id}/cuenta_banco`, CUENTAS[c.id] ? [{
        id: CUENTAS[c.id].id,
        cuenta: {
            descripcion: CUENTAS[c.id].descripcion, iban: CUENTAS[c.id].iban, bic: "DEMOESMMXXX", codigo_cuenta: CUENTAS[c.id].iban.slice(4),
            pais_id: "ES", entidad: "0000", agencia: "0000", digito_control: "00", cuenta: CUENTAS[c.id].iban.slice(-10),
        },
    }] : []],
]));

// ─── Documentos ───────────────────────────────────────────────────────────────

/** Línea de partida: [índice en ARTICULOS, cantidad, % dto]. */
type LineaInicial = [number, number, number?];

const lineasDe = (iniciales: LineaInicial[], extra: (i: number) => Cuerpo = () => ({})): Fila[] =>
    iniciales.map(([a, cantidad, dto = 0], i) => {
        const art = ARTICULOS[a];
        return {
            ...recalcularLinea({
                referencia: art.id, descripcion: art.descripcion, descripcion_articulo: art.descripcion,
                cantidad, pvp_unitario: art.pvp, dto_porcentual: dto, grupo_iva_producto_id: grupoIvaArticulo(art.id),
            }),
            por_comision: 0, importe_comision: 0, ...extra(i), id: nuevoId("l"),
        } as Fila;
    });

const AÑO = new Date().getFullYear();
const codigo = (prefijo: string, n: number) => `${prefijo}${AÑO}A${String(n).padStart(4, "0")}`;

/** Cabecera común de los cuatro documentos de venta (formato de la API). */
const cabecera = (id: string, cod: string, clienteId: string, dias: number, extra: Cuerpo = {}): Fila => {
    const c = clienteDe(clienteId);
    const cond = CONDICIONES[c.id];
    return {
        id, codigo: cod, fecha: fecha(dias), cliente_id: c.id, nombre_cliente: c.nombre, id_fiscal: c.cif,
        direccion_id: `d${c.id}`, direccion: DIRECCIONES[c.id], agente_id: cond.agente, nombre_agente: nombreAgente(cond.agente),
        por_comision: cond.agente ? 3 : 0, divisa_id: "EUR", tasa_conversion: 1, forma_pago_id: cond.formaPago,
        nombre_forma_pago: nombreFormaPago(cond.formaPago), grupo_iva_negocio_id: "NACIONAL", serie_id: "A",
        almacen_id: "ALM", nombre_almacen: nombreAlmacen("ALM"), por_descuento: 0, observaciones: "", ...extra,
    };
};

/** Alta de documento: `{cliente: {cliente_id, direccion_id} | {nombre, id_fiscal, direccion}}`. */
const datosCliente = (c: Cuerpo): Cuerpo => {
    if (c.cliente_id) {
        const reg = clienteDe(String(c.cliente_id));
        const cond = CONDICIONES[reg.id];
        return {
            cliente_id: reg.id, nombre_cliente: reg.nombre, id_fiscal: reg.cif, direccion_id: c.direccion_id ?? `d${reg.id}`,
            direccion: DIRECCIONES[reg.id], agente_id: cond.agente, nombre_agente: nombreAgente(cond.agente),
            forma_pago_id: cond.formaPago, nombre_forma_pago: nombreFormaPago(cond.formaPago),
        };
    }
    const d = (c.direccion ?? {}) as Cuerpo;
    return {
        cliente_id: null, nombre_cliente: c.nombre ?? c.nombre_cliente ?? "", id_fiscal: c.id_fiscal ?? "", direccion_id: null,
        direccion: { ...DIRECCIONES.c5, ...Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v ?? ""])) },
    };
};

const altaDocumento = (prefijo: string, siguiente: () => number, extra: Cuerpo) => (cuerpo: Cuerpo, id: string): Fila => ({
    ...cabecera(id, codigo(prefijo, siguiente()), "c5", 0, extra),
    ...datosCliente((cuerpo.cliente ?? cuerpo) as Cuerpo),
});

/** `{cambios}` de cabecera: cliente, divisa y nombres de agente, forma de pago y almacén. */
const cambiarCabecera = (fila: Fila, cambios: Cuerpo): Fila => {
    const { cliente: cambioCliente, divisa, ...resto } = cambios;
    const nueva: Fila = { ...fila, ...resto, id: fila.id };
    if (cambioCliente) Object.assign(nueva, datosCliente(cambioCliente as Cuerpo));
    if (resto.cliente_id && resto.cliente_id !== fila.cliente_id) Object.assign(nueva, datosCliente(resto));
    if (divisa) Object.assign(nueva, { divisa_id: (divisa as Cuerpo).divisa_id ?? "EUR", tasa_conversion: (divisa as Cuerpo).tasa_conversion ?? 1 });
    if (typeof resto.fecha === "string") nueva.fecha = resto.fecha.slice(0, 10);
    if (resto.agente_id !== undefined) nueva.nombre_agente = nombreAgente(resto.agente_id);
    if (resto.forma_pago_id !== undefined) nueva.nombre_forma_pago = nombreFormaPago(resto.forma_pago_id);
    if (resto.almacen_id !== undefined) nueva.nombre_almacen = nombreAlmacen(resto.almacen_id);
    return nueva;
};

/** Ventas: el alta de líneas responde con las líneas calculadas (con su id). */
const respuestaAltaVenta = (creadas: Fila[]) => creadas.map((l) => ({ ...respuestaNuevaLinea(l as unknown as LineaCalculada), id: l.id }));

let numeros = { pre: 13, ped: 41, alb: 61, fac: 84 };
const siguiente = (clave: keyof typeof numeros) => () => (numeros = { ...numeros, [clave]: numeros[clave] + 1 })[clave];

// Presupuestos: tres pendientes, uno a medias y dos ya pasados a pedido.
const L_PRE: Record<string, LineaInicial[]> = {
    p1: [[0, 300], [1, 120], [6, 40]],
    p2: [[3, 500, 5], [4, 150], [6, 60]],
    p3: [[0, 40], [2, 30], [5, 120]],
    p4: [[0, 600, 3], [3, 400, 3], [6, 100]],
    p5: [[5, 240], [4, 80]],
    p6: [[1, 200], [2, 180], [6, 38]],
};
const presupuestos = new DocumentoDemo("ventas/presupuesto", [
    cabecera("p1", codigo("PR", 11), "c2", -2, { fecha_salida: fecha(5), estado_aprobado: "PENDIENTE" }),
    cabecera("p2", codigo("PR", 12), "c1", -4, { fecha_salida: fecha(3), estado_aprobado: "PENDIENTE", por_descuento: 2 }),
    cabecera("p3", codigo("PR", 13), "c3", -6, { fecha_salida: fecha(1), estado_aprobado: "PENDIENTE" }),
    cabecera("p4", codigo("PR", 9), "c4", -15, { fecha_salida: fecha(-8), estado_aprobado: "PARCIAL" }),
    cabecera("p5", codigo("PR", 7), "c1", -25, { fecha_salida: fecha(-20), estado_aprobado: "TOTAL" }),
    cabecera("p6", codigo("PR", 8), "c2", -22, { fecha_salida: fecha(-18), estado_aprobado: "TOTAL" }),
], {
    p1: lineasDe(L_PRE.p1, () => ({ aprobada: 0, cerrada: false })),
    p2: lineasDe(L_PRE.p2, () => ({ aprobada: 0, cerrada: false })),
    p3: lineasDe(L_PRE.p3, () => ({ aprobada: 0, cerrada: false })),
    p4: lineasDe(L_PRE.p4, (i) => ({ aprobada: i < 2 ? L_PRE.p4[i][1] : 0, cerrada: false })),
    p5: lineasDe(L_PRE.p5, (i) => ({ aprobada: L_PRE.p5[i][1], cerrada: true })),
    p6: lineasDe(L_PRE.p6, (i) => ({ aprobada: L_PRE.p6[i][1], cerrada: true })),
}, {
    prefijo: "p", precio: (a) => a.pvp, conDescuento: true, respuestaAlta: respuestaAltaVenta,
    extraLinea: () => ({ aprobada: 0, cerrada: false, por_comision: 0, importe_comision: 0 }),
    alta: altaDocumento("PR", siguiente("pre"), { fecha_salida: fecha(7), estado_aprobado: "PENDIENTE" }),
    cambiar: cambiarCabecera,
    calcular: (f) => ({ ...f, editable: f.estado_aprobado !== "TOTAL" }),
});

// Pedidos: «servido» No / Parcial / Sí. pe4 sale de p4 (a medias), pe5 y pe6 de p5 y p6.
const L_PED: Record<string, LineaInicial[]> = {
    pe1: [[0, 250], [2, 100], [6, 35]],
    pe2: [[3, 800], [4, 200]],
    pe3: [[5, 150], [1, 60]],
    pe4: L_PRE.p4.slice(0, 2),
    pe5: L_PRE.p5,
    pe6: L_PRE.p6,
};
const lineaPedido = (servida: (i: number) => number) => (i: number) => ({ por_lotes: false, servida: servida(i) });
const pedidos = new DocumentoDemo("ventas/pedido", [
    cabecera("pe1", codigo("PE", 41), "c2", -1, { fecha_salida: fecha(2), servido: "No" }),
    cabecera("pe2", codigo("PE", 40), "c4", -3, { fecha_salida: fecha(1), servido: "No", observaciones: "Palés retractilados." }),
    cabecera("pe3", codigo("PE", 39), "c3", -5, { fecha_salida: fecha(0), servido: "No" }),
    cabecera("pe4", codigo("PE", 36), "c4", -12, { fecha_salida: fecha(-6), servido: "Parcial" }),
    cabecera("pe5", codigo("PE", 33), "c1", -20, { fecha_salida: fecha(-17), servido: "Sí" }),
    cabecera("pe6", codigo("PE", 34), "c2", -18, { fecha_salida: fecha(-15), servido: "Sí" }),
], {
    pe1: lineasDe(L_PED.pe1, lineaPedido(() => 0)),
    pe2: lineasDe(L_PED.pe2, lineaPedido(() => 0)),
    pe3: lineasDe(L_PED.pe3, lineaPedido(() => 0)),
    pe4: lineasDe(L_PED.pe4, lineaPedido((i) => (i === 0 ? 360 : 0))),
    pe5: lineasDe(L_PED.pe5, lineaPedido((i) => L_PED.pe5[i][1])),
    pe6: lineasDe(L_PED.pe6, lineaPedido((i) => L_PED.pe6[i][1])),
}, {
    prefijo: "pe", precio: (a) => a.pvp, conDescuento: true, respuestaAlta: respuestaAltaVenta,
    extraLinea: () => ({ por_lotes: false, servida: 0, por_comision: 0, importe_comision: 0 }),
    alta: altaDocumento("PE", siguiente("ped"), { fecha_salida: fecha(2), servido: "No" }),
    cambiar: cambiarCabecera,
});

// Albaranes: a3 es la entrega parcial de pe4; a4 y a5 salen de pe5 y pe6 (ya facturados).
const L_ALB: Record<string, LineaInicial[]> = {
    a1: [[0, 180], [1, 90], [6, 27]],
    a2: [[3, 350], [5, 100]],
    a3: [[0, 360, 3]],
    a4: L_PED.pe5,
    a5: L_PED.pe6,
    a6: [[4, 120], [2, 80], [6, 20]],
};
const lineaAlbaran = () => ({ por_lotes: false, movimientos: [] });
const albaranes = new DocumentoDemo("ventas/albaran", [
    cabecera("a1", codigo("AL", 61), "c3", -1, { hora: "08:30:00", de_abono: false, facturado: false }),
    cabecera("a2", codigo("AL", 60), "c1", -2, { hora: "09:15:00", de_abono: false, facturado: false }),
    cabecera("a3", codigo("AL", 58), "c4", -7, { hora: "07:45:00", de_abono: false, facturado: false }),
    cabecera("a4", codigo("AL", 52), "c1", -17, { hora: "10:00:00", de_abono: false, facturado: true }),
    cabecera("a5", codigo("AL", 53), "c2", -15, { hora: "08:00:00", de_abono: false, facturado: true }),
    cabecera("a6", codigo("AL", 55), "c3", -10, { hora: "11:20:00", de_abono: false, facturado: true }),
], Object.fromEntries(Object.entries(L_ALB).map(([id, l]) => [id, lineasDe(l, lineaAlbaran)])), {
    prefijo: "a", precio: (a) => a.pvp, conDescuento: true, respuestaAlta: respuestaAltaVenta,
    extraLinea: () => ({ por_lotes: false, movimientos: [], por_comision: 0, importe_comision: 0 }),
    alta: altaDocumento("AL", siguiente("alb"), { hora: "09:00:00", de_abono: false, facturado: false }),
    cambiar: cambiarCabecera,
});

// Facturas: dos borradores y cuatro emitidas (f3, f4 y f5 vienen de albaranes).
const L_FAC: Record<string, LineaInicial[]> = {
    f1: [[3, 300], [4, 60], [6, 30]],
    f2: [[5, 200]],
    f3: L_ALB.a4,
    f4: L_ALB.a5,
    f5: L_ALB.a6,
    f6: [[0, 90], [1, 45], [2, 60]],
};
const facturaCabecera = (id: string, n: number, clienteId: string, dias: number, estado: string) =>
    cabecera(id, codigo("FV", n), clienteId, dias, {
        hora: "12:00:00", automatica: false, servicios: false, rectificativa_id: null,
        asiento_id: null, estado_expedicion: estado, editable: estado === "BORRADOR",
    });
const facturas = new DocumentoDemo("ventas/factura", [
    facturaCabecera("f1", 84, "c1", 0, "BORRADOR"),
    facturaCabecera("f2", 83, "c2", -1, "BORRADOR"),
    facturaCabecera("f3", 79, "c1", -16, "EMITIDA"),
    facturaCabecera("f4", 80, "c2", -14, "EMITIDA"),
    facturaCabecera("f5", 81, "c3", -9, "EMITIDA"),
    facturaCabecera("f6", 77, "c5", -21, "EMITIDA"),
], Object.fromEntries(Object.entries(L_FAC).map(([id, l]) => [id, lineasDe(l)])), {
    prefijo: "f", precio: (a) => a.pvp, conDescuento: true, respuestaAlta: respuestaAltaVenta,
    extraLinea: () => ({ por_comision: 0, importe_comision: 0 }),
    alta: altaDocumento("FV", siguiente("fac"), {
        hora: "12:00:00", automatica: false, servicios: false, rectificativa_id: null, asiento_id: null,
        estado_expedicion: "BORRADOR", editable: true,
    }),
    cambiar: cambiarCabecera,
});

// ─── Paso entre documentos y traza ────────────────────────────────────────────

/** Enlaces origen → destino para la traza ("tipo:id"). */
const ENLACES: [string, string][] = [
    ["presupuesto_venta:p4", "pedido_venta:pe4"], ["presupuesto_venta:p5", "pedido_venta:pe5"],
    ["presupuesto_venta:p6", "pedido_venta:pe6"], ["pedido_venta:pe4", "albaran_venta:a3"],
    ["pedido_venta:pe5", "albaran_venta:a4"], ["pedido_venta:pe6", "albaran_venta:a5"],
    ["albaran_venta:a4", "factura_venta:f3"], ["albaran_venta:a5", "factura_venta:f4"],
    ["albaran_venta:a6", "factura_venta:f5"],
];

const copiarLineas = (origen: Fila[], cantidad: (l: Fila) => number = (l) => Number(l.cantidad)) =>
    origen.filter((l) => cantidad(l) > 0).map((l) => ({
        referencia: l.referencia, descripcion: l.descripcion, descripcion_articulo: l.descripcion_articulo,
        cantidad: cantidad(l), pvp_unitario: l.pvp_unitario, dto_porcentual: l.dto_porcentual, dto_lineal: l.dto_lineal,
        grupo_iva_producto_id: l.grupo_iva_producto_id,
    }));

/** Crea un documento destino copiando cabecera de cliente y las líneas indicadas. */
const derivar = (destino: DocumentoDemo, origen: Fila, lineas: Cuerpo[], extra: Cuerpo) => {
    const id = nuevoId(destino.doc.prefijo);
    const nuevo = destino.crear({ cliente: { cliente_id: origen.cliente_id, direccion_id: origen.direccion_id } }, id);
    destino.guardar({ ...nuevo, por_descuento: origen.por_descuento ?? 0, ...extra });
    destino.anadir(id, lineas);
    return destino.buscar(id)!;
};

const TIPOS_TRAZA: Record<string, DocumentoDemo> = {
    presupuesto_venta: presupuestos, pedido_venta: pedidos, albaran_venta: albaranes, factura_venta: facturas,
};

/** Traza: el grafo de documentos enlazados con el pedido (`GET <doc>/<id>/traza`). */
export const grafoTraza = (raiz: string, enlaces: [string, string][], tipos: Record<string, RecursoDemo>, extraDatos: (f: Fila) => Cuerpo) => {
    const claves = new Set([raiz]);
    for (let cambio = true; cambio;) {
        cambio = false;
        for (const [a, b] of enlaces) {
            if (claves.has(a) !== claves.has(b)) { claves.add(a); claves.add(b); cambio = true; }
        }
    }
    const nodos = [...claves].map((clave) => {
        const [tipo, id] = clave.split(":");
        const recurso = tipos[tipo];
        const fila = recurso?.buscar(id);
        const leida = fila ? recurso.leer(fila) : null;
        return {
            clave,
            datos: leida
                ? { tipo, id, codigo: leida.codigo, visible: true, fecha: leida.fecha, total: leida.total, divisa_id: "EUR", ...extraDatos(leida) }
                : { tipo, id, codigo: id, visible: false, fecha: null },
        };
    });
    return { raiz, nodos, aristas: enlaces.filter(([a, b]) => claves.has(a) && claves.has(b)).map(([desde, hasta]) => ({ desde, hasta })) };
};

const fijaTraza = (tipo: string, recurso: RecursoDemo): RespuestaFija => ({
    metodo: "GET", ruta: new RegExp(`^${escapar(recurso.ruta)}/[^/]+/traza$`),
    cuerpo: ({ url }: Peticion) => ({
        datos: grafoTraza(`${tipo}:${tramos(url).at(-2)}`, ENLACES, TIPOS_TRAZA, (f) => ({
            cliente_id: f.cliente_id, nombre_cliente: f.nombre_cliente, estado_aprobado: f.estado_aprobado, servido: f.servido,
            estado: f.estado_expedicion ?? (f.facturado === undefined ? undefined : f.facturado ? "Facturado" : "Pendiente"),
        })),
    }),
});

const idDeAccion = (url: string) => tramos(url).at(-2) ?? "";

const acciones: RespuestaFija[] = [
    {
        // Aprobar presupuesto: genera un pedido con lo pendiente.
        metodo: "PATCH", ruta: /^ventas\/presupuesto\/[^/]+\/aprobar$/, cuerpo: ({ url }: Peticion) => {
            const pre = presupuestos.buscar(idDeAccion(url));
            if (!pre) return {};
            const lineas = presupuestos.lineasDe(pre.id);
            const pedido = derivar(pedidos, pre, copiarLineas(lineas, (l) => Number(l.cantidad) - Number(l.aprobada ?? 0)),
                { fecha: fecha(0), fecha_salida: fecha(3), servido: "No", agente_id: pre.agente_id, nombre_agente: pre.nombre_agente });
            lineas.forEach((l) => { l.aprobada = l.cantidad; l.cerrada = true; });
            presupuestos.guardar({ ...pre, estado_aprobado: "TOTAL" });
            ENLACES.push([`presupuesto_venta:${pre.id}`, `pedido_venta:${pedido.id}`]);
            return { pedido_id: pedido.id, codigo: pedido.codigo };
        },
    },
    {
        // Albaranar pedidos (desde el maestro): un albarán con lo pendiente de servir.
        metodo: "POST", ruta: "ventas/albaran/desde-pedidos", cuerpo: ({ cuerpo }: Peticion) => {
            const ids = ((cuerpo as Cuerpo)?.pedido_ids ?? []) as string[];
            const origen = ids.map((id) => pedidos.buscar(id)).filter((p): p is Fila => Boolean(p));
            if (origen.length === 0) return { albaran_id: "", codigo: "" };
            const lineas = origen.flatMap((p) => copiarLineas(pedidos.lineasDe(p.id), (l) => Number(l.cantidad) - Number(l.servida ?? 0)));
            const albaran = derivar(albaranes, origen[0], lineas, { fecha: fecha(0), facturado: false });
            origen.forEach((p) => {
                pedidos.lineasDe(p.id).forEach((l) => { l.servida = l.cantidad; });
                pedidos.guardar({ ...p, servido: "Sí" });
                ENLACES.push([`pedido_venta:${p.id}`, `albaran_venta:${albaran.id}`]);
            });
            return { albaran_id: albaran.id, codigo: albaran.codigo };
        },
    },
    {
        // Albaranar un pedido línea a línea (pantalla «Albaranar pedido»).
        metodo: "PATCH", ruta: /^ventas\/pedido\/[^/]+\/albaranar$/, cuerpo: ({ url, cuerpo }: Peticion) => {
            const pedido = pedidos.buscar(idDeAccion(url));
            if (!pedido) return { albaran_id: "", codigo: "" };
            const enviadas = new Map((((cuerpo as Cuerpo)?.lineas ?? []) as { id: string; cantidad: number }[]).map((l) => [l.id, Number(l.cantidad)]));
            const lineas = pedidos.lineasDe(pedido.id);
            const albaran = derivar(albaranes, pedido, copiarLineas(lineas, (l) => enviadas.get(l.id) ?? 0), { fecha: fecha(0), facturado: false });
            lineas.forEach((l) => { l.servida = Number(l.servida ?? 0) + (enviadas.get(l.id) ?? 0); });
            const completo = lineas.every((l) => Number(l.servida) >= Number(l.cantidad));
            pedidos.guardar({ ...pedido, servido: completo ? "Sí" : "Parcial" });
            ENLACES.push([`pedido_venta:${pedido.id}`, `albaran_venta:${albaran.id}`]);
            return { albaran_id: albaran.id, codigo: albaran.codigo };
        },
    },
    {
        // Facturar albarán.
        metodo: "PATCH", ruta: /^ventas\/albaran\/[^/]+\/facturar$/, cuerpo: ({ url }: Peticion) => {
            const albaran = albaranes.buscar(idDeAccion(url));
            if (!albaran) return { factura_id: "", codigo: "" };
            const factura = derivar(facturas, albaran, copiarLineas(albaranes.lineasDe(albaran.id)), { fecha: fecha(0) });
            albaranes.guardar({ ...albaran, facturado: true });
            ENLACES.push([`albaran_venta:${albaran.id}`, `factura_venta:${factura.id}`]);
            return { factura_id: factura.id, codigo: factura.codigo };
        },
    },
    {
        metodo: "PATCH", ruta: /^ventas\/factura\/[^/]+\/emitir$/, cuerpo: ({ url }: Peticion) => {
            const factura = facturas.buscar(idDeAccion(url));
            if (factura) facturas.guardar({ ...factura, estado_expedicion: "EMITIDA", editable: false });
            return {};
        },
    },
    {
        // Recibos de cobro de la factura: uno por factura emitida (las más antiguas, ya cobradas).
        metodo: "GET", ruta: /^tesoreria\/recibo_cobro\/por_factura\/[^/]+$/, cuerpo: ({ url }: Peticion) => {
            const factura = facturas.buscar(tramos(url).at(-1) ?? "");
            if (!factura || factura.estado_expedicion === "BORRADOR") return { datos: [] };
            const leida = facturas.leer(factura);
            return {
                datos: [{
                    id: `r${factura.id}`, factura_id: factura.id, codigo: `${factura.codigo}-1`, fecha_emision: factura.fecha,
                    fecha_vencimiento: fecha(Math.round((Date.parse(String(factura.fecha)) - Date.now()) / 864e5) + 30),
                    estado: String(factura.fecha) < fecha(-15) ? "Pagado" : "Emitido", importe: leida.total,
                    cliente_id: factura.cliente_id, id_fiscal: factura.id_fiscal,
                }],
            };
        },
    },
    // Órdenes de almacén en preparación de un pedido: ninguna en la demo.
    { metodo: "GET", ruta: /^almacen\/orden\/de_pedido_venta\/[^/]+$/, cuerpo: { datos: [] } },
    ...[["presupuesto_venta", presupuestos], ["pedido_venta", pedidos], ["albaran_venta", albaranes], ["factura_venta", facturas]]
        .map(([tipo, recurso]) => fijaTraza(tipo as string, recurso as RecursoDemo)),
];

// ─── Catálogos y selectores ───────────────────────────────────────────────────

/** Artículo de ventas (ficha y selector `/ventas/articulo/tags`). */
const articulosVenta = ARTICULOS.map((a) => ({
    id: a.id, descripcion: a.descripcion, precio: a.pvp, grupo_iva_producto_id: grupoIvaArticulo(a.id), barcode: a.codbarras,
    tipo_barcode: "EAN13", observaciones: null, familia_id: a.familia.toUpperCase(), descripcion_familia: a.familia,
    pvp_variable: a.familia !== "Envases", sin_stock: false, por_lotes: false,
}));

export const CACHE_COMUN = {
    "cache/comun/grupo_iva_negocio": [
        { id: "NACIONAL", descripcion: "Nacional" },
        { id: "UE", descripcion: "Unión Europea" },
        { id: "EXPORT", descripcion: "Exportación" },
    ],
    "cache/comun/grupo_iva_producto": GRUPOS_IVA_PRODUCTO.map(({ id, descripcion }) => ({ id, descripcion })),
    "cache/comun/divisa": [{ id: "EUR", descripcion: "Euro" }, { id: "USD", descripcion: "Dólar estadounidense" }],
    "cache/comun/formapago": FORMAS_PAGO,
    "cache/comun/serie": [{ id: "A", descripcion: "Serie A" }, { id: "R", descripcion: "Rectificativas" }],
    "cache/comun/almacen": ALMACENES.map((a) => ({ id: a.id, descripcion: a.nombre })),
    "cache/comun/tipo_id_fiscal": [{ id: "39", descripcion: "NIF" }, { id: "02", descripcion: "NIF-IVA" }, { id: "03", descripcion: "Pasaporte" }],
    "cache/comun/pais": [{ id: "ES", descripcion: "España" }, { id: "PT", descripcion: "Portugal" }, { id: "FR", descripcion: "Francia" }],
};

/** Configuración de almacén que consultan los modales de alta de línea. */
export const CONFIG_ALMACEN: RespuestaFija = {
    metodo: "GET", ruta: "almacen/config", cuerpo: { datos: { impuesto_id: "GENERAL", usar_iva_defecto: false } },
};

export const demo: DemoModulo = {
    pantallas: [
        { nombre: "Presupuestos", ruta: "/ventas/presupuesto" },
        { nombre: "Pedidos", ruta: "/ventas/pedido" },
        { nombre: "Albaranes", ruta: "/ventas/albaran" },
        { nombre: "Facturas", ruta: "/ventas/factura" },
        { nombre: "Clientes", ruta: "/ventas/cliente" },
    ],
    guia: "Abre un presupuesto, añade una línea y apruébalo para generar el pedido; luego hazle el albarán y la factura.",
    colecciones: {
        "ventas/articulo": articulosVenta,
        "ventas/agente": AGENTES.map((a) => ({
            ...a, nombre_pila: a.nombre.split(" ")[0], apellidos: a.nombre.split(" ").slice(1).join(" "), id_fiscal: "",
            por_comision: 3, telefono: null, email: null, direccion: null, ciudad: "Almería", codpostal: "04001",
            provincia: "Almería", usuario_id: null,
        })),
        "ventas/contacto": Object.values(CONTACTOS).flat(),
        "crm/contacto": Object.values(CONTACTOS).flat(),
        "almacen/almacen": ALMACENES,
        ...CACHE_COMUN,
        ...subrecursosCliente,
    },
    fijas: [
        ...acciones,
        CONFIG_ALMACEN,
        {
            metodo: "GET", ruta: "ventas/config", cuerpo: {
                datos: {
                    mostrar_observaciones_cliente: true, facturar_albaranes_borrador: "No", crear_facturas_borrador: "No",
                    correo_copias: null, no_disponibles: [],
                },
            },
        },
        { metodo: "GET", ruta: "ventas/articulo/tags", cuerpo: ({ url }: Peticion) => listar(articulosVenta, url) },
        ...presupuestos.fijas(),
        ...pedidos.fijas(),
        ...albaranes.fijas(),
        ...facturas.fijas(),
        ...clientes.fijas(),
        ...fijaAgregados({
            "ventas.presupuesto": presupuestos, "ventas.pedido": pedidos, "ventas.albaran": albaranes,
            "ventas.factura": facturas, "ventas.cliente": clientes,
        }),
        // Marcar dirección de envío o facturación: se da por hecho.
        { metodo: "PATCH", ruta: /^ventas\/cliente\/[^/]+\/direccion\/[^/]+\/(envio|facturacion)$/, cuerpo: {} },
    ],
};
