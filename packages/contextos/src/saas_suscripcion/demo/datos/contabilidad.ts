import { DemoModulo } from "../diseño.ts";
import { CLIENTES, fecha, PROVEEDORES } from "./comun.ts";

/** Ejercicio en curso: es el que las pantallas toman por defecto. */
const EJERCICIO = String(new Date().getFullYear());

const subcuenta = (id: number, codigo: string, nombre: string, especial: string | null = null, iva = 0) => ({
    id: String(id), codigo, nombre, ejercicio_id: EJERCICIO, cuenta_id: Number(codigo.slice(0, 3)),
    codigo_cuenta: codigo.slice(0, 3), impuesto_id: iva ? `IVA${iva}` : null, iva, recargo: 0,
    cuenta_especial_id: especial, es_iva: especial === "IVAREP" || especial === "IVASOP",
});

const SUBCUENTAS = [
    subcuenta(1, "4000000001", PROVEEDORES[0].nombre, "PROVEE"),
    subcuenta(2, "4100000003", PROVEEDORES[2].nombre, "ACREED"),
    subcuenta(3, "4300000001", CLIENTES[0].nombre, "CLIENT"),
    subcuenta(4, "4300000002", CLIENTES[1].nombre, "CLIENT"),
    subcuenta(5, "4650000000", "Remuneraciones pendientes de pago"),
    subcuenta(6, "4720000004", "H.P. IVA soportado 4%", "IVASOP", 4),
    subcuenta(7, "4720000021", "H.P. IVA soportado 21%", "IVASOP", 21),
    subcuenta(8, "4770000004", "H.P. IVA repercutido 4%", "IVAREP", 4),
    subcuenta(9, "5720000001", "Banco, cuenta principal"),
    subcuenta(10, "6000000000", "Compras de mercaderías"),
    subcuenta(11, "6240000000", "Transportes"),
    subcuenta(12, "6400000000", "Sueldos y salarios"),
    subcuenta(13, "7000000000", "Ventas de mercaderías"),
];

const porCodigo = (codigo: string) => {
    const sc = SUBCUENTAS.find((s) => s.codigo === codigo);
    if (!sc) throw new Error(`Subcuenta de la demo sin definir: ${codigo}`);
    return sc;
};

/** [código de subcuenta, debe, haber] */
type Linea = [codigo: string, debe: number, haber: number];

let siguientePartida = 1;

/** Asiento cuadrado: el importe es la suma del debe (igual a la del haber). */
const asiento = (id: number, dias: number, concepto: string, lineas: Linea[], manual: boolean,
    tipoDocumento: string | null = null, documento: string | null = null) => {
    const debe = lineas.reduce((t, [, d]) => t + d, 0);
    const haber = lineas.reduce((t, [, , h]) => t + h, 0);
    if (Math.abs(debe - haber) > 0.001) throw new Error(`Asiento de la demo descuadrado: ${id}`);
    return {
        id: String(id), numero: id, ejercicio_id: EJERCICIO, fecha: fecha(dias), concepto,
        importe: Math.round(debe * 100) / 100, manual, tipo_documento: tipoDocumento, documento,
        partidas: lineas.map(([codigo, d, h]) => {
            const sc = porCodigo(codigo);
            return {
                id: siguientePartida++, asiento_id: id, subcuenta_id: Number(sc.id), codigo_subcuenta: sc.codigo,
                debe: d, haber: h, concepto, es_iva: sc.es_iva, base_imponible: sc.es_iva ? Math.round((d + h) / sc.iva * 10000) / 100 : null,
                iva: sc.es_iva ? sc.iva : null, recargo: sc.es_iva ? 0 : null, grupo_iva_producto_id: null,
                grupo_iva_negocio_id: null, contrapartida_id: null, casilla303: null, divisa_id: null,
                tasa_conversion: 1, debe_me: 0, haber_me: 0,
            };
        }),
    };
};

const ASIENTOS = [
    asiento(1, -28, "Nuestra factura FV0000041 - Frutas Martín", [
        ["4300000001", 1560, 0], ["7000000000", 0, 1500], ["4770000004", 0, 60],
    ], false, "Factura de cliente", "FV0000041"),
    asiento(2, -26, "Nuestra factura FV0000042 - Supermercados La Huerta", [
        ["4300000002", 2964, 0], ["7000000000", 0, 2850], ["4770000004", 0, 114],
    ], false, "Factura de cliente", "FV0000042"),
    asiento(3, -22, "Su factura FR0000118 - Semillas del Levante", [
        ["6000000000", 980, 0], ["4720000004", 39.2, 0], ["4000000001", 0, 1019.2],
    ], false, "Factura de proveedor", "FR0000118"),
    asiento(4, -18, "Su factura FR0000120 - Transportes Rápidos del Sur", [
        ["6240000000", 350, 0], ["4720000021", 73.5, 0], ["4100000003", 0, 423.5],
    ], false, "Factura de proveedor", "FR0000120"),
    asiento(5, -12, "Cobro recibo FV0000041-01", [
        ["5720000001", 1560, 0], ["4300000001", 0, 1560],
    ], false, "Recibo de cliente", "FV0000041-01"),
    asiento(6, -9, "Pago recibo FR0000118-01", [
        ["4000000001", 1019.2, 0], ["5720000001", 0, 1019.2],
    ], false, "Recibo de proveedor", "FR0000118-01"),
    asiento(7, -6, "Nóminas del mes", [
        ["6400000000", 4200, 0], ["4650000000", 0, 4200],
    ], true),
    asiento(8, -2, "Pago de nóminas", [
        ["4650000000", 4200, 0], ["5720000001", 0, 4200],
    ], true),
];

