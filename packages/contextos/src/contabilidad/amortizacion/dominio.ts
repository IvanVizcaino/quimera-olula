import { MetaModelo } from "@olula/lib/dominio.ts";
import {
    Amortizacion,
    NuevaAmortizacion,
    NuevaDotacion,
    NuevaRegularizacionValor,
    ResultadoGeneracion,
} from "./diseño.ts";

export const PERIODOS = [
    { valor: "Mensual", descripcion: "Mensual" },
    { valor: "Trimestral", descripcion: "Trimestral" },
    { valor: "Semestral", descripcion: "Semestral" },
    { valor: "Anual", descripcion: "Anual" },
];

export const ESTADOS = [
    { valor: "En Curso", descripcion: "En Curso" },
    { valor: "Terminada", descripcion: "Terminada" },
    { valor: "Suspendida", descripcion: "Suspendida" },
    { valor: "Cerrada", descripcion: "Cerrada" },
];

/** `codamortizacion` es varchar(6); vacío = contador automático. */
export const LONGITUD_CODIGO = 6;

export const amortizacionVacia = (): Amortizacion => ({
    id: "",
    elemento: "",
    grupoId: "",
    fecha: new Date(),
    fechaInicio: new Date(),
    valorAdquisicion: 0,
    valorResidual: 0,
    periodo: "Anual",
    porcentajeAnual: 0,
    porcentajePeriodo: 0,
    amortizacionPeriodo: 0,
    numPeriodos: 0,
    bloqueado: false,
    noGenerarAsientoCierre: false,
    vendido: false,
    notas: "",
    estado: "En Curso",
    metodo: "Lineal",
    valorAmortizable: 0,
    amortizacionPrimerPeriodo: 0,
    amortizacionUltimoPeriodo: 0,
    totalAmortizado: 0,
    pendiente: 0,
    descripcionGrupo: "",
    fechaCierre: null,
    asientoCierreId: null,
    numeroAsientoCierre: null,
    ejercicioAsientoCierre: "",
    facturaVentaId: null,
    codigoFacturaVenta: "",
});

export const nuevaAmortizacionVacia = (): NuevaAmortizacion => ({
    id: "",
    elemento: "",
    grupoId: "",
    fecha: new Date(),
    fechaInicio: new Date(),
    valorAdquisicion: 0,
    valorResidual: 0,
    periodo: "Anual",
    porcentajeAnual: 0,
    bloqueado: false,
    notas: "",
});

export const etiquetaAmortizacion = (a: Amortizacion): string =>
    a.elemento ? `${a.id} — ${a.elemento}` : a.id;

export const esCerrada = (a: Amortizacion): boolean => a.estado === "Cerrada";

/** Con dotaciones el plan ya no se cambia (el formulario de Eneboo lo bloquea). */
export const planBloqueado = (a: Amortizacion): boolean =>
    esCerrada(a) || a.totalAmortizado !== 0;

const camposFicha = {
    elemento: { requerido: true, maximo: 200 },
    grupoId: { requerido: true, tipo: "selector" as const },
    fecha: { requerido: true, tipo: "fecha" as const },
    fechaInicio: { requerido: true, tipo: "fecha" as const },
    valorAdquisicion: { requerido: true, tipo: "moneda" as const },
    valorResidual: { requerido: false, tipo: "moneda" as const },
    periodo: { requerido: true, tipo: "selector" as const },
    porcentajeAnual: { requerido: false, tipo: "decimal" as const, decimales: 2 },
    bloqueado: { tipo: "checkbox" as const },
    notas: { requerido: false },
};

export const metaAmortizacion: MetaModelo<Amortizacion> = {
    campos: {
        ...camposFicha,
        porcentajePeriodo: { requerido: false, tipo: "decimal", decimales: 4 },
        amortizacionPeriodo: { requerido: false, tipo: "moneda" },
        numPeriodos: { requerido: false, tipo: "entero" },
        noGenerarAsientoCierre: { tipo: "checkbox" },
        vendido: { tipo: "checkbox" },
    },
};

export const metaNuevaAmortizacion: MetaModelo<NuevaAmortizacion> = {
    campos: {
        id: { requerido: false, maximo: LONGITUD_CODIGO },
        ...camposFicha,
    },
    validacion: (m) =>
        m.fechaInicio >= m.fecha ||
        "La fecha de inicio no puede ser anterior a la de adquisición",
};

export const nuevaDotacionVacia = (): NuevaDotacion => ({
    importe: null,
    fecha: null,
    noGenerarAsiento: false,
});

export const metaNuevaDotacion: MetaModelo<NuevaDotacion> = {
    campos: {
        importe: { requerido: false, tipo: "moneda" },
        fecha: { requerido: false, tipo: "fecha" },
        noGenerarAsiento: { tipo: "checkbox" },
    },
};

export const nuevaRegularizacionVacia = (): NuevaRegularizacionValor => ({
    fecha: new Date(),
    descripcion: "",
    importe: 0,
});

export const metaNuevaRegularizacion: MetaModelo<NuevaRegularizacionValor> = {
    campos: {
        fecha: { requerido: true, tipo: "fecha" },
        descripcion: { requerido: false, maximo: 100 },
        importe: { requerido: true, tipo: "moneda" },
    },
};

/** Fecha límite por defecto del botón «Generar dotaciones»: el último día
 * del mes en curso (`pbnGenerar_clicked`). */
export const finDeMes = (hoy: Date = new Date()): Date =>
    new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 12);

export const esFinDeMes = (fecha: Date): boolean => {
    const siguiente = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 1, 12);
    return siguiente.getMonth() !== fecha.getMonth();
};

const importe = (valor: number): string =>
    valor.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** `muestraDotacionesRealizadas`: resumen de lo generado. */
export const resumenGeneracion = (r: ResultadoGeneracion): string => {
    if (r.totalDotaciones === 0) return "No es necesario generar dotaciones";
    if (r.totalDotaciones > 25) {
        return `Se han generado ${r.totalDotaciones} dotaciones por un total de ${importe(r.importe)}`;
    }
    return r.amortizaciones
        .map((a) =>
            [`Elemento: ${a.elemento}`]
                .concat(a.dotaciones.map((d) =>
                    `    Dotación: Desde ${d.fechaInicio} hasta ${d.fechaFin}. Importe: ${importe(d.importe)}`))
                .join("\n"))
        .join("\n");
};
