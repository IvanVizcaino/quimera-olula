import { Colecciones, PeticionDemo, Registro } from "../api_demo.ts";
import { DemoModulo } from "../diseño.ts";
import { AGENTES, ARTICULOS, CLIENTES, fechaHora } from "./comun.ts";

/**
 * Demo del TPV: la pantalla de venta funciona de verdad sobre datos en memoria. Se puede
 * crear una venta, añadir artículos (buscándolos o por código de barras: 8400000000011…),
 * cambiar cantidades, cobrar en efectivo o con tarjeta y emitir el tique; los totales y lo
 * pendiente se recalculan en cada paso.
 */

const PUNTO_VENTA = { id: "pv1", nombre: "Tienda Almería" };
const AGENTE = AGENTES[0];

/** Fruta y verdura al 4 %; envases al 21 %. */
const ivaDe = (familia: string) => (familia === "Envases" ? { grupo: "GEN", tipo: 21 } : { grupo: "SRED", tipo: 4 });

const redondear = (n: number) => Math.round(n * 100) / 100;

const linea = (id: string, referencia: string, cantidad: number) => {
    const a = ARTICULOS.find((x) => x.referencia === referencia)!;
    const iva = ivaDe(a.familia);
    return {
        id, referencia: a.referencia, descripcion: a.descripcion, descripcionArticulo: a.descripcion, cantidad,
        pvp_unitario: a.pvp, dto_porcentual: 0, dto_lineal: 0, pvp_total: redondear(a.pvp * cantidad),
        iva_incluido: false, grupo_iva_producto_id: iva.grupo, tipo_iva: iva.tipo, tipo_irpf: 0, tipo_recargo: 0,
        por_comision: 0, importe_comision: 0,
    };
};

type Linea = ReturnType<typeof linea>;

const pago = (id: string, importe: number, formaPago: string, dias: number) => ({
    id, importe, forma_pago: formaPago, fecha: fechaHora(dias, "11:20:00"), vale: null, saldo_vale: null,
    arqueo_id: dias === 0 ? "aq1" : "aq0", arqueo_abierto: dias === 0, tipo_tarjeta_id: formaPago === "TARJ" ? "VISA" : null,
});

const totales = (lineas: Linea[], pagado: number, dto = 0) => {
    const netoSinDto = redondear(lineas.reduce((s, l) => s + l.pvp_total, 0));
    const neto = redondear(netoSinDto * (1 - dto / 100));
    const iva = redondear(lineas.reduce((s, l) => s + l.pvp_total * (1 - dto / 100) * l.tipo_iva / 100, 0));
    const total = redondear(neto + iva);
    return {
        neto_sin_dto: netoSinDto, neto, total_iva: iva, total, total_divisa_empresa: total, total_irpf: 0, total_recargo: 0,
        pagado: redondear(pagado), pendiente: redondear(total - pagado), por_descuento: dto,
    };
};

const venta = (id: string, codigo: string, dias: number, lineas: Linea[], pagado: number, abierta: boolean, cliente = 4) => ({
    id, codigo, fecha: fechaHora(dias, "11:15:00"),
    cliente: { id: CLIENTES[cliente].id, nombre: CLIENTES[cliente].nombre, id_fiscal: CLIENTES[cliente].cif, direccion_id: "d1", direccion: { nombre_via: "Calle Mayor", numero: "1", cod_postal: "04001", ciudad: "Almería" } },
    agente_id: AGENTE.id, nombre_agente: AGENTE.nombre, divisa_id: "EUR", tasa_conversion: 1,
    forma_pago_id: "CONT", nombre_forma_pago: "Contado", grupo_iva_negocio_id: "NAC", observaciones: "",
    puntoVentaId: PUNTO_VENTA.id, puntoVenta: PUNTO_VENTA.nombre, agenteId: AGENTE.id, agente: AGENTE.nombre, abierta,
    ...totales(lineas, pagado),
});

