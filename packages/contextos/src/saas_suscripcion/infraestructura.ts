import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { normalizarIban } from "@olula/lib/iban.ts";
import {
    Catalogo, Cuota, Derechos, ExtraCatalogo, Factura, GetCatalogo, GetMiSuscripcion, LimiteCatalogo,
    LimitePlan, MandatoSepa, MiSuscripcion, ModuloCatalogo, ModuloPlan, Objetivo, Periodicidad, PlanCatalogo,
    PostCambiar, PostCancelar, PostMandatoSepa, PostPagar, PostPortal, PostPresupuesto, PrecioPeriodo,
    Presupuesto, ResultadoCambio, ResultadoPago, Suscripcion,
} from "./diseño.ts";
import { normalizarObjetivo } from "./dominio.ts";

const URL_MI_SUSCRIPCION = "/saas/mi_suscripcion";
const URL_CATALOGO = "/saas/catalogo";

// ---------------------------------------------------------------- tipos API (snake_case)

interface PrecioApi { mensual: string; anual: string }

interface LimiteCatalogoApi {
    id: string; nombre: string; unidad: string; tipo: LimiteCatalogo["tipo"]; orden: number;
}

interface ModuloCatalogoApi {
    id: string; nombre: string; descripcion: string; depende_de: string[]; precio: PrecioApi;
    contratable_suelto: boolean; orden: number;
}

interface ModuloPlanApi {
    modulo_id: string; modo: ModuloPlan["modo"]; precio: PrecioApi | null; opciones: Record<string, string>;
}

interface LimitePlanApi { limite_id: string; valor: number | null; ampliable: boolean }

interface PlanApi {
    id: string; nombre: string; descripcion: string; precio: PrecioApi; dias_prueba: number;
    destacado: boolean; orden: number; modulos: ModuloPlanApi[]; limites: LimitePlanApi[];
}

interface ExtraApi {
    id: string; nombre: string; descripcion: string; limite_id: string | null; cantidad: number;
    requiere_modulo: string | null; precio: PrecioApi; orden: number;
}

export interface CatalogoApi {
    limites: LimiteCatalogoApi[]; modulos: ModuloCatalogoApi[]; planes: PlanApi[]; extras: ExtraApi[];
}

interface ObjetivoApi {
    plan_id: string; periodicidad: Periodicidad; modulos: string[]; extras: Record<string, number>;
}

interface LineaCuotaApi {
    tipo: string; ref_id: string; concepto: string; cantidad: number; precio_unitario: string; importe: string;
}

interface CuotaApi {
    periodicidad: Periodicidad; base: string; descuento: string; total: string; lineas: LineaCuotaApi[];
}

interface SuscripcionApi {
    id: string; plan_id: string; periodicidad: Periodicidad; estado: Suscripcion["estado"];
    inicio_periodo: string; fin_periodo: string; fin_prueba: string | null; impagada_desde: string | null;
    cambio_programado: ObjetivoApi | null; cancelar_al_fin: boolean; tiene_metodo_pago: boolean;
    descuento_pct: string; modulos: string[]; extras: Record<string, number>;
}

interface DerechosApi {
    modulos: { id: string; nombre: string; origen: string }[];
    limites: { id: string; nombre: string; unidad: string; tipo: LimiteCatalogo["tipo"]; valor: number | null; uso: number }[];
    solo_lectura: boolean;
}

interface FacturaApi {
    id: string; periodo_desde: string; periodo_hasta: string; concepto: string; base: string; iva: string;
    total: string; estado: string; factura_olula: string | null; url_pdf: string | null;
}

interface MandatoApi { referencia: string; titular: string; iban: string; fecha_firma: string }

interface MiSuscripcionApi {
    suscripcion: SuscripcionApi | null;
    plan: PlanApi | null;
    cuota: CuotaApi | null;
    cuota_programada: CuotaApi | null;
    derechos: DerechosApi;
    facturas: FacturaApi[];
    mandato_sepa: MandatoApi | null;
}

interface PresupuestoApi {
    objetivo: ObjetivoApi; cuota_actual: CuotaApi | null; cuota_nueva: CuotaApi; efecto: Presupuesto["efecto"];
    fecha_efecto: string; prorrateo: string; aplicable: boolean; avisos: string[];
    excesos: { limite_id: string; nombre: string; uso: number; limite: number }[];
}

