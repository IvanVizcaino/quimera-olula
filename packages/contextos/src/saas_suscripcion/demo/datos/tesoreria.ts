import { DemoModulo } from "../diseño.ts";
import { CLIENTES, fecha, fechaHora, PROVEEDORES } from "./comun.ts";

/** Cuentas bancarias de la empresa (IBAN de relleno). */
const cuentaBancaria = (id: string, descripcion: string, n: string, obsoleta = false) => ({
    id, codigo_cuenta: n, pais_id: "ES", obsoleta, empresa_id: "1", descripcion,
    iban: `ES000000000000000000${n}`, bic: "DEMOESXXXXX", entidad: "0000", agencia: "0000",
    digito_control: "00", cuenta: `000000${n}`,
});

const CUENTAS = [
    cuentaBancaria("CB1", "Cuenta principal", "0001"),
    cuentaBancaria("CB2", "Cuenta de remesas", "0002"),
    cuentaBancaria("CB3", "Cuenta antigua", "0003", true),
];

/** Cuenta de un tercero como la devuelve /<tercero>/<id>/cuenta_banco. */
const cuentaTercero = (id: string, descripcion: string, n: string) => [{
    id, cuenta: {
        descripcion, iban: `ES000000000000000000${n}`, bic: "DEMOESXXXXX", codigo_cuenta: n, pais_id: "ES",
        entidad: "0000", agencia: "0000", digito_control: "00", cuenta: `000000${n}`,
    },
}];

const pago = (id: string, dias: number, tipo = "Pago", cuenta = 0) => ({
    id, fecha: fecha(dias), tipo, estado: true, cuenta_pago_id: CUENTAS[cuenta].id,
    nombre_cuenta_pago: CUENTAS[cuenta].descripcion,
});

const reciboVenta = (id: string, codigo: string, cliente: number, importe: number, estado: string,
    emision: number, vencimiento: number, extra: Record<string, unknown> = {}) => ({
    id, codigo, factura_id: `F${codigo.slice(2, 9)}`, grupo_id: null, fecha_emision: fecha(emision),
    fecha_vencimiento: fecha(vencimiento), estado, importe, cliente_id: CLIENTES[cliente].id,
    nombre_cliente: CLIENTES[cliente].nombre, id_fiscal: CLIENTES[cliente].cif, divisa_id: "EUR",
    divisa_empresa_id: "EUR", cuenta_domiciliacion_id: cliente < 4 ? `cbc${cliente + 1}` : null,
    nombre_cuenta_domiciliacion: cliente < 4 ? "Cuenta del cliente" : "", pagos: [], recibos_agrupados: [],
    ...extra,
});

const agrupado1 = reciboVenta("rv8a", "FV0000031-01", 1, 412.6, "Agrupado", -20, 10, { grupo_id: "rv8" });
const agrupado2 = reciboVenta("rv8b", "FV0000034-01", 1, 655.4, "Agrupado", -15, 15, { grupo_id: "rv8" });

const RECIBOS_VENTA = [
    reciboVenta("rv1", "FV0000041-01", 0, 1560, "Emitido", -10, 20),
    reciboVenta("rv2", "FV0000042-01", 1, 2964, "Emitido", -8, 52),
    reciboVenta("rv3", "FV0000038-01", 2, 318.24, "Pagado", -25, -5, { pagos: [pago("pg1", -4)] }),
    reciboVenta("rv4", "FV0000035-01", 3, 4210.5, "Remesado", -30, 0),
    reciboVenta("rv5", "FV0000029-01", 0, 845.8, "Devuelto", -45, -15,
        { pagos: [pago("pg2", -15, "Pago", 1), pago("pg3", -12, "Devolución", 1)] }),
    reciboVenta("rv6", "FV0000043-01", 4, 96.3, "Emitido", -2, -2),
    reciboVenta("rv7", "FV0000043-02", 3, 1200, "Emitido", -2, 28),
    {
        ...reciboVenta("rv8", "GRC0000001", 1, 1068, "Emitido", -5, 25),
        factura_id: null, recibos_agrupados: [agrupado1, agrupado2],
    },
    agrupado1,
    agrupado2,
];

