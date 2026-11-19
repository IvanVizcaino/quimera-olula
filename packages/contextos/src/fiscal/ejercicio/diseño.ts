import { Entidad, Modelo } from "@olula/lib/diseño.ts";

/** Fila de `secuencias` de una serie del ejercicio (formulario
 * secuenciasejercicios de Eneboo). `idsec` vacío: la secuencia del documento
 * aún no existe y se crea al guardarla. */
export interface SecuenciaSerie extends Entidad {
    id: string;
    idsec: number | null;
    nombre: string;
    descripcion: string;
    valor: number | null;
    valorout: number | null;
    valorini: number | null;
}

/** Lo que se puede cambiar de una secuencia (el nombre no). */
export interface DatosSecuencia extends Modelo {
    descripcion: string;
    valor: string;
    valorout: string;
    valorini: string;
}

export interface CambiosSecuencia {
    descripcion?: string;
    valor?: number | null;
    valorout?: number | null;
    valorini?: number | null;
}

/** Fila de `co_secuencias` del ejercicio (pestaña «Secuencias contabilidad»). */
export interface SecuenciaContabilidad extends Entidad {
    id: string;
    nombre: string;
    descripcion: string;
    valor: number | null;
    valorout: number | null;
}
