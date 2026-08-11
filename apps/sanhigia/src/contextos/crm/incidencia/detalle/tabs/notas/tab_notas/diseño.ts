import { Nota } from "../diseño.ts";

export type EstadoNotas = "lista" | "creando" | "borrando";

export type ContextoNotas = {
    estado: EstadoNotas;
    notas: Nota[];
    cargando: boolean;
    incidenciaId: string;
    agenteId: string;
    notaSeleccionada?: Nota;
};
