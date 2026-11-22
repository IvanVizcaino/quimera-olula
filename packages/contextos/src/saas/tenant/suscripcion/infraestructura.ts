import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { sinCuerpo } from "../../comun/infraestructura.js";
import ApiUrls from "../../comun/urls.js";
import { PlanApi, planDesdeApi } from "../../plan/infraestructura.js";
import {
    CambioPlan, CambioProgramado, DatosFiscales, CambiosSuscripcion, CuerpoExcepcion, Cuota, DatosSuscripcion, Derechos,
    EstadoFactura, EstadoSuscripcion, ExcepcionLimite, FacturaSuscripcion, LineaCuota, MandatoSepa,
    OrigenModulo, Periodicidad, SuscripcionTenant,
} from "./diseño.js";

interface CambioProgramadoApi {
    plan_id: string;
    periodicidad: Periodicidad;
    modulos?: string[];
    extras?: Record<string, number>;
}

interface SuscripcionApi {
    id: string;
    plan_id: string;
    periodicidad: Periodicidad;
    estado: EstadoSuscripcion;
    inicio_periodo: string;
    fin_periodo: string;
    fin_prueba: string | null;
    impagada_desde: string | null;
    cambio_programado: CambioProgramadoApi | null;
    cancelar_al_fin: boolean;
    pasarela_id: string | null;
    tiene_metodo_pago: boolean;
    descuento_pct: string;
    precio_fijado_hasta: string | null;
    notas: string;
    modulos?: string[];
    extras?: Record<string, number>;
}

interface LineaCuotaApi {
    tipo: string;
    ref_id: string;
    concepto: string;
    cantidad: number;
    precio_unitario: string;
    importe: string;
}

interface CuotaApi {
    periodicidad: Periodicidad;
    base: string;
    descuento: string;
    total: string;
    lineas: LineaCuotaApi[];
}

interface FacturaApi {
    id: string;
    periodo_desde: string;
    periodo_hasta: string;
    concepto: string;
    base: string;
    iva: string;
    total: string;
    estado: EstadoFactura;
    pasarela_id: string | null;
    factura_olula: string | null;
    url_pdf: string | null;
    error: string | null;
}

interface DerechosApi {
    modulos: { id: string; nombre: string; origen: OrigenModulo | null }[];
    limites: { id: string; nombre: string; unidad: string; tipo: string; valor: number | null; uso: number }[];
    opciones?: { mcp_modo?: string };
    solo_lectura?: boolean;
}

interface ExcepcionApi {
    limite_id: string;
    valor: number | null;
    motivo: string;
    hasta: string | null;
}

interface DatosFiscalesApi {
    grupo_iva_negocio_id: string;
    tipo_iva: string;
}

interface DatosSuscripcionApi {
    suscripcion: SuscripcionApi | null;
    plan: PlanApi | null;
    cuota: CuotaApi | null;
    cuota_programada: CuotaApi | null;
    derechos: DerechosApi | null;
    facturas?: FacturaApi[];
    pasarelas?: { id: string; nombre: string; por_defecto: boolean }[];
    mandato_sepa?: { referencia: string; titular: string; iban: string; fecha_firma: string } | null;
    excepciones?: ExcepcionApi[];
    datos_fiscales?: DatosFiscalesApi | null;
}

const urls = new ApiUrls();
const urlSuscripcion = (idTenant: string) => `${urls.TENANT}/${idTenant}/suscripcion`;

const cambioProgramadoDesdeApi = (c: CambioProgramadoApi): CambioProgramado => ({
    planId: c.plan_id,
    periodicidad: c.periodicidad,
    modulos: c.modulos ?? [],
    extras: c.extras ?? {},
});

