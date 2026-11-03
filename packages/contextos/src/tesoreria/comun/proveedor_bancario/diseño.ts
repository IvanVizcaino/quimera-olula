import { ReactElement } from "react";

/**
 * Contrato que debe implementar la UI de cada agregador bancario soportado
 * (Plaid, Wealth Reader...). Solo hay un proveedor activo por instalación (ver
 * `comun/banca.ts`); este registro permite que el resto de la aplicación
 * (conectar/reautenticar una conexión bancaria) sea agnóstico al proveedor.
 */
export type ConectarProveedorBancarioProps = {
    /** Lo que devolvió `POST tesoreria/conexion_bancaria/iniciar` para este proveedor. */
    datos: Record<string, unknown>;
    /** El widget del proveedor completó el flujo: lo que haya que mandar al backend. */
    onCompletado: (datos: Record<string, unknown>) => void;
    /** El usuario cerró o abandonó el widget del proveedor. */
    onCancelado: () => void;
};

export interface ProveedorBancarioUI {
    /**
     * Abre el widget del proveedor (un overlay propio como Plaid, que no pinta
     * nada aquí, o un iframe dentro de un modal como Wealth Reader) y traduce
     * su resultado a `onCompletado`/`onCancelado`.
     */
    Conectar: (props: ConectarProveedorBancarioProps) => ReactElement | null;
    /**
     * El proveedor cobra por producto leído: antes de conectar se eligen los
     * tipos de producto (cuentas, préstamos) que se leen de la conexión.
     */
    eligeTiposProducto?: boolean;
}

export type RegistroProveedoresBancarios = Record<string, ProveedorBancarioUI>;
