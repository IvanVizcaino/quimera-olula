import { RespuestaFija } from "../api_demo.ts";
import { DemoModulo } from "../diseño.ts";
import { ALMACENES, ARTICULOS, fecha, FORMAS_PAGO, PROVEEDORES } from "./comun.ts";
import {
    CACHE_COMUN, CONFIG_ALMACEN, Cuerpo, DocumentoDemo, escapar, Fila, fijaAgregados, grafoTraza, grupoIvaArticulo, listar,
    nuevoId, Peticion, recalcularLinea, RecursoDemo, tramos,
} from "./ventas.ts";

/*
 * Demo de Compras: pedidos → albaranes → facturas de proveedor, y proveedores. Usa el motor
 * de documentos en memoria de la demo de Ventas (totales calculados a partir de las líneas).
 */

// ─── Proveedores ──────────────────────────────────────────────────────────────

/** Además de los comunes, dos agricultores que suministran la fruta y la verdura. */
const TODOS_PROVEEDORES = [
    ...PROVEEDORES,
    { id: "pv4", nombre: "Agrícola Campo de Níjar S.C.A.", cif: "F88888888", email: "pedidos@camponijar.ejemplo.test" },
    { id: "pv5", nombre: "Finca Los Naranjos S.L.", cif: "B99999999", email: "ventas@losnaranjos.ejemplo.test" },
];

const DATOS_PROVEEDOR: Record<string, { telefono: string; formaPago: string; ciudad: string; cp: string; provincia: string; via: string }> = {
    pv1: { telefono: "963 000 101", formaPago: "TRF30", ciudad: "Valencia", cp: "46001", provincia: "Valencia", via: "Calle de la Huerta, 8" },
    pv2: { telefono: "954 000 102", formaPago: "REC60", ciudad: "Sevilla", cp: "41001", provincia: "Sevilla", via: "Polígono La Isla, nave 14" },
    pv3: { telefono: "950 000 103", formaPago: "TRF30", ciudad: "Almería", cp: "04009", provincia: "Almería", via: "Avenida del Mediterráneo, 210" },
    pv4: { telefono: "950 000 104", formaPago: "TRF30", ciudad: "Níjar", cp: "04100", provincia: "Almería", via: "Paraje Los Grillos, s/n" },
    pv5: { telefono: "957 000 105", formaPago: "CONT", ciudad: "Palma del Río", cp: "14700", provincia: "Córdoba", via: "Carretera de la Vega, km 4" },
};

const proveedorDe = (id: unknown) => TODOS_PROVEEDORES.find((p) => p.id === id);
const nombreFormaPago = (id: unknown) => FORMAS_PAGO.find((f) => f.id === id)?.descripcion ?? null;
const nombreAlmacen = (id: unknown) => ALMACENES.find((a) => a.id === id)?.nombre ?? null;

const proveedor = (id: string, nombre: string, cif: string, email: string | null, extra: Cuerpo = {}): Fila => {
    const d = DATOS_PROVEEDOR[id];
    return {
        id, nombre, nombre_comercial: null, id_fiscal: cif, tipo_id_fiscal: "39", divisa_id: "EUR", divisa: "Euro",
        serie_id: "A", serie: "Serie A", grupo_iva_negocio_id: "NACIONAL", forma_pago_id: d?.formaPago ?? "CONT",
        forma_pago: nombreFormaPago(d?.formaPago ?? "CONT"), contacto_id: null, telefono1: d?.telefono ?? null, telefono2: null,
        email, web: null, observaciones: null, fecha_baja: null, de_baja: false,
        subcuenta_codigo: `4000000${id.slice(2)}`.slice(-10), subcuenta_id: null,
        cuenta_pago_id: id === "pv4" ? "cbp4" : null, cuenta_pago: id === "pv4" ? "Cuenta de la cooperativa" : null,
        ...extra,
    };
};