const reciboCompra = (id: string, codigo: string, proveedor: number, importe: number, estado: string,
    emision: number, vencimiento: number, pagos: ReturnType<typeof pago>[] = []) => ({
    id, codigo, factura_id: `FR${codigo.slice(2, 9)}`, fecha_emision: fecha(emision), fecha_vencimiento: fecha(vencimiento),
    estado, importe, proveedor_id: PROVEEDORES[proveedor].id, nombre_proveedor: PROVEEDORES[proveedor].nombre,
    id_fiscal: PROVEEDORES[proveedor].cif, divisa_id: "EUR", divisa_empresa_id: "EUR",
    cuenta_domiciliacion_id: `cbp${proveedor + 1}`, nombre_cuenta_domiciliacion: "Cuenta del proveedor", pagos,
});

const RECIBOS_COMPRA = [
    reciboCompra("rc1", "FR0000118-01", 0, 1019.2, "Emitido", -12, 18),
    reciboCompra("rc2", "FR0000119-01", 1, 726, "Emitido", -6, 24),
    reciboCompra("rc3", "FR0000120-01", 2, 423.5, "Emitido", -3, -1),
    reciboCompra("rc4", "FR0000112-01", 0, 2380, "Pagado", -40, -10, [pago("pg4", -10)]),
    reciboCompra("rc5", "FR0000114-01", 2, 381.15, "Pagado", -28, -7, [pago("pg5", -7)]),
    reciboCompra("rc6", "FR0000110-01", 1, 532.4, "Devuelto", -50, -20, [pago("pg6", -20), pago("pg7", -18, "Devolución")]),
];

type EstadoMovimiento = "pendiente" | "candidatos" | "conciliado" | "ignorado";

/** Movimientos de la cuenta principal (CB1), como llegan del banco conectado. */
const movimiento = (id: string, dias: number, importe: number, concepto: string, contraparte: string | null,
    estado: EstadoMovimiento, saldo: number, extra: Record<string, unknown> = {}) => ({
    id, conexion_id: "cx1", institucion_nombre: "Banco de Demostración", cuenta_conexion_id: "cc1",
    nombre_cuenta: "Cuenta corriente ···0001", cuenta_banco_id: "CB1", descripcion_cuenta_banco: "Cuenta principal",
    id_externo: `ext-${id}`, fecha: fecha(dias), fecha_valor: fecha(dias), importe, divisa: "EUR", concepto, contraparte,
    referencia: null, pendiente: false, estado, num_conciliaciones: estado === "candidatos" ? 1 : 0,
    probabilidad_maxima: estado === "candidatos" ? 0.92 : null, num_items_conciliacion: estado === "conciliado" ? 1 : 0,
    probabilidad: estado === "conciliado" ? 1 : null, origen_conciliacion: estado === "conciliado" ? "determinista" : null,
    justificacion: null, conciliado_por: estado === "conciliado" ? "demo" : null,
    conciliado_en: estado === "conciliado" ? fechaHora(dias + 1) : null, eliminado_en_banco: false,
    requiere_revision: false, subcuenta_banco_id: "5720000001", saldo_tras: saldo, ...extra,
});

const MOVIMIENTOS = [
    movimiento("mb1", -1, 1560, "TRANSFERENCIA FRUTAS MARTIN SL FV0000041", CLIENTES[0].nombre, "candidatos", 24873.45),
    movimiento("mb2", -2, -1019.2, "TRANSF. A SEMILLAS DEL LEVANTE SA", PROVEEDORES[0].nombre, "candidatos", 23313.45),
    movimiento("mb3", -3, -45.3, "COMISION MANTENIMIENTO CUENTA", "Banco de Demostración", "pendiente", 24332.65),
    movimiento("mb4", -4, 600, "INGRESO EFECTIVO TIENDA", null, "pendiente", 24377.95),
    movimiento("mb5", -4, 318.24, "TRANSFERENCIA RESTAURANTE EL PUERTO", CLIENTES[2].nombre, "conciliado", 23777.95,
        { justificacion: "Importe y referencia del recibo FV0000038-01" }),
    movimiento("mb6", -7, -381.15, "RECIBO TRANSPORTES RAPIDOS DEL SUR", PROVEEDORES[2].nombre, "conciliado", 23459.71),
    movimiento("mb7", -9, -12.1, "CUOTA TARJETA EMPRESA", "Banco de Demostración", "ignorado", 23840.86,
        { justificacion: "Se contabiliza a fin de mes" }),
];

const candidato = (recibo: { id: string; codigo: string; importe: number; fecha_vencimiento: string; estado: string },
    tipo: "cobro" | "pago", tercero: { nombre: string; cif: string }, encaje: "completo" | "parcial", dias: number) => ({
    tipo_recibo: tipo, tipo_conciliacion: tipo === "cobro" ? "cobrar_recibo_venta" : "pagar_recibo_compra", encaje,
    recibo_id: recibo.id, codigo: recibo.codigo, factura_codigo: recibo.codigo.slice(0, 9), tercero: tercero.nombre,
    id_fiscal: tercero.cif, importe: recibo.importe, fecha_vencimiento: recibo.fecha_vencimiento, estado: recibo.estado,
    dias_diferencia: dias,
});

