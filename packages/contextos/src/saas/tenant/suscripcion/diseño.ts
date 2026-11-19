import { Entidad, Modelo } from "@olula/lib/diseño.ts";
import { Plan } from "../../plan/diseño.js";

export type EstadoSuscripcion = 'prueba' | 'activa' | 'impagada' | 'solo_lectura' | 'finalizada';
export type Periodicidad = 'mensual' | 'anual';
export type OrigenModulo = 'plan' | 'extra' | 'cortesia';
export type EstadoFactura = 'pendiente' | 'pagada' | 'devuelta' | 'anulada' | string;

export interface CambioProgramado {
    planId: string;
    periodicidad: Periodicidad;
    modulos: string[];
    extras: Record<string, number>;
}

export interface SuscripcionTenant {
    id: string;
    planId: string;
    periodicidad: Periodicidad;
    estado: EstadoSuscripcion;
    inicioPeriodo: string;
    finPeriodo: string;
    finPrueba: string | null;
    impagadaDesde: string | null;
    cambioProgramado: CambioProgramado | null;
    cancelarAlFin: boolean;
    pasarelaId: string | null;
    tieneMetodoPago: boolean;
    descuentoPct: string;
    precioFijadoHasta: string | null;
    notas: string;
    /** Módulos extra contratados. */
    modulos: string[];
    /** Extras contratados: id -> cantidad. */
    extras: Record<string, number>;
}

export interface LineaCuota extends Entidad {
    id: string;
    tipo: string;
    refId: string;
    concepto: string;
    cantidad: number;
    precioUnitario: string;
    importe: string;
}

export interface Cuota {
    periodicidad: Periodicidad;
    base: string;
    descuento: string;
    total: string;
    lineas: LineaCuota[];
}

export interface DerechoModulo {
    id: string;
    nombre: string;
    origen: OrigenModulo | null;
}

export interface DerechoLimite extends Entidad {
    id: string;
    nombre: string;
    unidad: string;
    tipo: string;
    /** null = ilimitado. */
    valor: number | null;
    uso: number;
}

export interface Derechos {
    modulos: DerechoModulo[];
    limites: DerechoLimite[];
    mcpModo: string | null;
    soloLectura: boolean;
}

export interface FacturaSuscripcion extends Entidad {
    id: string;
    periodoDesde: string;
    periodoHasta: string;
    concepto: string;
    base: string;
    iva: string;
    total: string;
    estado: EstadoFactura;
    pasarelaId: string | null;
    facturaOlula: string | null;
    urlPdf: string | null;
    error: string | null;
}

export interface PasarelaSuscripcion {
    id: string;
    nombre: string;
    porDefecto: boolean;
}

export interface MandatoSepa {
    referencia: string;
    titular: string;
    iban: string;
    fechaFirma: string;
}

export interface ExcepcionLimite extends Entidad {
    id: string;
    limiteId: string;
    /** null = ilimitado. */
    valor: number | null;
    motivo: string;
    hasta: string | null;
}

/** Respuesta de GET /saas/tenant/<id>/suscripcion. Con `suscripcion` null la empresa no tiene límites. */
export interface DatosSuscripcion {
    suscripcion: SuscripcionTenant | null;
    plan: Plan | null;
    cuota: Cuota | null;
    cuotaProgramada: Cuota | null;
    derechos: Derechos | null;
    facturas: FacturaSuscripcion[];
    pasarelas: PasarelaSuscripcion[];
    mandatoSepa: MandatoSepa | null;
    excepciones: ExcepcionLimite[];
    datosFiscales: DatosFiscales | null;
}

export interface DatosFiscales {
    grupoIvaNegocioId: string;
    /** IVA efectivo de la empresa, como texto ("21.00"). */
    tipoIva: string;
}

/** Lo que se envía al asignar o cambiar el plan (cambio inmediato, sin prorrateo). */
export interface CambioPlan {
    planId: string;
    periodicidad: Periodicidad;
    /** Solo módulos extra. */
    modulos: string[];
    extras: Record<string, number>;
    conPrueba: boolean;
}

export interface CambiosSuscripcion {
    descuentoPct?: string;
    /** '' = quitar. */
    precioFijadoHasta?: string;
    notas?: string;
    /** null = ninguna. */
    pasarelaId?: string | null;
    finPrueba?: string;
    finPeriodo?: string;
}

export interface FormCondiciones extends Modelo {
    descuentoPct: string;
    precioFijadoHasta: string;
    notas: string;
    pasarelaId: string;
    finPrueba: string;
    finPeriodo: string;
}

export interface FormExcepcion extends Modelo {
    limiteId: string;
    ilimitado: boolean;
    valor: string;
    motivo: string;
    hasta: string;
}

export interface CuerpoExcepcion {
    valor: number | null;
    motivo: string;
    hasta: string | null;
}