const proveedores = new RecursoDemo("compras/proveedor",
    TODOS_PROVEEDORES.map((p) => proveedor(p.id, p.nombre, p.cif, p.email)), {
    prefijo: "pv",
    alta: (c, id) => proveedor(id, String(c.nombre ?? ""), String(c.id_fiscal ?? ""), null, { tipo_id_fiscal: c.tipo_id_fiscal ?? "39" }),
    cambiar: (fila, cambios) => {
        const idFiscal = cambios.id_fiscal as { id?: string; tipo?: string } | undefined;
        return {
            ...fila, ...cambios, id: fila.id,
            ...(idFiscal ? { id_fiscal: idFiscal.id ?? fila.id_fiscal, tipo_id_fiscal: idFiscal.tipo ?? fila.tipo_id_fiscal } : {}),
            ...(cambios.forma_pago_id !== undefined ? { forma_pago: nombreFormaPago(cambios.forma_pago_id) } : {}),
        };
    },
});

/** Precio de compra de cada artículo según proveedor (coste, % dto). */
const ARTICULOS_PROVEEDOR: [string, string, number, number][] = [
    ["pv4", "TOM01", 0.9, 0], ["pv4", "PIM01", 1.1, 0], ["pv4", "PEP01", 0.5, 2],
    ["pv5", "NAR01", 0.45, 0], ["pv5", "LIM01", 0.7, 0], ["pv5", "AGU01", 0.5, 0],
    ["pv2", "CAJ01", 0.35, 5],
];

const articuloProveedor = ([proveedorId, articuloId, coste, dto]: typeof ARTICULOS_PROVEEDOR[number], i: number) => ({
    id: `ap${i + 1}`, articulo_id: articuloId, articulo: ARTICULOS.find((a) => a.id === articuloId)?.descripcion ?? "",
    proveedor_id: proveedorId, nombre_proveedor: proveedorDe(proveedorId)?.nombre ?? "", coste, divisa_id: "EUR", dto,
    ref_proveedor: `${proveedorId.toUpperCase()}-${articuloId}`, plazo: 2, uni_embalaje: articuloId === "CAJ01" ? 100 : 10,
    requiere_embalajes: false, por_defecto: true,
});

const subrecursosProveedor = Object.fromEntries(TODOS_PROVEEDORES.flatMap((p) => {
    const d = DATOS_PROVEEDOR[p.id];
    const [via, numero] = d.via.split(/,\s*/);
    return [
        [`compras/proveedor/${p.id}/direccion`, [{
            id: `dp${p.id}`, principal: true,
            direccion: {
                nombre_via: via, tipo_via: null, numero: numero ?? null, otros: null, cod_postal: d.cp, ciudad: d.ciudad,
                provincia_id: null, provincia: d.provincia, pais_id: "ES", pais: "España", apartado: null, telefono: d.telefono,
            },
        }]],
        [`compras/proveedor/${p.id}/cuenta_banco`, p.id === "pv4" ? [{
            id: "cbp4",
            cuenta: {
                descripcion: "Cuenta de la cooperativa", iban: "ES9100000000000000000104", bic: "DEMOESMMXXX",
                codigo_cuenta: "00000000000000000104", pais_id: "ES", entidad: "0000", agencia: "0000", digito_control: "00", cuenta: "0000000104",
            },
        }] : []],
        [`compras/proveedor/${p.id}/contacto`, [{
            id: `kp${p.id}`, nombre: `Atención comercial ${p.nombre.split(" ")[0]}`, cargo: "Comercial", email: p.email,
            telefono1: d.telefono, telefono2: null, observaciones: null,
        }]],
        [`compras/proveedor/${p.id}/articulo`, ARTICULOS_PROVEEDOR.map(articuloProveedor).filter((a) => a.proveedor_id === p.id)],
    ];
}));

// ─── Documentos ───────────────────────────────────────────────────────────────

