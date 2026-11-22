import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type FormatoHoja = "xlsx" | "ods";

/**
 * Ficha guardada del informe (Eneboo `co_i_patrimonio`). Los ejercicios
 * anteriores son opcionales: vacío significa que no se informan. El X-2 se
 * guarda, pero el cálculo de Eneboo no lo usa.
 */
export interface PatrimonioNeto extends Entidad {
    id: string;
    descripcion: string;
    ejercicioId: string;
    ejercicioAnteriorId: string;
    ejercicioAnteriorAnteriorId: string;
}

/** Componente del patrimonio neto: una columna del estado. */
export interface ColumnaPatrimonioNeto {
    clave: string;
    descripcion: string;
}

/** Saldo o movimiento: una fila del estado, con un importe por columna.
 * `nivel` es la sangría (0 saldos, 1 epígrafes, 2 desglose). */
export interface FilaPatrimonioNeto {
    clave: string;
    descripcion: string;
    nivel: number;
    importes: number[];
}

/** Tabla de 12 filas x 11 columnas que calcula `co_i_patrimonio.qs`. */
export interface EstadoPatrimonioNeto {
    ejercicioId: string;
    ejercicioAnteriorId: string;
    anyo: string;
    anyoAnterior: string;
    titulo: string;
    columnas: ColumnaPatrimonioNeto[];
    filas: FilaPatrimonioNeto[];
}

export interface NuevoPatrimonioNeto extends Modelo {
    descripcion: string;
    ejercicioId: string;
    ejercicioAnteriorId: string;
    ejercicioAnteriorAnteriorId: string;
}

export type CambiosPatrimonioNeto = Partial<
    Pick<
        PatrimonioNeto,
        | "descripcion"
        | "ejercicioId"
        | "ejercicioAnteriorId"
        | "ejercicioAnteriorAnteriorId"
    >
>;

export type GetListaPatrimonioNeto = (
    criteria: Criteria
) => RespuestaLista<PatrimonioNeto>;
export type GetPatrimonioNeto = (id: string) => Promise<PatrimonioNeto>;
export type GetDatosPatrimonioNeto = (
    id: string
) => Promise<EstadoPatrimonioNeto>;
export type PostPatrimonioNeto = (nuevo: NuevoPatrimonioNeto) => Promise<string>;
export type PatchPatrimonioNeto = (
    id: string,
    cambios: CambiosPatrimonioNeto
) => Promise<void>;
export type DeletePatrimonioNeto = (id: string) => Promise<void>;
export type GetReportPatrimonioNeto = (id: string) => Promise<Blob>;
export type GetHojaPatrimonioNeto = (
    id: string,
    formato: FormatoHoja
) => Promise<Blob>;
