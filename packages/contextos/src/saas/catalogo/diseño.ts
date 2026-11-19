import { Entidad } from "@olula/lib/diseño.ts";
import { Plan, Precio } from "../plan/diseño.js";

export type TipoLimite = 'recuento' | 'consumo_mensual';
export type AlSuperar = 'bloquear' | 'avisar';

export interface LimiteCatalogo extends Entidad {
    id: string;
    nombre: string;
    unidad: string;
    tipo: TipoLimite;
    alSuperar: AlSuperar;
    umbralAviso: number;
    orden: number;
}

export interface ModuloCatalogo extends Entidad {
    id: string;
    nombre: string;
    descripcion: string;
    dependeDe: string[];
    precio: Precio;
    contratableSuelto: boolean;
    publico: boolean;
    /** Lo que aporta al activarse, por límite (p. ej. TPV aporta 1 punto TPV). */
    aporta: Record<string, number>;
    orden: number;
    /** contexto: bloquea sus reglas; plugin: variante del plugin por empresa; servicio: MCP, API… */
    categoria: CategoriaModulo;
    /** Solo plugins: nombre del plugin, variante que se usa al contratarlo y las instaladas. */
    plugin: string | null;
    variante: string | null;
    variantes: string[];
}

export type CategoriaModulo = "contexto" | "plugin" | "servicio";

export interface ExtraCatalogo extends Entidad {
    id: string;
    nombre: string;
    descripcion: string;
    limiteId: string | null;
    cantidad: number;
    requiereModulo: string | null;
    precio: Precio;
    recurrente: boolean;
    publico: boolean;
    activo: boolean;
    orden: number;
}

export type Catalogo = {
    limites: LimiteCatalogo[];
    modulos: ModuloCatalogo[];
    planes: Plan[];
    extras: ExtraCatalogo[];
};

/** Formularios (todo texto salvo las casillas) de las operaciones del catálogo. */
export type FormModulo = {
    nombre: string;
    descripcion: string;
    precioMensual: string;
    precioAnual: string;
    contratableSuelto: boolean;
    publico: boolean;
    /** Solo plugins. */
    variante: string;
    /** Una entrada por límite del catálogo: "aporta_<limite_id>". */
    [aporta: `aporta_${string}`]: string;
};

export type FormLimite = {
    id: string;
    nombre: string;
    unidad: string;
    tipo: TipoLimite;
    alSuperar: AlSuperar;
    umbralAviso: string;
    orden: string;
};

export type FormExtra = {
    id: string;
    nombre: string;
    descripcion: string;
    limiteId: string;
    cantidad: string;
    requiereModulo: string;
    precioMensual: string;
    precioAnual: string;
    recurrente: boolean;
    publico: boolean;
    activo: boolean;
    orden: string;
};

export interface GrupoIvaProducto {
    id: string;
    descripcion: string;
    /** Porcentaje como texto con punto decimal ("21.00"). */
    iva: string;
}

/** Ajustes globales del SaaS (GET/PUT /saas/ajustes). */
export interface AjustesSaas {
    /** Grupo de IVA de producto que llevan las cuotas. */
    ivaCuotas: string;
    gruposIvaProducto: GrupoIvaProducto[];
}
