export type EstadoEjercicioContable = "ABIERTO" | "CERRADO" | string;

export interface ResultadoCierreEjercicio {
    ejercicioId: string;
    estado: EstadoEjercicioContable;
    idAsientoPyg: number | null;
    idAsientoCierre: number | null;
    idAsientoApertura: number | null;
}

export interface PayloadCerrarEjercicio {
    fecha: string;
    asientoPyg: boolean;
    asientoCierre: boolean;
    asientoApertura: boolean;
    ejercicioAperturaId?: string;
}

export interface FormCierreEjercicio {
    ejercicioId: string;
    fecha: string;
    asientoPyg: boolean;
    asientoCierre: boolean;
    asientoApertura: boolean;
    ejercicioAperturaId: string;
}

export type PatchCerrarEjercicio = (
    ejercicioId: string,
    payload: PayloadCerrarEjercicio
) => Promise<ResultadoCierreEjercicio>;

export type PatchReabrirEjercicio = (ejercicioId: string) => Promise<ResultadoCierreEjercicio>;

export type PatchCrearAsientoAperturaEjercicio = (
    ejercicioDestinoId: string,
    idAsientoCierre: number
) => Promise<ResultadoCierreEjercicio>;

export type PatchBorrarAsientoAperturaEjercicio = (
    ejercicioId: string
) => Promise<ResultadoCierreEjercicio>;