const CANDIDATOS: Record<string, unknown[]> = {
    mb1: [
        candidato(RECIBOS_VENTA[0], "cobro", CLIENTES[0], "completo", 21),
        candidato(RECIBOS_VENTA[4], "cobro", CLIENTES[0], "parcial", 14),
    ],
    mb2: [candidato(RECIBOS_COMPRA[0], "pago", PROVEEDORES[0], "completo", 20)],
};

const reciboConciliacion = (r: { id: string; codigo: string; importe: number; fecha_vencimiento: string; estado: string;
    fecha_emision: string }, tercero: string, cobro: string | null) => ({
    id: r.id, codigo: r.codigo, tercero, importe: r.importe, fecha_vencimiento: r.fecha_vencimiento, estado: r.estado,
    fecha_emision: r.fecha_emision, fecha_cobro: cobro,
});

const conciliacion = (id: string, tipo: string, recibo: ReturnType<typeof reciboConciliacion>, probabilidad: number,
    justificacion: string) => ({
    id, probabilidad, origen: "determinista", justificacion,
    items: [{ tipo, params: { recibo_id: recibo.id, importe: recibo.importe }, recibo, cuota: null, remesa: null, asiento_id: null, asiento: null }],
});

const CONCILIACIONES: Record<string, unknown[]> = {
    mb1: [conciliacion("cj1", "cobrar_recibo_venta", reciboConciliacion(RECIBOS_VENTA[0], CLIENTES[0].nombre, null), 0.92,
        "Mismo importe y el concepto cita la factura FV0000041")],
    mb2: [conciliacion("cj2", "pagar_recibo_compra", reciboConciliacion(RECIBOS_COMPRA[0], PROVEEDORES[0].nombre, null), 0.88,
        "Mismo importe y mismo proveedor")],
};

const CONCILIACION_APLICADA: Record<string, unknown> = {
    mb5: conciliacion("cj3", "cobrar_recibo_venta", reciboConciliacion(RECIBOS_VENTA[2], CLIENTES[2].nombre, fecha(-4)), 1,
        "Importe y referencia del recibo FV0000038-01"),
    mb6: conciliacion("cj4", "pagar_recibo_compra", reciboConciliacion(RECIBOS_COMPRA[4], PROVEEDORES[2].nombre, fecha(-7)), 1,
        "Recibo domiciliado del proveedor"),
};

const PARTIDAS_HUERFANAS = [
    { idasiento: 812, fecha: fecha(-3), importe: -45.3, descripcion: "Comisión de mantenimiento", numero_asiento: "812" },
];

const cuadre = (cuenta: typeof CUENTAS[number], saldoBanco: number, saldoContable: number, sinConciliar: number,
    importeSinConciliar: number) => ({
    cuenta_id: `cc${cuenta.id.slice(2)}`, cuenta_banco_id: cuenta.id, nombre_cuenta: cuenta.descripcion,
    institucion: "Banco de Demostración", ultima_sincronizacion: fechaHora(0, "08:15:00"), saldo_banco: saldoBanco,
    saldo_contable: saldoContable, diferencia: Math.round((saldoBanco - saldoContable) * 100) / 100,
    bancario_sin_conciliar: sinConciliar, importe_sin_conciliar: importeSinConciliar, bancario_ignorado: 1,
    importe_ignorado: -12.1, requiere_revision: 0, banco_elimino_conciliado: 0, asiento_descuadrado: 0,
    partida_huerfana: 1, total_alertas: 1,
});

const idDe = (url: string, patron: RegExp): string => new URL(url, "http://demo").pathname.match(patron)?.[1] ?? "";

