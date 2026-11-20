import { Entidad, Modelo } from "@olula/lib/diseño.ts";

export type ModoPasarela = 'test' | 'live';

export interface CampoPasarela {
    id: string;
    nombre: string;
    secreto: boolean;
    ayuda: string;
}

export interface PruebaPasarela {
    ok: boolean;
    mensaje: string;
    fecha: string;
}

export interface Pasarela extends Entidad {
    id: string;
    nombre: string;
    activa: boolean;
    porDefecto: boolean;
    modo: ModoPasarela;
    /** Valores de los campos no secretos. */
    publica: Record<string, string>;
    ultimaPrueba: PruebaPasarela | null;
    /** Tipo de credencial que necesita ('stripe'); null si la pasarela no necesita credencial. */
    tipoCredencial: string | null;
    credencialId: string | null;
    /** El modo lo manda la credencial: la tarjeta lo muestra en solo lectura. */
    modoDesdeCredencial: boolean;
    /** Campos no secretos (las claves viven en las credenciales). */
    campos: CampoPasarela[];
    cobraSolo: boolean;
}

/** Borrador del formulario de una tarjeta. */
export interface FormPasarela extends Modelo {
    activa: boolean;
    porDefecto: boolean;
    modo: ModoPasarela;
    credencialId: string;
    valores: Record<string, string>;
}

export interface CambiosPasarela {
    activa: boolean;
    porDefecto: boolean;
    modo: ModoPasarela;
    publica: Record<string, string>;
    credencialId: string | null;
}

export interface ResumenCiclo {
    revisadas: number;
    cambios: number;
    errores: number;
}
