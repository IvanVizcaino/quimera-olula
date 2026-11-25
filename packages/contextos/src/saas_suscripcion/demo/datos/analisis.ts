import { PeticionDemo, Registro, RespuestaFija } from "../api_demo.ts";
import { DemoModulo } from "../diseño.ts";
import { AGENTES, ALMACENES, ARTICULOS, CLIENTES, fecha, fechaHora, PROVEEDORES } from "./comun.ts";

/**
 * Demo de Análisis: un dashboard propio (cifras de /comun/agregado calculadas aquí para
 * la empresa ficticia), la lista de dashboards y el navegador del cubo de ventas
 * (/analisis/cubo/ventas/pivot). Todas las cifras salen de un mismo modelo: facturación
 * anual ~820.000 € con temporada alta en verano, crecimiento del 9 % anual y reparto fijo
 * por cliente, artículo, agente y provincia, así que cuadran entre componentes.
 */

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const HOY = new Date();
const AÑO = HOY.getFullYear();

const dos = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
const dia = (año: number, mes: number, d: number) => new Date(año, mes, d);
const masDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const redondear = (n: number, decimales = 2) => Math.round(n * 10 ** decimales) / 10 ** decimales;

/** Ruido determinista en [1 - amplitud, 1 + amplitud]: mismas cifras en cada carga. */
const ruido = (clave: string, amplitud = 0.15): number => {
    let h = 2166136261;
    for (let i = 0; i < clave.length; i++) {
        h ^= clave.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return 1 + amplitud * ((((h >>> 0) % 2001) / 1000) - 1);
};

/** Peso de cada mes (media 1): la fruta y la verdura se venden más en verano. */
const ESTACION = [0.84, 0.8, 0.93, 0.99, 1.09, 1.19, 1.25, 1.16, 1.02, 0.95, 0.88, 0.9];
const crecimiento = (año: number) => 1.09 ** (año - AÑO);

/** Peso del día de la semana (media ~1 en la semana): poco el sábado, nada el domingo. */
const PESO_SEMANA = [0.05, 1.25, 1.2, 1.2, 1.2, 1.25, 0.85];

// ---------------------------------------------------------------------------
// Recursos agregables (GET /comun/agregado)
// ---------------------------------------------------------------------------

type Dim = { id: string; descripcion: string; tipo: "texto" | "numero" | "fecha" | "booleano" };

type ModeloRecurso = {
    descripcion: string;
    ruta: string;
    /** Totales de un año completo por medida (o existencias, si no hay fecha). */
    anual: Record<string, number>;
    conteo: number;
    conFecha: boolean;
    medidas: { id: string; descripcion: string }[];
    dimensiones: Dim[];
};

const F: Dim = { id: "fecha", descripcion: "Fecha", tipo: "fecha" };
const texto = (id: string, descripcion: string): Dim => ({ id, descripcion, tipo: "texto" });
const DIM_CLIENTE = texto("cliente", "Cliente");
const DIM_AGENTE = texto("agente", "Agente");
const DIM_PROVINCIA = texto("provincia", "Provincia");
const DIM_COMUNIDAD = texto("comunidad", "Comunidad autónoma");

const RECURSOS: Record<string, ModeloRecurso> = {
    "ventas.factura": {
        descripcion: "Facturas de venta", ruta: "/ventas/factura",
        anual: { total: 824000, neto: 777000, total_iva: 47000 }, conteo: 1460, conFecha: true,
        medidas: [
            { id: "total", descripcion: "Total" }, { id: "neto", descripcion: "Neto" },
            { id: "total_iva", descripcion: "Total IVA" },
        ],
        dimensiones: [F, DIM_CLIENTE, DIM_AGENTE, DIM_PROVINCIA, DIM_COMUNIDAD,
            texto("forma_pago", "Forma de pago"), texto("codigo", "Factura"), texto("nombre_cliente", "Cliente")],
    },
    "ventas.factura.linea": {
        descripcion: "Líneas de factura de venta", ruta: "/ventas/factura",
        anual: { importe: 777000, cantidad: 512000 }, conteo: 6900, conFecha: true,
        medidas: [{ id: "importe", descripcion: "Importe" }, { id: "cantidad", descripcion: "Cantidad" }],
        dimensiones: [F, texto("articulo", "Artículo"), texto("familia", "Familia"), DIM_CLIENTE],
    },
    "ventas.pedido": {
        descripcion: "Pedidos de venta", ruta: "/ventas/pedido",
        anual: { total: 846000, neto: 798000 }, conteo: 1510, conFecha: true,
        medidas: [{ id: "total", descripcion: "Total" }, { id: "neto", descripcion: "Neto" }],
        dimensiones: [F, DIM_CLIENTE, DIM_AGENTE, texto("servido", "Servido"), texto("pedido", "Pedido"),
            texto("nombre_cliente", "Cliente")],
    },
    "ventas.presupuesto": {
        descripcion: "Presupuestos de venta", ruta: "/ventas/presupuesto",
        anual: { total: 1080000 }, conteo: 640, conFecha: true,
        medidas: [{ id: "total", descripcion: "Total" }],
        dimensiones: [F, DIM_CLIENTE, DIM_AGENTE],
    },
    "ventas.albaran": {
        descripcion: "Albaranes de venta", ruta: "/ventas/albaran",
        anual: { total: 838000 }, conteo: 1490, conFecha: true,
        medidas: [{ id: "total", descripcion: "Total" }],
        dimensiones: [F, DIM_CLIENTE, DIM_AGENTE],
    },
    "compras.factura": {
        descripcion: "Facturas de compra", ruta: "/compras/factura",
        anual: { total: 468000, neto: 431000 }, conteo: 390, conFecha: true,
        medidas: [{ id: "total", descripcion: "Total" }, { id: "neto", descripcion: "Neto" }],
        dimensiones: [F, texto("proveedor", "Proveedor")],
    },
    "almacen.stock": {
        descripcion: "Stock por almacén", ruta: "/almacen/stock",
        anual: { cantidad: 3740, reservada: 410, pendiente_recibir: 950, disponible: 3330 }, conteo: 14, conFecha: false,
        medidas: [
            { id: "cantidad", descripcion: "Cantidad" }, { id: "reservada", descripcion: "Reservada" },
            { id: "pendiente_recibir", descripcion: "Pendiente de recibir" }, { id: "disponible", descripcion: "Disponible" },
        ],
        dimensiones: [texto("almacen", "Almacén"), texto("familia", "Familia"), texto("articulo", "Artículo"),
            texto("descripcion_articulo", "Descripción")],
    },
};

const RECURSOS_API = Object.entries(RECURSOS).map(([id, r]) => ({
    id, descripcion: r.descripcion, ruta: r.ruta, medidas: r.medidas, dimensiones: r.dimensiones,
}));

// ---------------------------------------------------------------------------
// Periodos
// ---------------------------------------------------------------------------

type Rango = { desde: Date; hasta: Date };

const lunes = (d: Date) => masDias(d, -((d.getDay() + 6) % 7));

const rangoDe = (nombre: string | undefined): Rango => {
    const m = HOY.getMonth();
    const t = Math.floor(m / 3) * 3;
    switch (nombre) {
        case "hoy": return { desde: HOY, hasta: HOY };
        case "ayer": return { desde: masDias(HOY, -1), hasta: masDias(HOY, -1) };
        case "esta_semana": return { desde: lunes(HOY), hasta: HOY };
        case "semana_anterior": return { desde: masDias(lunes(HOY), -7), hasta: masDias(lunes(HOY), -1) };
        case "este_mes": return { desde: dia(AÑO, m, 1), hasta: HOY };
        case "mes_anterior": return { desde: dia(AÑO, m - 1, 1), hasta: dia(AÑO, m, 0) };
        case "este_trimestre": return { desde: dia(AÑO, t, 1), hasta: HOY };
        case "trimestre_anterior": return { desde: dia(AÑO, t - 3, 1), hasta: dia(AÑO, t, 0) };
        case "año_anterior": return { desde: dia(AÑO - 1, 0, 1), hasta: dia(AÑO - 1, 11, 31) };
        case "ultimos_7_dias": return { desde: masDias(HOY, -6), hasta: HOY };
        case "ultimos_30_dias": return { desde: masDias(HOY, -29), hasta: HOY };
        case "ultimos_90_dias": return { desde: masDias(HOY, -89), hasta: HOY };
        case "ultimos_12_meses": return { desde: dia(AÑO, m - 11, 1), hasta: HOY };
        default: return { desde: dia(AÑO, 0, 1), hasta: HOY };
    }
};

const desplazar = (r: Rango, comparar: string | null): Rango => {
    if (comparar === "periodo_anterior") {
        const dias = Math.round((r.hasta.getTime() - r.desde.getTime()) / 86400000) + 1;
        return { desde: masDias(r.desde, -dias), hasta: masDias(r.desde, -1) };
    }
    const atras = (d: Date) => new Date(d.getFullYear() - 1, d.getMonth(), d.getDate());
    return { desde: atras(r.desde), hasta: atras(r.hasta) };
};

const diasDe = (r: Rango): Date[] => {
    const dias: Date[] = [];
    for (let d = r.desde; d <= r.hasta; d = masDias(d, 1)) dias.push(d);
    return dias;
};

/** Parte de un año que cae en ese día (con temporada, día de la semana y ruido). */
const pesoDia = (recurso: string, d: Date) =>
    (ESTACION[d.getMonth()] * PESO_SEMANA[d.getDay()] * crecimiento(d.getFullYear()) * ruido(`${recurso}${iso(d)}`, 0.3)) / 365;

// ---------------------------------------------------------------------------
// Métricas
// ---------------------------------------------------------------------------

type Metrica = { alias: string; op: string; campo: string | undefined };

const leerMetricas = (metricas: string | null): Metrica[] =>
    (metricas ?? "").split(",").map((m) => m.trim()).filter(Boolean).map((m) => {
        const [op, campo] = m.split(":");
        return { alias: m.replace(":", "_"), op, campo };
    });

/** Sumas y conteo de un tramo, a partir de los que se derivan medias, máximos… */
type Acumulado = { sumas: Record<string, number>; conteo: number; dias: number };

const acumular = (recurso: string, modelo: ModeloRecurso, dias: Date[], factor: number): Acumulado => {
    if (!modelo.conFecha) return { sumas: { ...modelo.anual }, conteo: modelo.conteo, dias: 0 };
    const peso = dias.reduce((s, d) => s + pesoDia(recurso, d), 0) * factor;
    return {
        sumas: Object.fromEntries(Object.entries(modelo.anual).map(([k, v]) => [k, v * peso])),
        conteo: modelo.conteo * peso,
        dias: dias.length,
    };
};

const valorMetrica = (m: Metrica, a: Acumulado, modelo: ModeloRecurso, clave: string): number => {
    const suma = (campo: string | undefined) => a.sumas[campo ?? ""] ?? Object.values(a.sumas)[0] ?? 0;
    const media = (campo: string | undefined) => (a.conteo >= 1 ? suma(campo) / a.conteo : suma(campo));
    switch (m.op) {
        case "suma": return redondear(suma(m.campo));
        case "conteo": return Math.round(a.conteo);
        case "promedio": return redondear(media(m.campo) * ruido(`${clave}prom`, 0.08));
        case "maximo": return redondear(media(m.campo) * 4.6 * ruido(`${clave}max`, 0.1));
        case "minimo": return redondear(media(m.campo) * 0.07 * ruido(`${clave}min`, 0.1));
        case "conteo_distinto": {
            const universo = m.campo === "proveedor" ? PROVEEDORES.length : CLIENTES.length;
            const parte = modelo.conFecha ? Math.min(1, a.dias / 25) : 1;
            return Math.max(1, Math.round(universo * parte));
        }
        default: return 0;
    }
};

const metricasDe = (metricas: Metrica[], a: Acumulado, modelo: ModeloRecurso, clave: string) =>
    Object.fromEntries(metricas.map((m) => [m.alias, valorMetrica(m, a, modelo, clave)]));

// ---------------------------------------------------------------------------
// Categorías (agrupar por una dimensión que no es fecha)
// ---------------------------------------------------------------------------

type Categoria = { clave: string | boolean | null; nombre?: string; peso: number };

const PESOS_CLIENTE = [0.34, 0.27, 0.12, 0.19, 0.08];
const PESOS_ARTICULO = [0.22, 0.16, 0.11, 0.19, 0.08, 0.17, 0.07];

const CATEGORIAS: Record<string, Categoria[]> = {
    cliente: CLIENTES.map((c, i) => ({ clave: c.id, nombre: c.nombre, peso: PESOS_CLIENTE[i] })),
    articulo: ARTICULOS.map((a, i) => ({ clave: a.id, nombre: a.descripcion, peso: PESOS_ARTICULO[i] })),
    familia: [
        { clave: "Hortalizas", peso: 0.49 }, { clave: "Fruta", peso: 0.44 }, { clave: "Envases", peso: 0.07 },
    ],
    agente: [...AGENTES.map((a, i) => ({ clave: a.id, nombre: a.nombre, peso: [0.55, 0.37][i] })),
        { clave: null, peso: 0.08 }],
    proveedor: PROVEEDORES.map((p, i) => ({ clave: p.id, nombre: p.nombre, peso: [0.46, 0.31, 0.23][i] })),
    almacen: ALMACENES.map((a, i) => ({ clave: a.id, nombre: a.nombre, peso: [0.82, 0.18][i] })),
    provincia: [
        { clave: "04", peso: 0.31 }, { clave: "18", peso: 0.22 }, { clave: "03", peso: 0.17 },
        { clave: "11", peso: 0.13 }, { clave: "29", peso: 0.08 }, { clave: "41", peso: 0.06 }, { clave: "28", peso: 0.03 },
    ],
    comunidad: [{ clave: "01", peso: 0.8 }, { clave: "10", peso: 0.17 }, { clave: "13", peso: 0.03 }],
    servido: [{ clave: "Sí", peso: 0.76 }, { clave: "Parcial", peso: 0.07 }, { clave: "No", peso: 0.17 }],
    forma_pago: [
        { clave: "TRF30", nombre: "Transferencia a 30 días", peso: 0.52 },
        { clave: "REC60", nombre: "Recibo domiciliado a 60 días", peso: 0.33 },
        { clave: "CONT", nombre: "Contado", peso: 0.15 },
    ],
};

const categoriasDe = (dimension: string): Categoria[] =>
    CATEGORIAS[dimension] ?? [
        { clave: "Sí", peso: 0.62 }, { clave: "No", peso: 0.38 },
    ];

// ---------------------------------------------------------------------------
// Tramos de tiempo (agrupar por fecha:mes…)
// ---------------------------------------------------------------------------

const inicioTramo = (d: Date, granularidad: string): Date => {
    switch (granularidad) {
        case "dia": return d;
        case "semana": return lunes(d);
        case "trimestre": return dia(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
        case "año": return dia(d.getFullYear(), 0, 1);
        default: return dia(d.getFullYear(), d.getMonth(), 1);
    }
};

const tramos = (r: Rango, granularidad: string): { clave: string; dias: Date[] }[] => {
    const porClave = new Map<string, Date[]>();
    diasDe(r).forEach((d) => {
        const clave = iso(inicioTramo(d, granularidad));
        porClave.set(clave, [...(porClave.get(clave) ?? []), d]);
    });
    return [...porClave.entries()].map(([clave, dias]) => ({ clave, dias }));
};

// ---------------------------------------------------------------------------
// Tablas (columnas): filas inventadas según el nombre de cada columna
// ---------------------------------------------------------------------------

const PREFIJOS: Record<string, string> = {
    pedido: "PV", factura: "FV", albaran: "AV", presupuesto: "PR", recibo: "RC", codigo: "FV",
};

const valorColumna = (columna: string, recurso: string, i: number, ascendente: boolean): string | number | null => {
    const paso = ascendente ? i : -i;
    const cliente = CLIENTES[i % 4];
    const articulo = ARTICULOS[i % ARTICULOS.length];
    if (columna.includes("cliente")) return columna.startsWith("nombre") ? cliente.nombre : cliente.id;
    if (columna.includes("proveedor")) {
        const p = PROVEEDORES[i % PROVEEDORES.length];
        return columna.startsWith("nombre") ? p.nombre : p.id;
    }
    if (columna === "descripcion_articulo") return articulo.descripcion;
    if (columna === "articulo") return articulo.referencia;
    if (columna === "almacen") return ALMACENES[i % 2].id;
    if (columna === "fecha_vencimiento") return fecha(-24 + paso * 4);
    if (columna.startsWith("fecha")) return fecha(-12 + paso * 2);
    if (columna in PREFIJOS) return `${PREFIJOS[columna]}${String(AÑO).slice(2)}-${dos(40 + i)}${i + 3}`;
    if (columna === "disponible") return -((i * 7) % 15);
    if (columna === "pendiente_recibir") return 40 + ((i * 37) % 120);
    if (/total|importe|neto|pvp|coste/.test(columna)) return redondear(320 + 1850 * (ruido(`${recurso}${columna}${i}`, 0.9) - 0.1));
    if (/cantidad/.test(columna)) return Math.round(20 + 180 * ruido(`${columna}${i}`, 0.8));
    return null;
};

// ---------------------------------------------------------------------------
// Respuesta de GET /comun/agregado/<recurso>
// ---------------------------------------------------------------------------

type Grupo = Record<string, string | number | boolean | null>;

type Respuesta = {
    recurso: string;
    grupos: Grupo[];
    total_grupos: number;
    truncado: boolean;
    totales: Record<string, number | null>;
    periodo?: { desde: string; hasta: string };
    comparacion?: Respuesta;
};

const calcular = (recursoId: string, params: URLSearchParams, rango: Rango | null): Respuesta => {
    const modelo = RECURSOS[recursoId] ?? RECURSOS["ventas.factura"];
    const limite = Number(params.get("limite") ?? 0) || 10;
    const columnas = (params.get("columnas") ?? "").split(",").filter(Boolean);
    const filtrado = (params.get("filtros") ?? "").length > 2;
    // Con filtros (pendientes de servir, recibos sin cobrar…) solo cuenta una parte pequeña.
    const factor = filtrado ? 0.045 : 1;
    const dias = rango ? diasDe(rango) : [];
    const periodo = rango ? { desde: iso(rango.desde), hasta: iso(rango.hasta) } : undefined;

    if (columnas.length > 0) {
        const ascendente = !(params.get("orden") ?? "").endsWith(":desc");
        const grupos = Array.from({ length: Math.min(limite, 8) }, (_, i) =>
            Object.fromEntries(columnas.map((c) => [c, valorColumna(c, recursoId, i, ascendente)])));
        return { recurso: recursoId, grupos, total_grupos: grupos.length, truncado: false, totales: {}, periodo };
    }

    const metricas = leerMetricas(params.get("metricas"));
    const total = acumular(recursoId, modelo, dias, factor);
    const totales = metricasDe(metricas, total, modelo, `${recursoId}total`);
    const [dimension, granularidad] = (params.get("agrupar") ?? "").split(",")[0].split(":");

    if (!dimension) {
        return { recurso: recursoId, grupos: [], total_grupos: 0, truncado: false, totales, periodo };
    }

    if (granularidad && rango) {
        const grupos = tramos(rango, granularidad).map(({ clave, dias: diasTramo }) => ({
            [dimension]: clave,
            ...metricasDe(metricas, acumular(recursoId, modelo, diasTramo, factor), modelo, `${recursoId}${clave}`),
        }));
        return { recurso: recursoId, grupos, total_grupos: grupos.length, truncado: false, totales, periodo };
    }

    const parte = (a: Acumulado, peso: number, clave: string): Acumulado => {
        const r = ruido(`${recursoId}${clave}`, 0.06);
        return {
            sumas: Object.fromEntries(Object.entries(a.sumas).map(([k, v]) => [k, v * peso * r])),
            conteo: a.conteo * peso * r,
            // Para los clientes distintos de cada grupo (mapa): pocos por provincia.
            dias: a.dias * peso * 0.12,
        };
    };
    const [primera] = metricas;
    const ordenadas = categoriasDe(dimension)
        .map((c) => ({
            [dimension]: c.clave,
            ...(c.nombre ? { [`${dimension}_nombre`]: c.nombre } : {}),
            ...metricasDe(metricas, parte(total, c.peso, String(c.clave)), modelo, `${recursoId}${String(c.clave)}`),
        }))
        .sort((a, b) => Number(b[primera?.alias ?? ""] ?? 0) - Number(a[primera?.alias ?? ""] ?? 0));
    const grupos = ordenadas.slice(0, limite);
    return {
        recurso: recursoId, grupos, total_grupos: ordenadas.length, truncado: ordenadas.length > grupos.length,
        totales, periodo,
    };
};

const responderAgregado = ({ url }: { url: string }): Respuesta => {
    const recursoId = decodeURIComponent(/comun\/agregado\/([^/?]+)/.exec(url)?.[1] ?? "ventas.factura");
    const params = new URL(url, "http://demo").searchParams;
    const modelo = RECURSOS[recursoId] ?? RECURSOS["ventas.factura"];
    const [, rangoNombre] = (params.get("periodo") ?? "").split(":");
    const filtrado = (params.get("filtros") ?? "").length > 2;
    const conTiempo = !!(params.get("agrupar") ?? "").split(":")[1];
    // Sin periodo: los pendientes miran el último mes; lo demás, el año en curso.
    const rango = !modelo.conFecha
        ? null
        : rangoNombre ? rangoDe(rangoNombre)
            : rangoDe(filtrado ? "ultimos_30_dias" : conTiempo ? "ultimos_12_meses" : "este_año");
    const respuesta = calcular(recursoId, params, rango);
    const comparar = params.get("comparar");
    if (comparar && rango) respuesta.comparacion = calcular(recursoId, params, desplazar(rango, comparar));
    return respuesta;
};

// ---------------------------------------------------------------------------
// Dashboards
// ---------------------------------------------------------------------------

type Consulta = Record<string, unknown> & { recurso: string };

const componente = (id: string, tipo: string, titulo: string, [x, y, w, h]: number[],
    consultas: Consulta[], opciones: Record<string, unknown> = {}) =>
    ({ id, tipo, titulo, x, y, w, h, consultas, opciones });

const PENDIENTES_SERVIR = [{ campo: "servido", operador: "in", valor: ["No", "Parcial"] }];

const COMPONENTES_COMERCIAL = [
    componente("facturado_mes", "tarjeta", "Facturado este mes", [0, 0, 3, 2], [{
        recurso: "ventas.factura", metricas: "suma:total", periodo: "fecha:este_mes", comparar: "año_anterior",
    }]),
    componente("factura_media", "tarjeta", "Factura media del año", [3, 0, 3, 2], [{
        recurso: "ventas.factura", metricas: "promedio:total", periodo: "fecha:este_año", comparar: "año_anterior",
    }]),
    componente("pedidos_pendientes", "tarjeta", "Pedidos pendientes de servir", [6, 0, 3, 2], [{
        recurso: "ventas.pedido", metricas: "conteo", filtros: PENDIENTES_SERVIR,
    }]),
    componente("objetivo_anual", "objetivo", "Objetivo de ventas del año", [9, 0, 3, 2], [{
        recurso: "ventas.factura", metricas: "suma:total", periodo: "fecha:este_año",
    }], { meta: 900000, formato: "moneda" }),
    componente("evolucion", "temporal", "Facturación mensual frente al año anterior", [0, 2, 8, 8], [{
        recurso: "ventas.factura", metricas: "suma:total", agrupar: "fecha:mes", periodo: "fecha:ultimos_12_meses",
        comparar: "año_anterior", limite: 100,
    }]),
    componente("por_familia", "circular", "Ventas del año por familia", [8, 2, 4, 8], [{
        recurso: "ventas.factura.linea", metricas: "suma:importe", agrupar: "familia", periodo: "fecha:este_año", limite: 20,
    }]),
    componente("top_clientes", "ranking", "Mejores clientes del año", [0, 10, 6, 8], [{
        recurso: "ventas.factura", metricas: "suma:total", agrupar: "cliente", periodo: "fecha:este_año", limite: 8,
    }]),
    componente("top_articulos", "ranking", "Artículos más vendidos del año", [6, 10, 6, 8], [{
        recurso: "ventas.factura.linea", metricas: "suma:importe", agrupar: "articulo", periodo: "fecha:este_año", limite: 8,
    }]),
    componente("por_agente", "barras", "Facturado por agente este trimestre", [0, 18, 4, 8], [{
        recurso: "ventas.factura", metricas: "suma:total", agrupar: "agente", periodo: "fecha:este_trimestre", limite: 10,
    }]),
    componente("ciclo_venta", "embudo", "Ciclo de venta del año", [4, 18, 4, 8],
        ["ventas.presupuesto", "ventas.pedido", "ventas.albaran", "ventas.factura"].map((recurso) => ({
            recurso, metricas: "suma:total", periodo: "fecha:este_año",
        })), { circuito: "ventas", formato: "moneda" }),
    componente("nota", "texto", "Cómo leer este cuadro", [8, 18, 4, 8], [],
        { texto: "Las tarjetas comparan con el mismo periodo del año pasado. Pulsa «Editar» para mover, añadir o quitar componentes." }),
    componente("pendientes_servir", "tabla", "Pedidos pendientes de servir", [0, 26, 12, 8], [{
        recurso: "ventas.pedido", columnas: "pedido,nombre_cliente,fecha,total", filtros: PENDIENTES_SERVIR,
        orden: "fecha:asc", limite: 8,
    }]),
    componente("mapa_ventas", "mapa", "Ventas y clientes del año por provincia", [0, 34, 12, 12], [{
        recurso: "ventas.factura", metricas: "suma:total,conteo_distinto:cliente", agrupar: "provincia",
        periodo: "fecha:este_año", limite: 100,
    }]),
];

const COMPONENTES_COMPRAS = [
    componente("compras_mes", "tarjeta", "Compras este mes", [0, 0, 4, 2], [{
        recurso: "compras.factura", metricas: "suma:total", periodo: "fecha:este_mes", comparar: "año_anterior",
    }]),
    componente("unidades", "tarjeta", "Unidades en stock", [4, 0, 4, 2], [{
        recurso: "almacen.stock", metricas: "suma:cantidad",
    }]),
    componente("pendiente_recibir", "tarjeta", "Pendiente de recibir", [8, 0, 4, 2], [{
        recurso: "almacen.stock", metricas: "suma:pendiente_recibir",
    }]),
    componente("compras_mensuales", "temporal", "Compras por mes", [0, 2, 8, 8], [{
        recurso: "compras.factura", metricas: "suma:total", agrupar: "fecha:mes", periodo: "fecha:ultimos_12_meses",
        comparar: "año_anterior", limite: 100,
    }]),
    componente("por_almacen", "circular", "Stock por almacén", [8, 2, 4, 8], [{
        recurso: "almacen.stock", metricas: "suma:cantidad", agrupar: "almacen", limite: 20,
    }]),
    componente("proveedores", "ranking", "Principales proveedores del año", [0, 10, 6, 8], [{
        recurso: "compras.factura", metricas: "suma:total", agrupar: "proveedor", periodo: "fecha:este_año", limite: 8,
    }]),
    componente("sin_disponible", "tabla", "Artículos con poco disponible", [6, 10, 6, 8], [{
        recurso: "almacen.stock", columnas: "articulo,descripcion_articulo,almacen,disponible,pendiente_recibir",
        orden: "disponible:asc", limite: 6,
    }]),
];

const dashboard = (id: string, nombre: string, propietario: string, esPropio: boolean, compartido: boolean,
    actualizado: number, componentes: unknown[]): Registro => ({
    id, nombre, clave: null, compartido, propietario, es_propio: esPropio,
    actualizado_en: fechaHora(actualizado, "09:30:00"), componentes, componentes_ocultos: 0,
});

// ---------------------------------------------------------------------------
// Preguntar a la IA (respuestas fijas plausibles)
// ---------------------------------------------------------------------------

const proponerComponente = ({ cuerpo }: { url: string; cuerpo: unknown }) => {
    const pregunta = String((cuerpo as { pregunta?: string })?.pregunta ?? "").toLowerCase();
    if (/art[ií]culo|producto/.test(pregunta)) {
        return {
            tipo: "ranking", titulo: "Artículos más vendidos del año",
            consulta: { recurso: "ventas.factura.linea", metricas: "suma:importe", agrupar: "articulo", periodo: "fecha:este_año", limite: 8 },
            explicacion: "Sumo el importe de las líneas de factura de este año agrupado por artículo y muestro los 8 primeros.",
        };
    }
    if (/mes|evoluci|tendencia/.test(pregunta)) {
        return {
            tipo: "temporal", titulo: "Facturación mensual",
            consulta: { recurso: "ventas.factura", metricas: "suma:total", agrupar: "fecha:mes", periodo: "fecha:ultimos_12_meses", comparar: "año_anterior", limite: 100 },
            explicacion: "Total facturado mes a mes en los últimos 12 meses, comparado con el año anterior.",
        };
    }
    return {
        tipo: "ranking", titulo: "Mejores clientes del año",
        consulta: { recurso: "ventas.factura", metricas: "suma:total", agrupar: "cliente", periodo: "fecha:este_año", limite: 8 },
        explicacion: "Sumo el total de las facturas de venta de este año agrupado por cliente y ordeno de mayor a menor.",
    };
};

const proponerDashboard = () => ({
    nombre: "Resumen comercial",
    componentes: [
        { tipo: "tarjeta", titulo: "Facturado este mes", consulta: { recurso: "ventas.factura", metricas: "suma:total", periodo: "fecha:este_mes", comparar: "año_anterior" }, explicacion: "" },
        { tipo: "tarjeta", titulo: "Facturas este mes", consulta: { recurso: "ventas.factura", metricas: "conteo", periodo: "fecha:este_mes", comparar: "año_anterior" }, explicacion: "" },
        { tipo: "temporal", titulo: "Facturación mensual", consulta: { recurso: "ventas.factura", metricas: "suma:total", agrupar: "fecha:mes", periodo: "fecha:ultimos_12_meses", comparar: "año_anterior", limite: 100 }, explicacion: "" },
        { tipo: "ranking", titulo: "Mejores clientes", consulta: { recurso: "ventas.factura", metricas: "suma:total", agrupar: "cliente", periodo: "fecha:este_año", limite: 8 }, explicacion: "" },
    ],
});

// ---------------------------------------------------------------------------
// Cubo de ventas (navegador de análisis)
// ---------------------------------------------------------------------------

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const AÑOS_CUBO = [AÑO - 2, AÑO - 1, AÑO];

type Miembro = { codigo: string | number; etiqueta: string };

const MIEMBROS: Record<string, Miembro[]> = {
    "tiempo.ano": AÑOS_CUBO.map((a) => ({ codigo: a, etiqueta: String(a) })),
    "tiempo.trimestre": ["T1", "T2", "T3", "T4"].map((t) => ({ codigo: t, etiqueta: t })),
    "tiempo.mes": AÑOS_CUBO.flatMap((a) => MESES.map((m, i) => ({ codigo: `${a}${dos(i + 1)}`, etiqueta: m })))
        .filter((m) => String(m.codigo) <= `${AÑO}${dos(HOY.getMonth() + 1)}`),
    "cliente.cliente": CLIENTES.map((c) => ({ codigo: c.id, etiqueta: c.nombre })),
    "articulo.familia": ["Fruta", "Hortalizas", "Envases"].map((f) => ({ codigo: f, etiqueta: f })),
    "articulo.articulo": ARTICULOS.map((a) => ({ codigo: a.id, etiqueta: a.descripcion })),
    "agente.agente": AGENTES.map((a) => ({ codigo: a.id, etiqueta: a.nombre })),
};

const CUBO_VENTAS = {
    id: "ventas",
    descripcion: "Ventas",
    dimensiones: [
        {
            id: "tiempo", descripcion: "Tiempo",
            niveles: [
                { id: "ano", descripcion: "Año", tipo: "ano" },
                { id: "trimestre", descripcion: "Trimestre", tipo: "trimestre" },
                { id: "mes", descripcion: "Mes", tipo: "mes" },
            ],
            jerarquias: [{ id: "calendario", niveles: ["ano", "trimestre", "mes"] }],
        },
        {
            id: "cliente", descripcion: "Cliente",
            niveles: [{ id: "cliente", descripcion: "Cliente", tipo: null }], jerarquias: [],
        },
        {
            id: "articulo", descripcion: "Artículo",
            niveles: [
                { id: "familia", descripcion: "Familia", tipo: null },
                { id: "articulo", descripcion: "Artículo", tipo: null },
            ],
            jerarquias: [{ id: "familia_articulo", niveles: ["familia", "articulo"] }],
        },
        {
            id: "agente", descripcion: "Agente",
            niveles: [{ id: "agente", descripcion: "Agente", tipo: null }], jerarquias: [],
        },
    ],
    medidas: [
        { id: "importe", descripcion: "Importe", agregacion: "suma", formato: "moneda" },
        { id: "cantidad", descripcion: "Cantidad", agregacion: "suma", formato: "unidades" },
        { id: "margen", descripcion: "Margen", agregacion: "suma", formato: "moneda" },
    ],
    ultima_carga: { fecha: fechaHora(0, "06:00:00"), usuario_id: "demo" },
    estado_carga: {
        id: 41, estado: "ok", fecha: fechaHora(0, "06:00:00"), usuario_id: "demo",
        ejercicios: AÑOS_CUBO.map(String), mensaje: null,
    },
};

type Hecho = { niveles: Record<string, string | number>; importe: number; cantidad: number; margen: number };

/** Hechos del cubo: un registro por mes, cliente, artículo y agente. */
const HECHOS: Hecho[] = (() => {
    const hechos: Hecho[] = [];
    const lineas = RECURSOS["ventas.factura.linea"].anual.importe;
    MIEMBROS["tiempo.mes"].forEach(({ codigo }) => {
        const año = Number(String(codigo).slice(0, 4));
        const mes = Number(String(codigo).slice(4, 6)) - 1;
        const enCurso = año === AÑO && mes === HOY.getMonth();
        const fraccion = enCurso ? HOY.getDate() / new Date(año, mes + 1, 0).getDate() : 1;
        const totalMes = (lineas / 12) * ESTACION[mes] * crecimiento(año) * fraccion;
        CLIENTES.forEach((c, ic) => ARTICULOS.forEach((a, ia) => AGENTES.forEach((g, ig) => {
            const importe = totalMes * PESOS_CLIENTE[ic] * PESOS_ARTICULO[ia] * [0.6, 0.4][ig]
                * ruido(`${codigo}${c.id}${a.id}${g.id}`, 0.35);
            hechos.push({
                niveles: {
                    "tiempo.ano": año,
                    "tiempo.trimestre": `T${Math.floor(mes / 3) + 1}`,
                    "tiempo.mes": codigo,
                    "cliente.cliente": c.id,
                    "articulo.familia": a.familia,
                    "articulo.articulo": a.id,
                    "agente.agente": g.id,
                },
                importe,
                cantidad: importe / a.pvp,
                margen: importe * (1 - a.coste / a.pvp),
            });
        })));
    });
    return hechos;
})();

type PeticionPivot = {
    filas: string[];
    columnas: string[];
    medidas: string[];
    filtros: Record<string, (string | null)[]>;
    orden: { por: string; sentido: "asc" | "desc" } | null;
    top: number | null;
    excluir_ceros: boolean;
};

const miembro = (ref: string, codigo: string | number): Miembro =>
    MIEMBROS[ref]?.find((m) => String(m.codigo) === String(codigo)) ?? { codigo, etiqueta: String(codigo) };

const indiceMiembro = (ref: string, codigo: string | number) =>
    MIEMBROS[ref]?.findIndex((m) => String(m.codigo) === String(codigo)) ?? 0;

const pivot = ({ cuerpo }: { url: string; cuerpo: unknown }) => {
    const p = cuerpo as PeticionPivot;
    const filas = p.filas ?? [];
    const columnas = p.columnas ?? [];
    const medidas = p.medidas?.length ? p.medidas : ["importe"];
    const porMedida = p.orden?.por && medidas.includes(p.orden.por) ? p.orden.por : medidas[0];
    let hechos = HECHOS.filter((h) => Object.entries(p.filtros ?? {}).every(([ref, codigos]) =>
        codigos.length === 0 || codigos.map(String).includes(String(h.niveles[ref]))));

    const sumar = (lista: Hecho[]) => Object.fromEntries(medidas.map((m) =>
        [m, redondear(lista.reduce((s, h) => s + Number(h[m as keyof Omit<Hecho, "niveles">] ?? 0), 0))]));

    // Top N del primer nivel de filas, por la medida del orden.
    if (p.top && filas.length > 0) {
        const porMiembro = new Map<string, number>();
        hechos.forEach((h) => {
            const k = String(h.niveles[filas[0]]);
            porMiembro.set(k, (porMiembro.get(k) ?? 0) + Number(h[porMedida as keyof Omit<Hecho, "niveles">] ?? 0));
        });
        const mejores = new Set([...porMiembro.entries()].sort((a, b) => b[1] - a[1]).slice(0, p.top).map(([k]) => k));
        hechos = hechos.filter((h) => mejores.has(String(h.niveles[filas[0]])));
    }

    const datos: { filas: (Miembro | null)[]; columnas: (Miembro | null)[]; medidas: Record<string, number> }[] = [];
    for (let k = 0; k <= filas.length; k++) {
        for (let j = 0; j <= columnas.length; j++) {
            const refs = [...filas.slice(0, k), ...columnas.slice(0, j)];
            const grupos = new Map<string, Hecho[]>();
            hechos.forEach((h) => {
                const clave = JSON.stringify(refs.map((r) => h.niveles[r]));
                grupos.set(clave, [...(grupos.get(clave) ?? []), h]);
            });
            const bloque = [...grupos.entries()].map(([clave, lista]) => {
                const codigos = JSON.parse(clave) as (string | number)[];
                return {
                    filas: [...codigos.slice(0, k).map((c, i) => miembro(filas[i], c)), ...Array(filas.length - k).fill(null)],
                    columnas: [...codigos.slice(k).map((c, i) => miembro(columnas[i], c)), ...Array(columnas.length - j).fill(null)],
                    medidas: sumar(lista),
                };
            });
            bloque.sort((a, b) => {
                if (p.orden) {
                    const d = (a.medidas[porMedida] ?? 0) - (b.medidas[porMedida] ?? 0);
                    if (d !== 0) return p.orden.sentido === "desc" ? -d : d;
                }
                for (let i = 0; i < k; i++) {
                    const d = indiceMiembro(filas[i], a.filas[i]!.codigo) - indiceMiembro(filas[i], b.filas[i]!.codigo);
                    if (d !== 0) return d;
                }
                return 0;
            });
            datos.push(...bloque);
        }
    }
    return { datos, truncado: false };
};

const miembrosNivel = ({ url, cuerpo }: { url: string; cuerpo: unknown }) => {
    const ref = decodeURIComponent(/nivel\/([^/]+)\/miembro/.exec(url)?.[1] ?? "");
    const buscar = (new URL(url, "http://demo").searchParams.get("buscar")
        ?? (cuerpo as { buscar?: string } | null)?.buscar ?? "").toLowerCase();
    const todos = MIEMBROS[ref] ?? [];
    const datos = todos.filter((m) => m.etiqueta.toLowerCase().includes(buscar) || String(m.codigo).includes(buscar));
    const elegidos = ((cuerpo as { seleccionados?: string[] } | null)?.seleccionados ?? []).map(String);
    return { datos, hay_mas: false, seleccionados: todos.filter((m) => elegidos.includes(String(m.codigo))) };
};

const peticionVista = (filas: string[], columnas: string[], extra: Partial<PeticionPivot> = {}): PeticionPivot => ({
    filas, columnas, medidas: ["importe"], filtros: {}, orden: null, top: null, excluir_ceros: false, ...extra,
});

const vista = (id: string, nombre: string, dias: number, peticion: PeticionPivot) => ({
    id, nombre, cubo_id: "ventas", actualizado_en: fechaHora(-dias, "12:00:00"), peticion,
    presentacion: { medidasEnColumnas: true, verGrafico: false, tipoGrafico: "barras" },
});

// ---------------------------------------------------------------------------

const fijas: RespuestaFija[] = [
    { metodo: "GET", ruta: "comun/agregado", cuerpo: RECURSOS_API },
    { metodo: "GET", ruta: /^comun\/agregado\/[^/]+$/, cuerpo: responderAgregado },
    { metodo: "GET", ruta: "comun/ia-disponible", cuerpo: { disponible: true } },
    {
        // Alta (nuevo, duplicar, propuesta de la IA): el registro completo, como lo guarda el servidor.
        metodo: "POST", ruta: "comun/dashboard",
        cuerpo: ({ cuerpo, colecciones, nuevoId }: PeticionDemo) => {
            const nuevo = (cuerpo ?? {}) as { nombre?: string; compartido?: boolean; componentes?: unknown[] };
            const id = nuevoId();
            colecciones["comun/dashboard"].unshift(dashboard(id, nuevo.nombre || "Nuevo dashboard", "demo", true,
                nuevo.compartido ?? false, 0, nuevo.componentes ?? []));
            return { id };
        },
    },
    { metodo: "POST", ruta: "comun/dashboard/proponer", cuerpo: proponerComponente },
    { metodo: "POST", ruta: "comun/dashboard/proponer-dashboard", cuerpo: proponerDashboard },
    { metodo: "POST", ruta: /^analisis\/cubo\/[^/]+\/pivot$/, cuerpo: pivot },
    { metodo: "GET", ruta: /^analisis\/cubo\/[^/]+\/nivel\/[^/]+\/miembro$/, cuerpo: miembrosNivel },
    { metodo: "POST", ruta: /^analisis\/cubo\/[^/]+\/nivel\/[^/]+\/miembro$/, cuerpo: miembrosNivel },
    { metodo: "POST", ruta: /^analisis\/cubo\/[^/]+\/recarga$/, cuerpo: { id: "42" } },
];

export const demo: DemoModulo = {
    pantallas: [
        { nombre: "Cuadro de mando", ruta: "/comun/dashboard/d1" },
        { nombre: "Mis dashboards", ruta: "/comun/dashboard" },
        { nombre: "Navegador de ventas", ruta: "/analisis/navegador" },
    ],
    guia: "Edita el cuadro de mando, crea uno preguntando a la IA o cruza ventas por cliente, artículo y mes en el navegador.",
    colecciones: {
        "comun/dashboard": [
            dashboard("d1", "Dirección comercial", "demo", true, true, -1, COMPONENTES_COMERCIAL),
            dashboard("d2", "Compras y almacén", "Marta Sánchez", false, true, -6, COMPONENTES_COMPRAS),
        ],
        "analisis/cubo": [CUBO_VENTAS],
        "analisis/vista": [
            vista("v1", "Ventas por familia y año", 3, peticionVista(["articulo.familia", "articulo.articulo"], ["tiempo.ano"])),
            vista("v2", "Mejores clientes del año", 8, peticionVista(["cliente.cliente"], [], {
                medidas: ["importe", "margen"], filtros: { "tiempo.ano": [String(AÑO)] },
                orden: { por: "importe", sentido: "desc" },
            })),
            vista("v3", "Evolución mensual por agente", 15, peticionVista(["tiempo.mes"], ["agente.agente"], {
                filtros: { "tiempo.ano": [String(AÑO)] },
            })),
        ],
    },
    fijas,
};