/** Línea de partida: referencia de artículo (o descripción libre con su grupo de IVA), cantidad, coste y % dto. */
type LineaInicial = [string, number, number?, number?, string?];

const costeDe = (referencia: string) => ARTICULOS.find((a) => a.id === referencia)?.coste;

const lineasDe = (docCampo: string, docId: string, iniciales: LineaInicial[], extra: (i: number) => Cuerpo = () => ({})): Fila[] =>
    iniciales.map(([ref, cantidad, coste, dto = 0, grupo], i) => {
        const art = ARTICULOS.find((a) => a.id === ref);
        return recalcularLinea({
            id: nuevoId("lc"), [docCampo]: docId, referencia: art ? art.id : null, descripcion: art ? art.descripcion : ref,
            descripcion_articulo: art?.descripcion ?? null, cantidad, pvp_unitario: coste ?? costeDe(ref) ?? 0,
            dto_porcentual: dto, grupo_iva_producto_id: grupo ?? grupoIvaArticulo(art?.id ?? null), ...extra(i),
        });
    });

const AÑO = new Date().getFullYear();

/** Cabecera común de pedido, albarán y factura de proveedor (formato de la API). */
const cabecera = (id: string, prefijo: string, numero: number, proveedorId: string, dias: number, extra: Cuerpo = {}): Fila => {
    const p = proveedorDe(proveedorId)!;
    const formaPago = DATOS_PROVEEDOR[p.id]?.formaPago ?? "CONT";
    return {
        id, codigo: `${prefijo}${AÑO}A${String(numero).padStart(4, "0")}`, ejercicio_id: String(AÑO), serie_id: "A",
        numero: String(numero), fecha: fecha(dias), numero_proveedor: null, proveedor_id: p.id, nombre_proveedor: p.nombre,
        id_fiscal: p.cif, almacen_id: "ALM", nombre_almacen: nombreAlmacen("ALM"), forma_pago_id: formaPago,
        nombre_forma_pago: nombreFormaPago(formaPago), grupo_iva_negocio_id: "NACIONAL", divisa_id: "EUR", tasa_conversion: 1,
        recargo_financiero: 0, observaciones: null, ...extra,
    };
};

/** `proveedor: {proveedor_id} | {nombre, id_fiscal}` de altas y cambios. */
const datosProveedor = (p: Cuerpo | undefined): Cuerpo => {
    if (!p) return {};
    if (p.proveedor_id) {
        const reg = proveedorDe(p.proveedor_id);
        const formaPago = DATOS_PROVEEDOR[String(p.proveedor_id)]?.formaPago ?? "CONT";
        return {
            proveedor_id: p.proveedor_id, nombre_proveedor: reg?.nombre ?? "", id_fiscal: reg?.cif ?? "",
            forma_pago_id: formaPago, nombre_forma_pago: nombreFormaPago(formaPago),
        };
    }
    return { proveedor_id: null, nombre_proveedor: p.nombre ?? "", id_fiscal: p.id_fiscal ?? "" };
};

const cambiarCabecera = (fila: Fila, cambios: Cuerpo): Fila => {
    const { proveedor: cambioProveedor, divisa, ...resto } = cambios;
    const nueva: Fila = { ...fila, ...resto, ...datosProveedor(cambioProveedor as Cuerpo | undefined), id: fila.id };
    if (divisa) Object.assign(nueva, { divisa_id: (divisa as Cuerpo).id ?? "EUR", tasa_conversion: (divisa as Cuerpo).tasa_conversion ?? 1 });
    if (resto.forma_pago_id !== undefined) nueva.nombre_forma_pago = nombreFormaPago(resto.forma_pago_id);
    if (resto.almacen_id !== undefined) nueva.nombre_almacen = nombreAlmacen(resto.almacen_id);
    return nueva;
};