// ---------------------------------------------------------------- mappers

const precioDesdeApi = (p: PrecioApi): PrecioPeriodo => ({ mensual: p.mensual, anual: p.anual });

export const objetivoDesdeApi = (o: ObjetivoApi): Objetivo =>
    normalizarObjetivo({ planId: o.plan_id, periodicidad: o.periodicidad, modulos: o.modulos ?? [], extras: o.extras ?? {} });

export const objetivoAApi = (objetivo: Objetivo): ObjetivoApi => {
    const o = normalizarObjetivo(objetivo);
    return { plan_id: o.planId, periodicidad: o.periodicidad, modulos: o.modulos, extras: o.extras };
};

export const planDesdeApi = (p: PlanApi): PlanCatalogo => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precio: precioDesdeApi(p.precio),
    diasPrueba: p.dias_prueba,
    destacado: p.destacado,
    orden: p.orden,
    modulos: p.modulos.map((m): ModuloPlan => ({
        moduloId: m.modulo_id, modo: m.modo, precio: m.precio ? precioDesdeApi(m.precio) : null, opciones: m.opciones ?? {},
    })),
    limites: p.limites.map((l): LimitePlan => ({ limiteId: l.limite_id, valor: l.valor, ampliable: l.ampliable })),
});

export const catalogoDesdeApi = (c: CatalogoApi): Catalogo => ({
    limites: c.limites.map((l): LimiteCatalogo => ({ id: l.id, nombre: l.nombre, unidad: l.unidad, tipo: l.tipo, orden: l.orden })),
    modulos: c.modulos.map((m): ModuloCatalogo => ({
        id: m.id, nombre: m.nombre, descripcion: m.descripcion, dependeDe: m.depende_de ?? [],
        precio: precioDesdeApi(m.precio), contratableSuelto: m.contratable_suelto, orden: m.orden,
    })),
    planes: c.planes.map(planDesdeApi),
    extras: c.extras.map((e): ExtraCatalogo => ({
        id: e.id, nombre: e.nombre, descripcion: e.descripcion, limiteId: e.limite_id, cantidad: e.cantidad,
        requiereModulo: e.requiere_modulo, precio: precioDesdeApi(e.precio), orden: e.orden,
    })),
});

export const cuotaDesdeApi = (c: CuotaApi): Cuota => ({
    periodicidad: c.periodicidad,
    base: c.base,
    descuento: c.descuento,
    total: c.total,
    lineas: c.lineas.map((l) => ({
        tipo: l.tipo, refId: l.ref_id, concepto: l.concepto, cantidad: l.cantidad,
        precioUnitario: l.precio_unitario, importe: l.importe,
    })),
});

export const suscripcionDesdeApi = (s: SuscripcionApi): Suscripcion => ({
    id: s.id,
    planId: s.plan_id,
    periodicidad: s.periodicidad,
    estado: s.estado,
    inicioPeriodo: s.inicio_periodo,
    finPeriodo: s.fin_periodo,
    finPrueba: s.fin_prueba,
    impagadaDesde: s.impagada_desde,
    cambioProgramado: s.cambio_programado ? objetivoDesdeApi(s.cambio_programado) : null,
    cancelarAlFin: s.cancelar_al_fin,
    tieneMetodoPago: s.tiene_metodo_pago,
    descuentoPct: s.descuento_pct,
    modulos: s.modulos ?? [],
    extras: s.extras ?? {},
});

const derechosDesdeApi = (d: DerechosApi): Derechos => ({
    modulos: d.modulos,
    limites: d.limites,
    soloLectura: d.solo_lectura,
});

export const facturaDesdeApi = (f: FacturaApi): Factura => ({
    id: f.id,
    periodoDesde: f.periodo_desde,
    periodoHasta: f.periodo_hasta,
    concepto: f.concepto,
    base: f.base,
    iva: f.iva,
    total: f.total,
    estado: f.estado,
    numeroFactura: f.factura_olula,
    urlPdf: f.url_pdf,
});

const mandatoDesdeApi = (m: MandatoApi): MandatoSepa => ({
    referencia: m.referencia, titular: m.titular, iban: m.iban, fechaFirma: m.fecha_firma,
});

