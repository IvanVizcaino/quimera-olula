import { Remesa } from "./diseño.ts";

export const remesaConPago = (remesa: Remesa): boolean => remesa.pagos.length > 0;

export const remesaPagable = (remesa: Remesa): boolean =>
    !!remesa.id && !remesaConPago(remesa);

export type VarianteEstadoRemesa = "neutro" | "exito";

const VARIANTES_ESTADO_REMESA: Record<string, VarianteEstadoRemesa> = {
    emitida: "neutro",
    pagada: "exito",
};

export const varianteEstadoRemesa = (estado: string): VarianteEstadoRemesa =>
    VARIANTES_ESTADO_REMESA[estado.trim().toLowerCase()] ?? "neutro";