let numeros = { ped: 27, alb: 33, fac: 19 };
const alta = (prefijo: string, clave: keyof typeof numeros, extra: Cuerpo) => (c: Cuerpo, id: string): Fila => {
    numeros = { ...numeros, [clave]: numeros[clave] + 1 };
    const fila = cabecera(id, prefijo, numeros[clave], "pv1", 0, extra);
    return {
        ...fila, ...datosProveedor(c.proveedor as Cuerpo), fecha: c.fecha ?? fila.fecha,
        numero_proveedor: c.numero_proveedor ?? null, observaciones: c.observaciones ?? null,
        ...(c.almacen_id ? { almacen_id: c.almacen_id, nombre_almacen: nombreAlmacen(c.almacen_id) } : {}),
        ...(c.fecha_entrada ? { fecha_entrada: c.fecha_entrada } : {}),
        ...(c.de_abono ? { de_abono: true } : {}),
    };
};

/** Compras: el alta de líneas responde con los ids creados. */
const respuestaAlta = (creadas: Fila[]) => ({ lineas: creadas.map((l) => l.id) });
const coste = (a: typeof ARTICULOS[number]) => a.coste;

// Pedidos: «recibido» No / Parcial / Sí. cp4 se recibió a medias (ca3), cp5 y cp6 completos.
const L_PED: Record<string, LineaInicial[]> = {
    cp1: [["TOM01", 1200], ["PIM01", 600], ["PEP01", 500, undefined, 2]],
    cp2: [["NAR01", 2000], ["LIM01", 400]],
    cp3: [["CAJ01", 3000, undefined, 5]],
    cp4: [["TOM01", 1500], ["PEP01", 800, undefined, 2]],
    cp5: [["AGU01", 1200], ["NAR01", 1500]],
    cp6: [["CAJ01", 2000, undefined, 5]],
    cp7: [["Semilla tomate pera (sobre 1.000 ud)", 20, 18.5, 0, "REDUCIDO"]],
};
const RECIBIDO: Record<string, (i: number) => number> = {
    cp4: (i) => (i === 0 ? 1500 : 0),
    cp5: (i) => L_PED.cp5[i][1],
    cp6: (i) => L_PED.cp6[i][1],
};
const pedidos = new DocumentoDemo("compras/pedido", [
    cabecera("cp1", "PC", 27, "pv4", -1, { fecha_entrada: fecha(1), recibido: "No", numero_proveedor: "N-5512" }),
    cabecera("cp2", "PC", 26, "pv5", -2, { fecha_entrada: fecha(2), recibido: "No" }),
    cabecera("cp3", "PC", 25, "pv2", -4, { fecha_entrada: fecha(3), recibido: "No", observaciones: "Entregar en el muelle de envases." }),
    cabecera("cp4", "PC", 22, "pv4", -9, { fecha_entrada: fecha(-7), recibido: "Parcial" }),
    cabecera("cp5", "PC", 19, "pv5", -16, { fecha_entrada: fecha(-14), recibido: "Sí" }),
    cabecera("cp6", "PC", 20, "pv2", -14, { fecha_entrada: fecha(-12), recibido: "Sí" }),
    cabecera("cp7", "PC", 24, "pv1", -6, { fecha_entrada: fecha(8), recibido: "No" }),
], Object.fromEntries(Object.entries(L_PED).map(([id, l]) => [id, lineasDe("pedido_id", id, l, (i) => ({
    cantidad_recibida: RECIBIDO[id]?.(i) ?? 0, cerrada: false, por_lotes: false,
}))])), {
    prefijo: "cp", precio: coste, respuestaAlta,
    extraLinea: (docId) => ({ pedido_id: docId, cantidad_recibida: 0, cerrada: false, por_lotes: false }),
    alta: alta("PC", "ped", { fecha_entrada: fecha(3), recibido: "No" }),
    cambiar: cambiarCabecera,
});