type Cobro = { forma: "EFEC" | "TARJ"; dias: number } | null;

/** Ventas de partida: la primera sigue abierta; las demás se cobraron por su total exacto. */
const VENTAS: { id: string; codigo: string; dias: number; lineas: Linea[]; cobro: Cobro }[] = [
    { id: "t1", codigo: "T26-000124", dias: 0, lineas: [linea("l11", "TOM01", 2.5), linea("l12", "AGU01", 4), linea("l13", "LIM01", 1)], cobro: null },
    { id: "t2", codigo: "T26-000123", dias: 0, lineas: [linea("l21", "NAR01", 5), linea("l22", "CAJ01", 1)], cobro: { forma: "EFEC", dias: 0 } },
    { id: "t3", codigo: "T26-000122", dias: 0, lineas: [linea("l31", "PIM01", 1.5), linea("l32", "PEP01", 2)], cobro: { forma: "TARJ", dias: 0 } },
    { id: "t4", codigo: "T26-000121", dias: -1, lineas: [linea("l41", "TOM01", 3), linea("l42", "NAR01", 2), linea("l43", "AGU01", 6)], cobro: { forma: "TARJ", dias: -1 } },
    { id: "t5", codigo: "T26-000120", dias: -1, lineas: [linea("l51", "LIM01", 2)], cobro: { forma: "EFEC", dias: -1 } },
];

const colecciones: Colecciones = {
    "tpv/venta": [],
    "tpv/agente": AGENTES.map((a) => ({ ...a })),
    "tpv/punto_venta": [{ ...PUNTO_VENTA }, { id: "pv2", nombre: "Mercado central" }],
    "tpv/vale": [],
};

for (const x of VENTAS) {
    const total = totales(x.lineas, 0).total;
    const pagos = x.cobro ? [pago(`pg-${x.id}`, total, x.cobro.forma, x.cobro.dias)] : [];
    const v = venta(x.id, x.codigo, x.dias, x.lineas, x.cobro ? total : 0, x.cobro === null);
    colecciones["tpv/venta"].push(v as unknown as Registro);
    colecciones[`tpv/venta/${x.id}/lineas`] = x.lineas.map((l) => ({ ...l }));
    colecciones[`tpv/venta/${x.id}/pagos`] = pagos;
}

const arqueo = (id: string, dias: number, abierto: boolean, efectivo: number, tarjeta: number) => ({
    id, fechahora_apertura: fechaHora(dias, "09:00:00"), agente_apertura_id: AGENTE.id,
    fechahora_cierre: abierto ? null : fechaHora(dias, "20:30:00"), agente_cierre_id: abierto ? null : AGENTE.id,
    abierto, pagos_efectivo: efectivo, pagos_tarjeta: tarjeta, pagos_vale: 0,
    recuento_efectivo: abierto ? 0 : efectivo + 150, recuento_tarjeta: abierto ? 0 : tarjeta, recuento_vales: 0,
    recuento_caja: abierto ? {} : { "50": 2, "20": 4, "10": 3, "5": 2, "2": 5, "1": 8 },
    recuento_tipo_tarjeta: [{ tipo_tarjeta_id: "VISA", calculado: tarjeta, contado: abierto ? 0 : tarjeta }],
    movimiento_cierre: abierto ? 0 : -efectivo, efectivo_inicial: 150,
    movimientos: [{ id: `${id}m1`, importe: 150, fecha: fechaHora(dias, "09:00:00"), agente_id: AGENTE.id, agente: AGENTE.nombre }],
});

const ARQUEOS = [arqueo("aq1", 0, true, 6.68, 6.24), arqueo("aq0", -1, false, 3.33, 13.98), arqueo("aqm1", -2, false, 412.5, 896.3)];
colecciones["tpv/arqueo"] = ARQUEOS.map((a) => ({ ...a }));
colecciones["tpv/arqueo_items"] = ARQUEOS.map((a) => ({ ...a }));

// ---------------------------------------------------------------- comportamiento de la venta