export const miSuscripcionDesdeApi = (r: MiSuscripcionApi): MiSuscripcion => ({
    suscripcion: r.suscripcion ? suscripcionDesdeApi(r.suscripcion) : null,
    plan: r.plan ? planDesdeApi(r.plan) : null,
    cuota: r.cuota ? cuotaDesdeApi(r.cuota) : null,
    cuotaProgramada: r.cuota_programada ? cuotaDesdeApi(r.cuota_programada) : null,
    derechos: derechosDesdeApi(r.derechos),
    facturas: (r.facturas ?? []).map(facturaDesdeApi),
    mandatoSepa: r.mandato_sepa ? mandatoDesdeApi(r.mandato_sepa) : null,
});

export const presupuestoDesdeApi = (p: PresupuestoApi): Presupuesto => ({
    objetivo: objetivoDesdeApi(p.objetivo),
    cuotaActual: p.cuota_actual ? cuotaDesdeApi(p.cuota_actual) : null,
    cuotaNueva: cuotaDesdeApi(p.cuota_nueva),
    efecto: p.efecto,
    fechaEfecto: p.fecha_efecto,
    prorrateo: p.prorrateo,
    aplicable: p.aplicable,
    avisos: p.avisos ?? [],
    excesos: (p.excesos ?? []).map((e) => ({ limiteId: e.limite_id, nombre: e.nombre, uso: e.uso, limite: e.limite })),
});

// ---------------------------------------------------------------- llamadas

export const getMiSuscripcion: GetMiSuscripcion = async () =>
    miSuscripcionDesdeApi(await RestAPI.get<MiSuscripcionApi>(URL_MI_SUSCRIPCION, "Error al cargar la suscripción"));

export const getCatalogo: GetCatalogo = async () =>
    catalogoDesdeApi(await RestAPI.get<CatalogoApi>(URL_CATALOGO, "Error al cargar los planes"));

export const postPresupuesto: PostPresupuesto = async (objetivo) =>
    presupuestoDesdeApi(await RestAPI.query<{ objetivo: ObjetivoApi }, PresupuestoApi>(
        `${URL_MI_SUSCRIPCION}/presupuesto`, { objetivo: objetivoAApi(objetivo) }, "Error al calcular el presupuesto"));

export const postCambiar: PostCambiar = async (objetivo): Promise<ResultadoCambio> => {
    const r = await RestAPI.query<{ objetivo: ObjetivoApi }, {
        suscripcion: SuscripcionApi; presupuesto: PresupuestoApi; requiere_pago: boolean;
    }>(`${URL_MI_SUSCRIPCION}/cambiar`, { objetivo: objetivoAApi(objetivo) }, "Error al cambiar de plan");
    return {
        suscripcion: suscripcionDesdeApi(r.suscripcion),
        presupuesto: presupuestoDesdeApi(r.presupuesto),
        requierePago: r.requiere_pago,
    };
};

export const postPagar: PostPagar = async (urlOk, urlCancelado): Promise<ResultadoPago> => {
    const r = await RestAPI.query<{ url_ok: string; url_cancelado: string }, {
        url: string | null; pasarela_id: string; necesita_mandato: boolean;
    }>(`${URL_MI_SUSCRIPCION}/pagar`, { url_ok: urlOk, url_cancelado: urlCancelado }, "Error al iniciar el pago");
    return { url: r.url, pasarelaId: r.pasarela_id, necesitaMandato: r.necesita_mandato };
};

export const postMandatoSepa: PostMandatoSepa = async (mandato) => {
    await RestAPI.query(`${URL_MI_SUSCRIPCION}/mandato_sepa`,
        { titular: mandato.titular.trim(), iban: normalizarIban(mandato.iban) },
        "Error al guardar la domiciliación");
};

export const postPortal: PostPortal = async (urlVuelta) => {
    const r = await RestAPI.query<{ url_vuelta: string }, { url: string | null }>(
        `${URL_MI_SUSCRIPCION}/portal`, { url_vuelta: urlVuelta }, "Error al abrir el portal de pagos");
    return r.url;
};

export const postCancelar: PostCancelar = async (cancelar) => {
    await RestAPI.query(`${URL_MI_SUSCRIPCION}/cancelar`, { cancelar },
        cancelar ? "Error al cancelar la suscripción" : "Error al reanudar la suscripción");
};
