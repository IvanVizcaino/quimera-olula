import { Entidad } from "@olula/lib/diseño.ts";

export type Precio = { mensual: string; anual: string };

export type ModoModulo = 'incluido' | 'extra' | 'no_disponible';
export type ModoMcp = 'lectura' | 'escritura';

export interface PlanModulo {
    moduloId: string;
    modo: ModoModulo;
    /** Precio especial del extra en este plan; null = el precio suelto del módulo. */
    precio: Precio | null;
    opciones: { mcpModo?: ModoMcp };
}

export interface PlanLimite {
    limiteId: string;
    /** null = ilimitado. */
    valor: number | null;
    ampliable: boolean;
}

export interface Plan extends Entidad {
    id: string;
    nombre: string;
    descripcion: string;
    precio: Precio;
    diasPrueba: number;
    publico: boolean;
    activo: boolean;
    destacado: boolean;
    orden: number;
    modulos: PlanModulo[];
    limites: PlanLimite[];
    /** Comprobaciones comerciales del backend (no bloquean). */
    avisos: string[];
}

export type NuevoPlan = {
    id: string;
    nombre: string;
};

export const MODULO_MCP = 'mcp';