// Albaranes: ca3 es la entrega parcial de cp4; ca4 y ca5 completan cp5 y cp6 y ya están facturados.
const L_ALB: Record<string, LineaInicial[]> = {
    ca1: [["PIM01", 400], ["PEP01", 300, undefined, 2]],
    ca2: [["LIM01", 350]],
    ca3: [L_PED.cp4[0]],
    ca4: L_PED.cp5,
    ca5: L_PED.cp6,
    ca6: [["Porte Níjar – Almacén central", 4, 85, 0, "GENERAL"]],
};
const ORIGEN_ALBARAN: Record<string, string> = { ca3: "cp4", ca4: "cp5", ca5: "cp6" };
const albaranes = new DocumentoDemo("compras/albaran", [
    cabecera("ca1", "AC", 33, "pv4", -1, { hora: "07:30:00", factura_id: null, pendiente_factura: true, numero_proveedor: "ALB-7781" }),
    cabecera("ca2", "AC", 32, "pv5", -3, { hora: "08:10:00", factura_id: null, pendiente_factura: true }),
    cabecera("ca3", "AC", 30, "pv4", -7, { hora: "07:45:00", factura_id: null, pendiente_factura: true, numero_proveedor: "ALB-7702" }),
    cabecera("ca4", "AC", 27, "pv5", -14, { hora: "09:00:00", factura_id: "cf3", pendiente_factura: false }),
    cabecera("ca5", "AC", 28, "pv2", -12, { hora: "10:30:00", factura_id: "cf4", pendiente_factura: false }),
    cabecera("ca6", "AC", 29, "pv3", -10, { hora: "18:00:00", factura_id: "cf5", pendiente_factura: false }),
], Object.fromEntries(Object.entries(L_ALB).map(([id, l]) => [id, lineasDe("albaran_id", id, l, () => ({
    pedido_id: ORIGEN_ALBARAN[id] ?? null, linea_pedido_id: null,
}))])), {
    prefijo: "ca", precio: coste, respuestaAlta,
    extraLinea: (docId) => ({ albaran_id: docId, pedido_id: null, linea_pedido_id: null }),
    alta: alta("AC", "alb", { hora: "09:00:00", factura_id: null, pendiente_factura: true }),
    cambiar: cambiarCabecera,
});

// Facturas: dos borradores y cuatro registradas (cf3, cf4 y cf5 vienen de albaranes).
const L_FAC: Record<string, LineaInicial[]> = {
    cf1: [["NAR01", 1800], ["AGU01", 600]],
    cf2: [["Semilla pimiento california (sobre 1.000 ud)", 15, 22, 0, "REDUCIDO"]],
    cf3: L_ALB.ca4,
    cf4: L_ALB.ca5,
    cf5: L_ALB.ca6,
    cf6: [["TOM01", 2200], ["PIM01", 900]],
};
const ORIGEN_FACTURA: Record<string, string> = { cf3: "ca4", cf4: "ca5", cf5: "ca6" };
const facturaCabecera = (id: string, numero: number, proveedorId: string, dias: number, estado: string, extra: Cuerpo = {}) =>
    cabecera(id, "FC", numero, proveedorId, dias, {
        hora: "12:00:00", rectificativa_id: null, codigo_rectificativa: null, de_abono: false, automatica: false,
        editable: estado === "BORRADOR", servicios: false, no_generar_asiento: false, inversion_sujeto_pasivo: false,
        asiento_id: null, estado_expedicion: estado, ...extra,
    });
