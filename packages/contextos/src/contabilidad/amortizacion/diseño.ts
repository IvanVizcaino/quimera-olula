import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type PeriodoAmortizacion = "Mensual" | "Trimestral" | "Semestral" | "Anual";
export type EstadoAmortizacion = "En Curso" | "Terminada" | "Suspendida" | "Cerrada";

/** Lo que informa el usuario en la ficha (Eneboo `co_amortizaciones.ui`). */
export interface DatosAmortizacion {
    elemento: string;
    grupoId: string;
    fecha: Date;
    fechaInicio: Date;
    valorAdquisicion: number;
    valorResidual: number;
    periodo: string;
    porcentajeAnual: number;
    porcentajePeriodo: number;
    amortizacionPeriodo: number;
    numPeriodos: number;
    bloqueado: boolean;
    noGenerarAsientoCierre: boolean;
    vendido: boolean;
    notas: string;
}

/** Ficha completa: los demás campos los calcula el servidor. */
export interface Amortizacion extends Entidad, DatosAmortizacion {
    id: string;
    estado: string;
    metodo: string;
    valorAmortizable: number;
    amortizacionPrimerPeriodo: number;
    amortizacionUltimoPeriodo: number;
    totalAmortizado: number;
    pendiente: number;
    descripcionGrupo: string;
    fechaCierre: Date | null;
    asientoCierreId: string | null;
    numeroAsientoCierre: number | null;
    ejercicioAsientoCierre: string;
    facturaVentaId: number | null;
    codigoFacturaVenta: string;
}

export type NuevaAmortizacion = Omit<
    DatosAmortizacion,
    "porcentajePeriodo" | "amortizacionPeriodo" | "numPeriodos" | "noGenerarAsientoCierre" | "vendido"
> & { id: string } & Modelo;

export type CambiosAmortizacion = Partial<DatosAmortizacion>;

export interface Dotacion extends Entidad {
    id: string;
    amortizacionId: string;
    fechaInicio: Date;
    fechaFin: Date;
    fecha: Date;
    importe: number;
    porcentaje: number;
    acumulado: number;
    resto: number;
    asientoId: string | null;
    numeroAsiento: number | null;
    ejercicioAsiento: string;
    noGenerarAsiento: boolean;
}

export interface NuevaDotacion extends Modelo {
    importe: number | null;
    fecha: Date | null;
    noGenerarAsiento: boolean;
}

export interface RegularizacionValor extends Entidad {
    id: string;
    amortizacionId: string;
    fecha: Date;
    descripcion: string;
    importe: number;
}

export interface NuevaRegularizacionValor extends Modelo {
    fecha: Date;
    descripcion: string;
    importe: number;
}

export interface PartidaCompra extends Entidad {
    id: string;
    asientoId: string;
    fecha: Date;
    codigoSubcuenta: string;
    concepto: string;
    debe: number;
    facturaId: string;
    codigoFactura: string;
    nombreProveedor: string;
}

export interface ResultadoGeneracion {
    totalDotaciones: number;
    importe: number;
    amortizaciones: {
        id: string;
        elemento: string;
        dotaciones: { fechaInicio: string; fechaFin: string; importe: number }[];
    }[];
}

/** Columnas del cuadro de amortizaciones (Eneboo `co_i_amortizaciones`). */
export interface ValoresInforme {
    costeInicio: number;
    adicion: number;
    venta: number;
    costeFin: number;
    amortizacionInicio: number;
    amortizacionPeriodo: number;
    ventaAmortizacionPeriodo: number;
    amortizacionFin: number;
    valorInicio: number;
    valorFin: number;
}

export interface LineaInforme extends ValoresInforme {
    id: string;
    amortizacionId: string;
    elemento: string;
}

export interface CuentaInforme {
    codigoCuenta: string;
    descripcion: string;
    lineas: LineaInforme[];
    total: ValoresInforme;
}

export interface InformeAmortizaciones {
    ejercicioId: string;
    fechaInicio: string;
    fechaFin: string;
    cuentas: CuentaInforme[];
    total: ValoresInforme;
}

export interface FiltroInforme extends Modelo {
    ejercicioId: string;
    grupoId: string;
    codigoCuenta: string;
    amortizacionId: string;
    descripcion: string;
}

export type GetAmortizaciones = (criteria: Criteria) => RespuestaLista<Amortizacion>;
export type GetAmortizacion = (id: string) => Promise<Amortizacion>;
