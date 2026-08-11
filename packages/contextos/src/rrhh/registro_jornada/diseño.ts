export * from "#/rrhh_comun/diseño.ts";

export type PatchAprobarJornada = (ids: string[]) => Promise<void>;

export type ResultadoVerificacionJornada = {
    verificada: boolean;
    totalEventos: number;
    eventosPrefirma: number;
    primerIdInvalido: number | null;
};

export type GetVerificarFirma = (desde: string | null) => Promise<ResultadoVerificacionJornada>;