const facturas = new DocumentoDemo("compras/factura", [
    facturaCabecera("cf1", 19, "pv5", 0, "BORRADOR", { numero_proveedor: "F-2026-0412" }),
    facturaCabecera("cf2", 18, "pv1", -2, "BORRADOR", { numero_proveedor: "SL/1188" }),
    facturaCabecera("cf3", 15, "pv5", -13, "REGISTRADA", { numero_proveedor: "F-2026-0377", automatica: true }),
    facturaCabecera("cf4", 16, "pv2", -11, "REGISTRADA", { numero_proveedor: "EA-90211", automatica: true }),
    facturaCabecera("cf5", 17, "pv3", -9, "REGISTRADA", { numero_proveedor: "TRS-3345", automatica: true, servicios: true }),
    facturaCabecera("cf6", 12, "pv4", -24, "REGISTRADA", { numero_proveedor: "N-5390" }),
], Object.fromEntries(Object.entries(L_FAC).map(([id, l]) => [id, lineasDe("factura_id", id, l, () => ({
    albaran_id: ORIGEN_FACTURA[id] ?? null,
    codigo_albaran: ORIGEN_FACTURA[id] ? albaranes.buscar(ORIGEN_FACTURA[id])?.codigo ?? null : null,
}))])), {
    prefijo: "cf", precio: coste, respuestaAlta,
    extraLinea: (docId) => ({ factura_id: docId, albaran_id: null, codigo_albaran: null }),
    alta: alta("FC", "fac", {
        hora: "12:00:00", rectificativa_id: null, codigo_rectificativa: null, de_abono: false, automatica: false, editable: true,
        servicios: false, no_generar_asiento: false, inversion_sujeto_pasivo: false, asiento_id: null, estado_expedicion: "BORRADOR",
    }),
    cambiar: cambiarCabecera,
});

// ─── Paso entre documentos y traza ────────────────────────────────────────────

const ENLACES: [string, string][] = [
    ["pedido_compra:cp4", "albaran_compra:ca3"], ["pedido_compra:cp5", "albaran_compra:ca4"],
    ["pedido_compra:cp6", "albaran_compra:ca5"], ["albaran_compra:ca4", "factura_compra:cf3"],
    ["albaran_compra:ca5", "factura_compra:cf4"], ["albaran_compra:ca6", "factura_compra:cf5"],
];

const TIPOS_TRAZA: Record<string, RecursoDemo> = { pedido_compra: pedidos, albaran_compra: albaranes, factura_compra: facturas };

const copiarLineas = (origen: Fila[], cantidad: (l: Fila) => number, extra: (l: Fila) => Cuerpo = () => ({})): Cuerpo[] =>
    origen.filter((l) => cantidad(l) > 0).map((l) => ({
        referencia: l.referencia, descripcion: l.descripcion, descripcion_articulo: l.descripcion_articulo, cantidad: cantidad(l),
        pvp_unitario: l.pvp_unitario, dto_porcentual: l.dto_porcentual, dto_lineal: l.dto_lineal,
        grupo_iva_producto_id: l.grupo_iva_producto_id, ...extra(l),
    }));

const derivar = (destino: DocumentoDemo, origen: Fila, lineas: Cuerpo[], extra: Cuerpo): Fila => {
    const id = nuevoId(destino.doc.prefijo);
    destino.guardar({ ...destino.crear({ proveedor: { proveedor_id: origen.proveedor_id }, fecha: fecha(0) }, id), ...extra });
    destino.anadir(id, lineas);
    return destino.buscar(id)!;
};

/** Recibe en un albarán las cantidades indicadas por línea de pedido (todo lo pendiente si no se indican). */
const albaranar = (ids: string[], cantidades?: Map<string, number>) => {
    const origen = ids.map((id) => pedidos.buscar(id)).filter((p): p is Fila => Boolean(p));
    if (origen.length === 0) return { albaran_id: "", codigo: "" };
    const pendiente = (l: Fila) =>
        cantidades?.get(l.id) ?? (l.cerrada ? 0 : Number(l.cantidad) - Number(l.cantidad_recibida ?? 0));
    const lineas = origen.flatMap((p) => copiarLineas(pedidos.lineasDe(p.id), pendiente, (l) => ({ pedido_id: p.id, linea_pedido_id: l.id })));
    const albaran = derivar(albaranes, origen[0], lineas, { factura_id: null, pendiente_factura: true });
    origen.forEach((p) => {
        const lineasPedido = pedidos.lineasDe(p.id);
        lineasPedido.forEach((l) => { l.cantidad_recibida = Number(l.cantidad_recibida ?? 0) + pendiente(l); });
        const completo = lineasPedido.every((l) => Number(l.cantidad_recibida) >= Number(l.cantidad));
        pedidos.guardar({ ...p, recibido: completo ? "Sí" : "Parcial" });
        ENLACES.push([`pedido_compra:${p.id}`, `albaran_compra:${albaran.id}`]);
    });
    return { albaran_id: albaran.id, codigo: albaran.codigo };
};