export const suscripcionDesdeApi = (s: SuscripcionApi): SuscripcionTenant => ({
    id: s.id,
    planId: s.plan_id,
    periodicidad: s.periodicidad,
    estado: s.estado,
    inicioPeriodo: s.inicio_periodo ?? "",
    finPeriodo: s.fin_periodo ?? "",
    finPrueba: s.fin_prueba ?? null,
    impagadaDesde: s.impagada_desde ?? null,
    cambioProgramado: s.cambio_programado ? cambioProgramadoDesdeApi(s.cambio_programado) : null,
    cancelarAlFin: !!s.cancelar_al_fin,
    pasarelaId: s.pasarela_id ?? null,
    tieneMetodoPago: !!s.tiene_metodo_pago,
    descuentoPct: s.descuento_pct ?? "0.00",
    precioFijadoHasta: s.precio_fijado_hasta ?? null,
    notas: s.notas ?? "",
    modulos: s.modulos ?? [],
    extras: s.extras ?? {},
});

const lineaDesdeApi = (l: LineaCuotaApi, i: number): LineaCuota => ({
    id: `${l.tipo}_${l.ref_id}_${i}`,
    tipo: l.tipo,
    refId: l.ref_id,
    concepto: l.concepto,
    cantidad: l.cantidad,
    precioUnitario: l.precio_unitario,
    importe: l.importe,
});

export const cuotaDesdeApi = (c: CuotaApi | null | undefined): Cuota | null =>
    c ? {
        periodicidad: c.periodicidad,
        base: c.base,
        descuento: c.descuento,
        total: c.total,
        lineas: (c.lineas ?? []).map(lineaDesdeApi),
    } : null;

const derechosDesdeApi = (d: DerechosApi | null | undefined): Derechos | null =>
    d ? {
        modulos: (d.modulos ?? []).map((m) => ({ id: m.id, nombre: m.nombre, origen: m.origen ?? null })),
        limites: (d.limites ?? []).map((l) => ({
            id: l.id, nombre: l.nombre, unidad: l.unidad ?? "", tipo: l.tipo, valor: l.valor ?? null, uso: l.uso ?? 0,
        })),
        mcpModo: d.opciones?.mcp_modo ?? null,
        soloLectura: !!d.solo_lectura,
    } : null;

const facturaDesdeApi = (f: FacturaApi): FacturaSuscripcion => ({
    id: f.id,
    periodoDesde: f.periodo_desde ?? "",
    periodoHasta: f.periodo_hasta ?? "",
    concepto: f.concepto ?? "",
    base: f.base,
    iva: f.iva,
    total: f.total,
    estado: f.estado,
    pasarelaId: f.pasarela_id ?? null,
    facturaOlula: f.factura_olula ?? null,
    urlPdf: f.url_pdf ?? null,
    error: f.error ?? null,
});

const excepcionDesdeApi = (e: ExcepcionApi): ExcepcionLimite => ({
    id: e.limite_id,
    limiteId: e.limite_id,
    valor: e.valor ?? null,
    motivo: e.motivo ?? "",
    hasta: e.hasta ?? null,
});

export const datosFiscalesDesdeApi = (d: DatosFiscalesApi | null | undefined): DatosFiscales | null =>
    d ? { grupoIvaNegocioId: d.grupo_iva_negocio_id ?? "", tipoIva: d.tipo_iva ?? "" } : null;

const mandatoDesdeApi = (m: DatosSuscripcionApi["mandato_sepa"]): MandatoSepa | null =>
    m ? { referencia: m.referencia, titular: m.titular, iban: m.iban, fechaFirma: m.fecha_firma } : null;

