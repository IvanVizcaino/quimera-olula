export type ReglaClase = {
    min: number;
    clase: string;
};

export type ConfigVisualOportunidad = {
    diasVencePronto: number;
    reglasProbabilidad: ReglaClase[];
    reglasImportePorImporte: ReglaClase[];
    reglasImportePorProbabilidad: ReglaClase[];
};

const configPorDefecto: ConfigVisualOportunidad = {
    diasVencePronto: 7,
    reglasProbabilidad: [
        { min: 75, clase: "muyprobable" },
        { min: 50, clase: "probable" },
        { min: 0, clase: "improbable" },
    ],
    reglasImportePorImporte: [
        { min: 30000, clase: "importe-grande" },
        { min: 10000, clase: "importe-medio" },
        { min: 0, clase: "importe-pequeño" },
    ],
    reglasImportePorProbabilidad: [
        { min: 75, clase: "importe-alta" },
        { min: 50, clase: "importe-media" },
        { min: 0, clase: "importe-baja" },
    ],
};

let configActual: ConfigVisualOportunidad = configPorDefecto;

export const setConfigVisualOportunidad = (
    parcial: Partial<ConfigVisualOportunidad>
) => {
    configActual = {
        ...configActual,
        ...parcial,
    };
};

export const getConfigVisualOportunidad = (): ConfigVisualOportunidad =>
    configActual;

const resolverClase = (
    valor: number,
    reglas: ReglaClase[],
    fallback: string
): string => {
    const reglasOrdenadas = [...reglas].sort((a, b) => b.min - a.min);
    const regla = reglasOrdenadas.find((x) => valor >= x.min);
    return regla?.clase ?? fallback;
};

export const claseProbabilidadOportunidad = (probabilidad: number): string =>
    resolverClase(probabilidad, getConfigVisualOportunidad().reglasProbabilidad, "improbable");

export const claseImportePorImporte = (importe: number): string =>
    resolverClase(
        importe,
        getConfigVisualOportunidad().reglasImportePorImporte,
        "importe-pequeño"
    );

export const claseImportePorProbabilidad = (probabilidad: number): string =>
    resolverClase(
        probabilidad,
        getConfigVisualOportunidad().reglasImportePorProbabilidad,
        "importe-baja"
    );

export const estaVencePronto = (fechaCierre: Date | null | undefined): boolean => {
    if (!fechaCierre) return false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const cierre = new Date(fechaCierre);
    cierre.setHours(0, 0, 0, 0);

    const dias = Math.floor(
        (cierre.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );

    return dias >= 0 && dias <= getConfigVisualOportunidad().diasVencePronto;
};