const acciones: RespuestaFija[] = [
    {
        metodo: "POST", ruta: "compras/albaran/desde-pedidos", cuerpo: ({ cuerpo }: Peticion) => {
            const c = (cuerpo ?? {}) as { pedido_ids?: string[]; lineas?: { linea_pedido_id: string; cantidad: number }[] };
            return albaranar(c.pedido_ids ?? [], c.lineas ? new Map(c.lineas.map((l) => [l.linea_pedido_id, Number(l.cantidad)])) : undefined);
        },
    },
    {
        metodo: "PATCH", ruta: /^compras\/pedido\/[^/]+\/albaranar$/, cuerpo: ({ url, cuerpo }: Peticion) => {
            const lineas = ((cuerpo as Cuerpo)?.lineas ?? []) as { id: string; cantidad: number }[];
            return albaranar([tramos(url).at(-2) ?? ""], new Map(lineas.map((l) => [l.id, Number(l.cantidad)])));
        },
    },
    {
        metodo: "POST", ruta: "compras/factura/desde-albaranes", cuerpo: ({ cuerpo }: Peticion) => {
            const ids = ((cuerpo as Cuerpo)?.albaran_ids ?? []) as string[];
            const origen = ids.map((id) => albaranes.buscar(id)).filter((a): a is Fila => Boolean(a));
            if (origen.length === 0) return { factura_id: "", codigo: "" };
            const lineas = origen.flatMap((a) => copiarLineas(albaranes.lineasDe(a.id), (l) => Number(l.cantidad),
                () => ({ albaran_id: a.id, codigo_albaran: a.codigo })));
            const factura = derivar(facturas, origen[0], lineas, { automatica: true });
            origen.forEach((a) => {
                albaranes.guardar({ ...a, factura_id: factura.id, pendiente_factura: false });
                ENLACES.push([`albaran_compra:${a.id}`, `factura_compra:${factura.id}`]);
            });
            return { factura_id: factura.id, codigo: factura.codigo };
        },
    },
    {
        metodo: "PATCH", ruta: /^compras\/factura\/[^/]+\/registrar$/, cuerpo: ({ url }: Peticion) => {
            const factura = facturas.buscar(tramos(url).at(-2) ?? "");
            if (factura) facturas.guardar({ ...factura, estado_expedicion: "REGISTRADA", editable: false });
            return {};
        },
    },
    {
        metodo: "PATCH", ruta: /^compras\/factura\/[^/]+\/rectificativa$/, cuerpo: ({ url, cuerpo }: Peticion) => {
            const factura = facturas.buscar(tramos(url).at(-2) ?? "");
            const rectificada = facturas.buscar(String((cuerpo as Cuerpo)?.rectificativa_id ?? ""));
            if (factura) facturas.guardar({ ...factura, rectificativa_id: rectificada?.id ?? null, codigo_rectificativa: rectificada?.codigo ?? null });
            return {};
        },
    },
    {
        // Recibos de pago: uno por factura registrada (las más antiguas, ya pagadas).
        metodo: "GET", ruta: /^tesoreria\/recibo_pago\/por_factura\/[^/]+$/, cuerpo: ({ url }: Peticion) => {
            const factura = facturas.buscar(tramos(url).at(-1) ?? "");
            if (!factura || factura.estado_expedicion !== "REGISTRADA") return { datos: [] };
            const dias = Math.round((Date.parse(String(factura.fecha)) - Date.now()) / 864e5);
            return {
                datos: [{
                    id: `rp${factura.id}`, factura_id: factura.id, codigo: `${factura.codigo}-1`, fecha_emision: factura.fecha,
                    fecha_vencimiento: fecha(dias + 30), estado: dias < -20 ? "Pagado" : "Emitido", importe: facturas.leer(factura).total,
                    proveedor_id: factura.proveedor_id, nombre_proveedor: factura.nombre_proveedor, id_fiscal: factura.id_fiscal,
                }],
            };
        },
    },
    ...Object.entries(TIPOS_TRAZA).map(([tipo, recurso]): RespuestaFija => ({
        metodo: "GET", ruta: new RegExp(`^${escapar(recurso.ruta)}/[^/]+/traza$`),
        cuerpo: ({ url }: Peticion) => ({
            datos: grafoTraza(`${tipo}:${tramos(url).at(-2)}`, ENLACES, TIPOS_TRAZA, (f) => ({
                proveedor_id: f.proveedor_id, nombre_proveedor: f.nombre_proveedor, recibido: f.recibido,
                estado: f.estado_expedicion ?? (f.pendiente_factura === undefined ? undefined : f.pendiente_factura ? "Pendiente de facturar" : "Facturado"),
            })),
        }),
    })),
];