/** Saldo de apertura de las subcuentas (asiento de apertura no incluido en la demo). */
const SALDO_INICIAL: Record<string, number> = { "5720000001": 25000 };

const libroMayor = (id: number, descripcion: string, desde: string | null, hasta: string | null) => ({
    id: String(id), descripcion, ejercicio_id: EJERCICIO, fecha_desde: null, fecha_hasta: null,
    subcuentas: { todas: desde === null, desde, hasta }, saldo_inicial: true, excluir_partidas_cero: false,
    orden: { criterio: "Fecha", sentido: "Ascendente" },
});

const LIBROS_MAYOR = [
    libroMayor(1, "Mayor del banco", "5720000001", "5720000001"),
    libroMayor(2, "Clientes", "4300000000", "4309999999"),
    libroMayor(3, "Mayor completo", null, null),
];

const redondeo = (n: number) => Math.round(n * 100) / 100;

/** El libro mayor de las subcuentas del rango, calculado con las partidas de los asientos. */
const resultadoMayor = (id: string) => {
    const informe = LIBROS_MAYOR.find((l) => l.id === id) ?? LIBROS_MAYOR[2];
    const { todas, desde, hasta } = informe.subcuentas;
    const bloques = SUBCUENTAS
        .filter((sc) => todas || (sc.codigo >= (desde ?? "") && sc.codigo <= (hasta ?? "")))
        .map((sc) => {
            const inicial = SALDO_INICIAL[sc.codigo] ?? 0;
            let saldo = inicial;
            const lineas = ASIENTOS.flatMap((a) => a.partidas
                .filter((p) => p.codigo_subcuenta === sc.codigo)
                .map((p) => {
                    saldo = redondeo(saldo + p.debe - p.haber);
                    return {
                        partida_id: p.id, asiento_id: a.numero, asiento_numero: a.numero, fecha: a.fecha,
                        concepto: p.concepto, debe: p.debe, haber: p.haber, saldo,
                    };
                }));
            const cabecera = {
                subcuenta_id: Number(sc.id), codigo_subcuenta: sc.codigo, descripcion_subcuenta: sc.nombre,
                saldo_inicial: inicial, saldo_final: saldo,
            };
            return {
                cabecera, lineas, total: lineas.length,
                total_debe: redondeo(lineas.reduce((t, l) => t + l.debe, 0)),
                total_haber: redondeo(lineas.reduce((t, l) => t + l.haber, 0)),
            };
        })
        .filter((b) => b.lineas.length > 0);
    return { datos: { cabecera: bloques[0].cabecera, lineas: bloques[0].lineas, total: bloques[0].total, subcuentas: bloques } };
};

const cuentasAnuales = (id: number, descripcion: string, tipo: string, formato: string) => ({
    id: String(id), descripcion, tipo, formato, nivel_desglose: "No desglosar",
    periodo: { ejercicio_id: EJERCICIO, fecha_desde: null, fecha_hasta: null },
    periodo_anterior: { ejercicio_id: String(Number(EJERCICIO) - 1), fecha_desde: null, fecha_hasta: null },
    omitir_epigrafes_sin_saldo: true,
});

const CUENTAS_ANUALES = [
    cuentasAnuales(1, "Balance de situación", "Situacion", "Abreviado"),
    cuentasAnuales(2, "Cuenta de pérdidas y ganancias", "Perdidas y ganancias", "Abreviado"),
];

type Fila = [tipo: "cabecera" | "detalle" | "subtotal" | "total", nivel: number, concepto: string,
    actual: number | null, anterior: number | null];

const filas = (lista: Fila[]) => lista.map(([tipo, nivel, concepto, actual, anterior]) => ({
    tipo, nivel, concepto, saldo_actual: actual, saldo_anterior: anterior,
}));