const lineasDe = (c: Colecciones, id: string) => (c[`tpv/venta/${id}/lineas`] ??= []) as unknown as Linea[];
const pagosDe = (c: Colecciones, id: string) => (c[`tpv/venta/${id}/pagos`] ??= []) as unknown as ReturnType<typeof pago>[];

const recalcular = (c: Colecciones, id: string) => {
    const v = c["tpv/venta"].find((r) => r.id === id);
    if (!v) return;
    const pagado = pagosDe(c, id).reduce((s, p) => s + p.importe, 0);
    Object.assign(v, totales(lineasDe(c, id), pagado, Number(v.por_descuento ?? 0)));
};

const articuloDe = (cuerpo: unknown) => {
    const b = cuerpo as { articulo?: { articulo_id?: string; descripcion?: string }; barcode?: string };
    const ref = b.articulo?.articulo_id;
    return ARTICULOS.find((a) => (ref && a.referencia === ref) || (b.barcode && a.codbarras === b.barcode)) ?? null;
};

const nuevaLinea = ({ tramos, cuerpo, colecciones: c, nuevoId }: PeticionDemo) => {
    const id = tramos[2];
    const a = articuloDe(cuerpo);
    const cantidad = Number((cuerpo as { cantidad?: number }).cantidad ?? 1) || 1;
    if (!a) return { id: nuevoId() };
    const existente = lineasDe(c, id).find((l) => l.referencia === a.referencia);
    if (existente) {
        existente.cantidad = redondear(existente.cantidad + cantidad);
        existente.pvp_total = redondear(existente.pvp_unitario * existente.cantidad);
        recalcular(c, id);
        return { id: existente.id };
    }
    const l = linea(nuevoId(), a.referencia, cantidad);
    lineasDe(c, id).push(l);
    recalcular(c, id);
    return { id: l.id };
};