export const demo: DemoModulo = {
    pantallas: [
        { nombre: "Recibos de cobro", ruta: "/tesoreria/recibo_venta" },
        { nombre: "Recibos de pago", ruta: "/tesoreria/recibo_compra" },
        { nombre: "Cuentas bancarias", ruta: "/tesoreria/cuentas_bancarias" },
        { nombre: "Conciliación bancaria", ruta: "/tesoreria/cuentas_bancarias/CB1/conciliacion" },
    ],
    guia: "Cobra o devuelve un recibo y, en la conciliación, casa los movimientos del banco con sus recibos.",
    colecciones: {
        "tesoreria/recibo_cobro": RECIBOS_VENTA,
        "tesoreria/recibo_pago": RECIBOS_COMPRA,
        "tesoreria/cuentas_bancarias": CUENTAS,
        "tesoreria/movimiento_bancario": MOVIMIENTOS,
        "ventas/cliente": CLIENTES,
        "ventas/cliente/c1/cuenta_banco": cuentaTercero("cbc1", "Cuenta del cliente", "0101"),
        "ventas/cliente/c2/cuenta_banco": cuentaTercero("cbc2", "Cuenta del cliente", "0102"),
        "ventas/cliente/c3/cuenta_banco": cuentaTercero("cbc3", "Cuenta del cliente", "0103"),
        "ventas/cliente/c4/cuenta_banco": cuentaTercero("cbc4", "Cuenta del cliente", "0104"),
        "compras/proveedor/pv1/cuenta_banco": cuentaTercero("cbp1", "Cuenta del proveedor", "0201"),
        "compras/proveedor/pv2/cuenta_banco": cuentaTercero("cbp2", "Cuenta del proveedor", "0202"),
        "compras/proveedor/pv3/cuenta_banco": cuentaTercero("cbp3", "Cuenta del proveedor", "0203"),
    },
    fijas: [
        {
            metodo: "GET",
            ruta: "tesoreria/cuadre_bancario",
            cuerpo: { datos: { cuentas: [cuadre(CUENTAS[0], 24873.45, 24918.75, 4, 1095.5), cuadre(CUENTAS[1], 8120, 8120, 0, 0)] } },
        },
        { metodo: "GET", ruta: /^tesoreria\/cuadre_bancario\/[^/]+\/partidas_huerfanas$/, cuerpo: { datos: PARTIDAS_HUERFANAS } },
        {
            metodo: "GET",
            ruta: /^tesoreria\/movimiento_bancario\/[^/]+\/candidatos$/,
            cuerpo: ({ url }: { url: string }) => ({ datos: CANDIDATOS[idDe(url, /movimiento_bancario\/([^/]+)\//)] ?? [] }),
        },
        {
            metodo: "GET",
            ruta: /^tesoreria\/movimiento_bancario\/[^/]+\/conciliaciones$/,
            cuerpo: ({ url }: { url: string }) => ({ datos: CONCILIACIONES[idDe(url, /movimiento_bancario\/([^/]+)\//)] ?? [] }),
        },
        {
            metodo: "GET",
            ruta: /^tesoreria\/movimiento_bancario\/[^/]+\/conciliacion_aplicada$/,
            cuerpo: ({ url }: { url: string }) => ({ datos: CONCILIACION_APLICADA[idDe(url, /movimiento_bancario\/([^/]+)\//)] ?? null }),
        },
        {
            metodo: "GET",
            ruta: /^tesoreria\/movimiento_bancario\/[^/]+\/remesas$/,
            cuerpo: { datos: [] },
        },
        {
            metodo: "POST",
            ruta: "tesoreria/movimiento_bancario/sincronizar",
            cuerpo: {
                conexiones: 1, nuevos: 0, modificados: 0, eliminados: 0, conciliados: 0, con_candidatos: 0,
                conciliados_ia: 0, con_candidatos_ia: 0, errores: [], errores_conciliacion: [],
            },
        },
        {
            metodo: "POST",
            ruta: "tesoreria/movimiento_bancario/conciliar_automaticamente",
            cuerpo: { analizados: 4, conciliados: 0, con_candidatos: 2, consultas_ia: 0, conciliados_ia: 0, con_candidatos_ia: 0, errores: [] },
        },
        { metodo: "GET", ruta: /^tesoreria\/recibo_cobro\/[^/]+\/reembolso_pasarela$/, cuerpo: { datos: null } },
        // Acciones: se dan por hechas (la demo no recalcula estados).
        { metodo: "PATCH", ruta: /^tesoreria\/recibo_(cobro|pago)\/[^/]+\/(pagar|devolver|anular_pago|ordenar_pago)$/, cuerpo: {} },
        { metodo: "PATCH", ruta: /^tesoreria\/recibo_cobro\/[^/]+\/(agrupar|desagrupar)$/, cuerpo: { grupo_id: "rv8" } },
        { metodo: "PATCH", ruta: /^tesoreria\/movimiento_bancario\/[^/]+\/(conciliar|desconciliar|ignorar|reactivar)$/, cuerpo: {} },
    ],
};