// ─── Catálogo ─────────────────────────────────────────────────────────────────

const articulosCompra = ARTICULOS.map((a) => ({
    id: a.id, descripcion: a.descripcion, observaciones: null, familia_id: a.familia.toUpperCase(), descripcion_familia: a.familia,
    grupo_iva_producto_id: grupoIvaArticulo(a.id), sin_stock: false, se_compra: true,
}));

export const demo: DemoModulo = {
    pantallas: [
        { nombre: "Pedidos", ruta: "/compras/pedido" },
        { nombre: "Albaranes", ruta: "/compras/albaran" },
        { nombre: "Facturas", ruta: "/compras/factura" },
        { nombre: "Proveedores", ruta: "/compras/proveedor" },
    ],
    guia: "Abre un pedido a proveedor, añade una línea y recíbelo en un albarán; luego factúralo y regístralo.",
    colecciones: {
        "compras/articulo": articulosCompra,
        "compras/articulo-proveedor": ARTICULOS_PROVEEDOR.map(articuloProveedor),
        "almacen/almacen": ALMACENES,
        ...CACHE_COMUN,
        ...subrecursosProveedor,
    },
    fijas: [
        ...acciones,
        CONFIG_ALMACEN,
        { metodo: "GET", ruta: "compras/config", cuerpo: { datos: { actualizar_articulos_proveedor: "Albaranes de proveedor" } } },
        { metodo: "GET", ruta: "compras/articulo/tags", cuerpo: ({ url }: Peticion) => listar(articulosCompra, url) },
        {
            metodo: "GET", ruta: /^compras\/articulo\/[^/]+\/proveedor$/, cuerpo: ({ url }: Peticion) =>
                listar(ARTICULOS_PROVEEDOR.map(articuloProveedor).filter((a) => a.articulo_id === tramos(url).at(-2)), url),
        },
        ...pedidos.fijas(),
        ...albaranes.fijas(),
        ...facturas.fijas(),
        ...proveedores.fijas(),
        ...fijaAgregados({ "compras.pedido": pedidos, "compras.albaran": albaranes, "compras.factura": facturas, "compras.proveedor": proveedores }),
        // Marcar dirección principal o cuenta de pago: se da por hecho.
        { metodo: "PATCH", ruta: /^compras\/proveedor\/[^/]+\/(direccion\/[^/]+\/principal|cuenta_pago)$/, cuerpo: {} },
    ],
};