export const datosSuscripcionDesdeApi = (d: DatosSuscripcionApi): DatosSuscripcion => ({
    suscripcion: d.suscripcion ? suscripcionDesdeApi(d.suscripcion) : null,
    plan: d.plan ? planDesdeApi(d.plan) : null,
    cuota: cuotaDesdeApi(d.cuota),
    cuotaProgramada: cuotaDesdeApi(d.cuota_programada),
    derechos: derechosDesdeApi(d.derechos),
    facturas: (d.facturas ?? []).map(facturaDesdeApi),
    pasarelas: (d.pasarelas ?? []).map((p) => ({ id: p.id, nombre: p.nombre, porDefecto: !!p.por_defecto })),
    mandatoSepa: mandatoDesdeApi(d.mandato_sepa),
    excepciones: (d.excepciones ?? []).map(excepcionDesdeApi),
    datosFiscales: datosFiscalesDesdeApi(d.datos_fiscales),
});

export const cambioPlanAApi = (c: CambioPlan) => ({
    plan_id: c.planId,
    periodicidad: c.periodicidad,
    modulos: c.modulos,
    extras: c.extras,
    con_prueba: c.conPrueba,
});

export const cambiosSuscripcionAApi = (c: CambiosSuscripcion): Record<string, unknown> => {
    const cuerpo: Record<string, unknown> = {};
    if (c.descuentoPct !== undefined) cuerpo.descuento_pct = c.descuentoPct;
    if (c.precioFijadoHasta !== undefined) cuerpo.precio_fijado_hasta = c.precioFijadoHasta;
    if (c.notas !== undefined) cuerpo.notas = c.notas;
    if (c.pasarelaId !== undefined) cuerpo.pasarela_id = c.pasarelaId;
    if (c.finPrueba !== undefined) cuerpo.fin_prueba = c.finPrueba;
    if (c.finPeriodo !== undefined) cuerpo.fin_periodo = c.finPeriodo;
    return cuerpo;
};

export const getSuscripcionTenant = async (idTenant: string): Promise<DatosSuscripcion> =>
    datosSuscripcionDesdeApi(await RestAPI.get<DatosSuscripcionApi>(urlSuscripcion(idTenant)));

export const postSuscripcionTenant = async (idTenant: string, cambio: CambioPlan): Promise<void> => {
    await RestAPI.query(urlSuscripcion(idTenant), cambioPlanAApi(cambio), "Error al cambiar el plan");
};

export const patchSuscripcionTenant = async (idTenant: string, cambios: CambiosSuscripcion): Promise<void> => {
    await RestAPI.patch(urlSuscripcion(idTenant), cambiosSuscripcionAApi(cambios), "Error al guardar las condiciones");
};

export const postEstadoSuscripcion = async (idTenant: string, estado: 'solo_lectura' | 'activa'): Promise<void> => {
    await RestAPI.query(`${urlSuscripcion(idTenant)}/estado`, { estado }, "Error al cambiar el estado de la suscripción");
};

export const putExcepcionLimite = async (
    idTenant: string, limiteId: string, cuerpo: CuerpoExcepcion
): Promise<void> => {
    await sinCuerpo(() => RestAPI.put(
        `${urls.TENANT}/${idTenant}/limite/${limiteId}`, cuerpo, "Error al guardar la excepción"
    ));
};

export const deleteExcepcionLimite = async (idTenant: string, limiteId: string): Promise<void> => {
    await sinCuerpo(() => RestAPI.delete(`${urls.TENANT}/${idTenant}/limite/${limiteId}`, "Error al quitar la excepción"));
};

export const postEstadoFactura = async (
    idFactura: string, estado: 'pagada' | 'devuelta' | 'anulada'
): Promise<void> => {
    await sinCuerpo(() => RestAPI.query(`${urls.FACTURA}/${idFactura}/estado`, { estado }, "Error al cambiar la factura"));
};

export const putDatosFiscales = async (idTenant: string, grupoIvaNegocioId: string): Promise<DatosFiscales> =>
    datosFiscalesDesdeApi(await RestAPI.put(
        `${urls.TENANT}/${idTenant}/datos_fiscales`,
        { grupo_iva_negocio_id: grupoIvaNegocioId },
        "Error al guardar los datos fiscales"
    ) as unknown as DatosFiscalesApi) as DatosFiscales;