export const demo: DemoModulo = {
    pantallas: [
        { nombre: "Venta", ruta: "/tpv/venta" },
        { nombre: "Arqueos de caja", ruta: "/tpv/arqueo" },
    ],
    guia: "Abre la venta en curso, añade artículos (prueba el código 8400000000011), cobra y emite el tique.",
    almacenamiento: {
        "punto-venta-tpv-local": PUNTO_VENTA,
        "agente-tpv-local": AGENTE,
    },
    colecciones,
    fijas: [
        {
            metodo: "GET", ruta: "tpv/config",
            cuerpo: {
                datos: {
                    cliente_id: CLIENTES[4].id, forma_pago_efectivo_id: "EFEC", forma_pago_tarjeta_id: "TARJ",
                    forma_pago_vale_id: "VALE", serie_id: "T",
                    tipos_tarjeta: [{ id: "VISA", nombre: "Visa / Mastercard", defecto: true }, { id: "AMEX", nombre: "American Express", defecto: false }],
                },
            },
        },
        {
            // Nueva venta: vacía, abierta y del punto de venta de la demo.
            metodo: "POST", ruta: "tpv/venta",
            cuerpo: ({ colecciones: c }: PeticionDemo) => {
                const n = c["tpv/venta"].length + 120;
                const id = `t${n}`;
                c["tpv/venta"].unshift(venta(id, `T26-000${n + 5}`, 0, [], 0, true) as unknown as Registro);
                c[`tpv/venta/${id}/lineas`] = [];
                c[`tpv/venta/${id}/pagos`] = [];
                return { id };
            },
        },
        { metodo: "POST", ruta: /^tpv\/venta\/[^/]+\/(linea|linea_por_barcode)$/, cuerpo: nuevaLinea },
        {
            // Precio y totales de la línea antes de añadirla.
            metodo: "POST", ruta: /^tpv\/venta\/[^/]+\/nueva_linea$/,
            cuerpo: ({ cuerpo }: PeticionDemo) => {
                const a = articuloDe(cuerpo) ?? ARTICULOS[0];
                const cantidad = Number((cuerpo as { cantidad?: number }).cantidad ?? 1) || 1;
                const l = linea("nueva", a.referencia, cantidad);
                return { ...l, articulo_id: a.referencia };
            },
        },
        {
            metodo: "PATCH", ruta: /^tpv\/venta\/[^/]+\/linea\/[^/]+$/,
            cuerpo: ({ tramos, cuerpo, colecciones: c }: PeticionDemo) => {
                const l = lineasDe(c, tramos[2]).find((x) => x.id === tramos[4]);
                const cambios = (cuerpo as { cambios?: { cantidad?: number; pvp_unitario?: number; dto_porcentual?: number } }).cambios ?? {};
                if (l) {
                    if (cambios.cantidad !== undefined) l.cantidad = Number(cambios.cantidad);
                    if (cambios.pvp_unitario !== undefined) l.pvp_unitario = Number(cambios.pvp_unitario);
                    if (cambios.dto_porcentual !== undefined) l.dto_porcentual = Number(cambios.dto_porcentual);
                    l.pvp_total = redondear(l.pvp_unitario * l.cantidad * (1 - l.dto_porcentual / 100));
                    recalcular(c, tramos[2]);
                }
                return {};
            },
        },
        {
            metodo: "DELETE", ruta: /^tpv\/venta\/[^/]+\/linea\/[^/]+$/,
            cuerpo: ({ tramos, colecciones: c }: PeticionDemo) => {
                const lineas = lineasDe(c, tramos[2]);
                const i = lineas.findIndex((x) => x.id === tramos[4]);
                if (i >= 0) lineas.splice(i, 1);
                recalcular(c, tramos[2]);
                return {};
            },
        },
        {
            metodo: "POST", ruta: /^tpv\/venta\/[^/]+\/pago$/,
            cuerpo: ({ tramos, cuerpo, colecciones: c, nuevoId }: PeticionDemo) => {
                const b = cuerpo as { importe?: number; forma_pago?: string; tipo_tarjeta_id?: string | null };
                const v = c["tpv/venta"].find((r) => r.id === tramos[2]);
                const pendiente = Number(v?.pendiente ?? 0);
                const p = { ...pago(nuevoId(), Math.min(Number(b.importe ?? 0), pendiente), b.forma_pago ?? "EFEC", 0), tipo_tarjeta_id: b.tipo_tarjeta_id ?? null };
                pagosDe(c, tramos[2]).push(p);
                recalcular(c, tramos[2]);
                return { id: p.id };
            },
        },
        {
            metodo: "DELETE", ruta: /^tpv\/venta\/[^/]+\/pago\/[^/]+$/,
            cuerpo: ({ tramos, colecciones: c }: PeticionDemo) => {
                const pagos = pagosDe(c, tramos[2]);
                const i = pagos.findIndex((x) => x.id === tramos[4]);
                if (i >= 0) pagos.splice(i, 1);
                recalcular(c, tramos[2]);
                return {};
            },
        },
        {
            // Emitir: la venta deja de estar abierta (el tique en PDF no existe en la demo).
            metodo: "PATCH", ruta: /^ventas\/factura\/[^/]+\/emitir$/,
            cuerpo: ({ tramos, colecciones: c }: PeticionDemo) => {
                const v = c["tpv/venta"].find((r) => r.id === tramos[2]);
                if (v) v.abierta = false;
                return {};
            },
        },
        {
            metodo: "PATCH", ruta: /^tpv\/venta\/[^/]+$/,
            cuerpo: ({ tramos, cuerpo, colecciones: c }: PeticionDemo) => {
                const v = c["tpv/venta"].find((r) => r.id === tramos[2]);
                const b = cuerpo as { por_descuento?: number; agente_id?: string };
                if (v && b.por_descuento !== undefined) {
                    v.por_descuento = Number(b.por_descuento);
                    recalcular(c, tramos[2]);
                }
                return {};
            },
        },
    ],
};