/** Balance abreviado cuadrado: activo = patrimonio neto + pasivo (actual y anterior). */
const BALANCE = filas([
    ["cabecera", 0, "A) ACTIVO NO CORRIENTE", 186400, 194250],
    ["detalle", 1, "II. Inmovilizado material", 186400, 194250],
    ["cabecera", 0, "B) ACTIVO CORRIENTE", 98620.5, 87310.2],
    ["detalle", 1, "II. Existencias", 21480, 18900],
    ["detalle", 1, "III. Deudores comerciales y otras cuentas a cobrar", 52221.75, 47610.4],
    ["detalle", 1, "VI. Efectivo y otros activos líquidos equivalentes", 24918.75, 20799.8],
    ["total", 0, "TOTAL ACTIVO (A + B)", 285020.5, 281560.2],
    ["cabecera", 0, "A) PATRIMONIO NETO", 171340.3, 152870.6],
    ["detalle", 1, "I. Capital", 60000, 60000],
    ["detalle", 1, "III. Reservas", 92870.6, 74512.1],
    ["detalle", 1, "VII. Resultado del ejercicio", 18469.7, 18358.5],
    ["cabecera", 0, "B) PASIVO NO CORRIENTE", 64200, 78400],
    ["detalle", 1, "II. Deudas a largo plazo", 64200, 78400],
    ["cabecera", 0, "C) PASIVO CORRIENTE", 49480.2, 50289.6],
    ["detalle", 1, "III. Deudas a corto plazo", 14200, 14200],
    ["detalle", 1, "V. Acreedores comerciales y otras cuentas a pagar", 35280.2, 36089.6],
    ["total", 0, "TOTAL PATRIMONIO NETO Y PASIVO (A + B + C)", 285020.5, 281560.2],
]);

/** PyG abreviada: el resultado coincide con el «Resultado del ejercicio» del balance. */
const PERDIDAS_Y_GANANCIAS = filas([
    ["detalle", 1, "1. Importe neto de la cifra de negocios", 612480, 586300],
    ["detalle", 1, "4. Aprovisionamientos", -398112, -381095],
    ["detalle", 1, "6. Gastos de personal", -126400, -119800],
    ["detalle", 1, "7. Otros gastos de explotación", -47210.4, -45120],
    ["detalle", 1, "8. Amortización del inmovilizado", -7850, -7850],
    ["subtotal", 0, "A) RESULTADO DE EXPLOTACIÓN", 32907.6, 32435],
    ["detalle", 1, "15. Gastos financieros", -8281, -7957],
    ["subtotal", 0, "B) RESULTADO FINANCIERO", -8281, -7957],
    ["subtotal", 0, "C) RESULTADO ANTES DE IMPUESTOS (A + B)", 24626.6, 24478],
    ["detalle", 1, "17. Impuestos sobre beneficios", -6156.9, -6119.5],
    ["total", 0, "D) RESULTADO DEL EJERCICIO (C + 17)", 18469.7, 18358.5],
]);

const balance = (url: string) => {
    const id = new URL(url, "http://demo").pathname.match(/cuentas_anuales\/([^/]+)\/balance/)?.[1];
    return {
        datos: {
            datos: [], total: 0, subtotales: [], totales_grupo: [], avisos_sin_codigo_balance: [],
            filas: id === "2" ? PERDIDAS_Y_GANANCIAS : BALANCE,
        },
    };
};

const ejercicio = (id: string, estado: string) => ({
    id, nombre: `Ejercicio ${id}`, empresa_id: 1, divisa_id: "EUR", fecha_inicio: `${id}-01-01`,
    fecha_fin: `${id}-12-31`, estado, digitos_subcuenta: 10, plan_contable: "PGC 2008", tiene_pgc: true,
    asiento_apertura_id: null, asiento_pyg_id: null, asiento_cierre_id: null,
});

export const demo: DemoModulo = {
    pantallas: [
        { nombre: "Asientos", ruta: "/contabilidad/asiento" },
        { nombre: "Libro mayor", ruta: "/contabilidad/libro_mayor" },
        { nombre: "Cuentas anuales", ruta: "/contabilidad/cuentas_anuales" },
    ],
    guia: "Abre un asiento para ver sus partidas, calcula el libro mayor del banco o el balance de situación.",
    colecciones: {
        "contabilidad/asiento": ASIENTOS,
        "contabilidad/subcuenta": SUBCUENTAS,
        "contabilidad/ejercicio": [ejercicio(EJERCICIO, "ABIERTO"), ejercicio(String(Number(EJERCICIO) - 1), "CERRADO")],
        "contabilidad/libro_mayor": LIBROS_MAYOR,
        "contabilidad/cuentas_anuales": CUENTAS_ANUALES,
        "comun/divisa": [
            { id: "EUR", descripcion: "Euro", tasa_conversion: 1, fecha: null, codigo_iso: "EUR", simbolo: "€", monedas_billetes: null, cifras_decimales: 2 },
            { id: "USD", descripcion: "Dólar estadounidense", tasa_conversion: 1.08, fecha: null, codigo_iso: "USD", simbolo: "$", monedas_billetes: null, cifras_decimales: 2 },
        ],
    },
    fijas: [
        {
            metodo: "GET",
            ruta: /^contabilidad\/libro_mayor\/[^/]+\/datos$/,
            cuerpo: ({ url }: { url: string }) =>
                resultadoMayor(new URL(url, "http://demo").pathname.match(/libro_mayor\/([^/]+)\/datos/)?.[1] ?? ""),
        },
        { metodo: "GET", ruta: /^contabilidad\/cuentas_anuales\/[^/]+\/balance$/, cuerpo: ({ url }: { url: string }) => balance(url) },
        {
            metodo: "GET",
            ruta: "contabilidad/ejercicio/actual",
            cuerpo: { datos: { ejercicio_id: EJERCICIO } },
        },
    ],
};
