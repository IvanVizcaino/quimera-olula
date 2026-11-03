import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ConexionBancaria } from "../diseño.js";

/**
 * CONECTANDO activa el flujo de conexión (ver conectar_banco/ConectarBancoConexionBancaria.tsx),
 * que no muestra un modal propio: la UI la pone el widget del proveedor bancario activo.
 * REAUTENTICANDO hace lo mismo con una conexión que lo necesita, desde la lista o
 * las tarjetas de saldos (ver reautenticar/ReautenticarBancoConexionBancaria.tsx).
 */
export type EstadoMaestroConexionBancaria = 'INICIAL' | 'CONECTANDO' | 'REAUTENTICANDO';

export type ContextoMaestroConexionBancaria = {
    estado: EstadoMaestroConexionBancaria;
    conexiones: ListaActivaEntidades<ConexionBancaria>;
    conexionReautenticando: ConexionBancaria | null;
    /** Sube tras reautenticar: recarga los saldos y el detalle abierto. */
    refresco: number;
};
